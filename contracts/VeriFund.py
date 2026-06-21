import genlayer.std.equator_plugin as eq
from genlayer import *

@dataclass
class Milestone:
    description: str
    target_amount: int
    current_funding: int
    is_verified: bool
    proof_url: str

class VeriFund(Contract):
    def __init__(self, owner: str):
        self.owner = owner
        self.projects = dict()  # project_id -> Milestone
        self.project_count = 0
        self.balances = dict()  # project_id -> int

    def create_project(self, description: str, target_amount: int) -> int:
        project_id = self.project_count
        self.projects[project_id] = Milestone(
            description=description,
            target_amount=target_amount,
            current_funding=0,
            is_verified=False,
            proof_url=""
        )
        self.balances[project_id] = 0
        self.project_count += 1
        return project_id

    def fund_project(self, project_id: int, amount: int):
        assert project_id < self.project_count, "Project does not exist"
        assert not self.projects[project_id].is_verified, "Project already completed"
        
        self.projects[project_id].current_funding += amount
        self.balances[project_id] += amount

    def verify_milestone(self, project_id: int, proof_url: str) -> bool:
        assert project_id < self.project_count, "Project does not exist"
        project = self.projects[project_id]
        assert not project.is_verified, "Milestone already verified"
        
        # 1. Fetch real-world proof
        web_data = get_webpage(proof_url)
        
        # 2. Use LLM to verify if the real-world proof meets the milestone criteria
        prompt = f"""
        You are an AI verifier for a decentralized milestone crowdfunding platform.
        The founders promised the following milestone: "{project.description}"
        
        They have provided the following web page as proof:
        URL: {proof_url}
        Content Snippet: {web_data[:2000]}
        
        Based on the provided content, does it definitively prove that the milestone has been met? 
        Answer exclusively with "YES" or "NO".
        """
        
        result = exec_prompt(prompt)
        
        # 3. Equivalence Principle handles consensus across validators
        # If the consensus is YES, we mark it verified and can theoretically release funds.
        if result.strip().upper() == "YES":
            self.projects[project_id].is_verified = True
            self.projects[project_id].proof_url = proof_url
            return True
            
        return False
        
    def withdraw_funds(self, project_id: int):
        assert project_id < self.project_count, "Project does not exist"
        assert self.projects[project_id].is_verified, "Milestone not yet verified by AI"
        
        # Emulate fund transfer
        amount = self.balances[project_id]
        self.balances[project_id] = 0
        return amount
