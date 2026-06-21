# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *
from dataclasses import dataclass

@allow_storage
@dataclass
class Milestone:
    description: str
    target_amount: str
    current_funding: str
    is_verified: str
    proof_url: str

class VeriFund(gl.Contract):
    owner: str
    projects: TreeMap[str, Milestone]
    balances: TreeMap[str, str]
    project_count: str

    def __init__(self, owner: str):
        self.owner = owner
        self.project_count = "0"

    @gl.public.view
    def get_project(self, project_id: str) -> Milestone:
        return self.projects[project_id]

    @gl.public.write
    def create_project(self, description: str, target_amount: str) -> str:
        project_id = self.project_count
        self.projects[project_id] = Milestone(
            description=description,
            target_amount=target_amount,
            current_funding="0",
            is_verified="false",
            proof_url=""
        )
        self.balances[project_id] = "0"
        
        # Increment project count as string
        next_count = int(self.project_count) + 1
        self.project_count = str(next_count)
        
        return project_id

    @gl.public.write
    def fund_project(self, project_id: str, amount: str):
        # We need to make sure project_id is in projects
        assert self.projects[project_id].is_verified == "false", "Project already completed"
        
        # Update funding amount
        current_f = int(self.projects[project_id].current_funding)
        current_f += int(amount)
        self.projects[project_id].current_funding = str(current_f)
        
        # Update balance
        current_b = int(self.balances[project_id])
        current_b += int(amount)
        self.balances[project_id] = str(current_b)

    @gl.public.write
    def verify_milestone(self, project_id: str, proof_url: str) -> str:
        project = self.projects[project_id]
        assert project.is_verified == "false", "Milestone already verified"
        
        desc = project.description
        
        def leader_fn() -> str:
            # Nondeterministic block: Fetch real-world proof
            response = gl.nondet.web.get(proof_url)
            web_data = response.body.decode("utf-8")
            
            prompt = f"""
            You are an AI verifier for a decentralized milestone crowdfunding platform.
            The founders promised the following milestone: "{desc}"
            
            They have provided the following web page as proof:
            URL: {proof_url}
            Content Snippet: {web_data[:2000]}
            
            Based on the provided content, does it definitively prove that the milestone has been met? 
            Answer exclusively with "YES" or "NO".
            """
            return gl.nondet.exec_prompt(prompt)

        def validator_fn(leader_result: str) -> bool:
            # Validators run the same prompt to check if they reach the same logical conclusion
            my_result = leader_fn()
            
            leader_says_yes = "YES" in leader_result.strip().upper()
            validator_says_yes = "YES" in my_result.strip().upper()
            
            # The Equivalence Principle: We agree if both AI nodes reached the same YES/NO conclusion!
            return leader_says_yes == validator_says_yes

        # Execute using GenVM's Equivalence Principle
        agreed_result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        
        # If the network reached consensus that the answer is YES
        if "YES" in agreed_result.strip().upper():
            self.projects[project_id].is_verified = "true"
            self.projects[project_id].proof_url = proof_url
            return "true"
            
        return "false"
        
    @gl.public.write
    def withdraw_funds(self, project_id: str) -> str:
        assert self.projects[project_id].is_verified == "true", "Milestone not yet verified by AI"
        
        amount = self.balances[project_id]
        self.balances[project_id] = "0"
        return amount
