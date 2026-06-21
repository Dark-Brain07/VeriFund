"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldCheck, Target, Wallet, CheckCircle2, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

// Initialize a generic read-only client, upgraded later when wallet connects
let client = createClient({
  chain: testnetBradbury,
});

const CONTRACT_ADDRESS = "0x27f2682A5a738Ac548BAf89a2c44bD02B489dDa7";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [proofUrlInput, setProofUrlInput] = useState<Record<string, string>>({});
  const [fundAmount, setFundAmount] = useState<Record<string, string>>({});
  
  // New Project State
  const [newDesc, setNewDesc] = useState("");
  const [newTarget, setNewTarget] = useState("");
  
  // Projects state
  const [projects, setProjects] = useState<any[]>([]);

  // Fetch live projects
  const fetchProjects = async () => {
    try {
      const loaded = [];
      // We will blindly try to fetch project 0 to 10 since we don't have a count getter
      for (let i = 0; i < 10; i++) {
        try {
          const result: any = await client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: 'get_project',
            args: [i.toString()]
          });
          if (result) {
            loaded.push({
              id: i.toString(),
              title: `Project #${i}`,
              description: result.description,
              target: parseInt(result.target_amount),
              current: parseInt(result.current_funding),
              status: result.is_verified === "true" ? "Verified" : "Funding",
              proofUrl: result.proof_url
            });
          }
        } catch (e) {
          // Reached the end of available projects
          break; 
        }
      }
      setProjects(loaded);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        setAccount(walletAddress);
        
        client = createClient({
          chain: testnetBradbury,
          account: walletAddress as `0x${string}`,
          provider: (window as any).ethereum,
        });
        
        // Prompt wallet to switch to GenLayer network
        await client.connect();
        
        // Fetch projects now that we have a valid provider!
        await fetchProjects();
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask or another EVM wallet to connect.");
    }
  };

  const handleCreate = async () => {
    if (!newDesc || !newTarget) return alert("Please fill all fields");
    if (!account) return alert("Please connect your wallet first");
    
    setIsCreating(true);
    try {
      // Dynamically create a write client to avoid Next.js HMR state loss
      const writeClient = createClient({
        chain: testnetBradbury,
        account: account as `0x${string}`,
        provider: (window as any).ethereum,
      });

      const txHash = await writeClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'create_project',
        args: [newDesc, newTarget],
        account: account as `0x${string}`,
      });
      alert(`Project created! Hash: ${txHash}`);
      setTimeout(fetchProjects, 2000); // Reload projects
    } catch (err) {
      console.error(err);
      alert("Creation failed. See console.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerify = async (projectId: string) => {
    const url = proofUrlInput[projectId];
    if (!url) return alert("Please enter a proof URL");
    if (!account) return alert("Please connect your wallet first");
    
    setIsVerifying(true);
    try {
      const writeClient = createClient({
        chain: testnetBradbury,
        account: account as `0x${string}`,
        provider: (window as any).ethereum,
      });

      const txHash = await writeClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'verify_milestone',
        args: [projectId, url],
        account: account as `0x${string}`,
      });
      alert(`Verification submitted! Hash: ${txHash}`);
      setTimeout(fetchProjects, 2000);
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify. Check console.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFund = async (projectId: string) => {
    const amt = fundAmount[projectId];
    if (!amt) return;
    if (!account) return alert("Please connect your wallet first");
    
    try {
      const writeClient = createClient({
        chain: testnetBradbury,
        account: account as `0x${string}`,
        provider: (window as any).ethereum,
      });

      const txHash = await writeClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'fund_project',
        args: [projectId, amt],
        account: account as `0x${string}`,
      });
      alert(`Funded successfully! Hash: ${txHash}`);
      setTimeout(fetchProjects, 2000);
    } catch (err) {
      console.error("Funding failed:", err);
      alert("Funding failed. Check console.");
    }
  };

  const handleWithdraw = async (projectId: string) => {
    if (!account) return alert("Please connect your wallet first");
    try {
      const writeClient = createClient({
        chain: testnetBradbury,
        account: account as `0x${string}`,
        provider: (window as any).ethereum,
      });

      const txHash = await writeClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'withdraw_funds',
        args: [projectId],
        account: account as `0x${string}`,
      });
      alert(`Funds withdrawn successfully! Hash: ${txHash}`);
      setTimeout(fetchProjects, 2000);
    } catch (err) {
      console.error("Withdrawal failed:", err);
      alert("Failed to withdraw funds. See console.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-zinc-900 dark:text-white" />
            <span className="text-xl font-bold tracking-tight">VeriFund</span>
          </div>
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="hidden sm:flex rounded-full">
                  <Target className="mr-2 w-4 h-4" />
                  Start a Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Launch New Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Milestone Description</Label>
                    <Input id="desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="E.g., Launch V1 on Testnet" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target">Target Funding ($)</Label>
                    <Input id="target" type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="10000" />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={isCreating} className="w-full">
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Deploy Project"}
                </Button>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={connectWallet}
              className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Wallet className="mr-2 w-4 h-4" />
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16 mt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-6 px-4 py-1 rounded-full border-zinc-300 dark:border-zinc-700">
              Powered by GenLayer AI Consensus
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 text-balance">
              Trustless Funding for <br className="hidden sm:block" />
              <span className="text-zinc-500 dark:text-zinc-400">Real-World Execution</span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              Funds are held in an intelligent escrow and only released when decentralized AI 
              validators read the web and confirm your milestones are truly met.
            </p>
          </motion.div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="discover" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-8 rounded-full">
            <TabsTrigger value="discover" className="rounded-full">Discover Projects</TabsTrigger>
            <TabsTrigger value="my-funds" className="rounded-full">My Portfolio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="mt-0">
            {!account ? (
              <div className="text-center py-12 text-zinc-500 flex flex-col items-center justify-center">
                <Wallet className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700" />
                <p className="mb-4">Please connect your wallet to read live data from the GenLayer network.</p>
                <Button onClick={connectWallet} variant="outline" className="rounded-full">Connect Wallet</Button>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No active projects found. Start one above!</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Card className="h-full border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
                          {project.status === "Verified" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> AI Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-none">
                              Funding Active
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base text-zinc-600 dark:text-zinc-400 h-12 line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm font-medium">
                            <span>${project.current.toLocaleString()}</span>
                            <span className="text-zinc-500">Goal: ${project.target.toLocaleString()}</span>
                          </div>
                          <Progress value={(project.current / Math.max(project.target, 1)) * 100} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-6 border-t border-zinc-100 dark:border-zinc-800 mt-4 flex-col gap-4">
                        <div className="w-full mt-4">
                          {project.status === "Verified" ? (
                             <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                               <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                 <LinkIcon className="w-4 h-4" />
                                 <span className="truncate max-w-[200px]">{project.proofUrl}</span>
                               </div>
                               <Button 
                                 onClick={() => handleWithdraw(project.id)}
                                 className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-1 h-auto text-xs"
                               >
                                 Withdraw Funds
                               </Button>
                             </div>
                          ) : (
                            <div className="space-y-4 w-full">
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="Enter amount to fund..." 
                                  type="number" 
                                  value={fundAmount[project.id] || ""}
                                  onChange={(e) => setFundAmount({...fundAmount, [project.id]: e.target.value})}
                                  className="rounded-xl border-zinc-200 dark:border-zinc-700" 
                                />
                                <Button 
                                  onClick={() => handleFund(project.id)}
                                  className="rounded-xl px-6 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                                >
                                  Fund
                                </Button>
                              </div>
                              
                              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <Label className="text-xs text-zinc-500">Milestone Proof URL (For Founders)</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="https://github.com/..." 
                                    value={proofUrlInput[project.id] || ""}
                                    onChange={(e) => setProofUrlInput({...proofUrlInput, [project.id]: e.target.value})}
                                    className="rounded-xl border-zinc-200 dark:border-zinc-700" 
                                  />
                                  <Button 
                                    variant="outline" 
                                    className="rounded-xl border-zinc-200 dark:border-zinc-700"
                                    onClick={() => handleVerify(project.id)}
                                    disabled={isVerifying}
                                  >
                                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify via AI"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="my-funds">
            <div className="text-center py-24 text-zinc-500">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
              <p>Connect your wallet to view your portfolio.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
