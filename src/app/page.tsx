"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Target, ArrowRight, Wallet, CheckCircle2, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "EcoTrack API",
    description: "Launch a public beta API for real-time carbon footprint tracking of supply chains.",
    target: 50000,
    current: 32000,
    status: "Funding",
    proofUrl: ""
  },
  {
    id: 2,
    title: "DefiLend V2",
    description: "Deploy audited smart contracts for flash-loan resilient decentralized lending on testnet.",
    target: 100000,
    current: 100000,
    status: "Verified",
    proofUrl: "https://github.com/defilend/v2/releases/tag/v2.0.0-beta"
  }
];

export default function Home() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 3000);
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
            <Button variant="outline" className="hidden sm:flex rounded-full">
              <Target className="mr-2 w-4 h-4" />
              Start a Project
            </Button>
            <Button className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Wallet className="mr-2 w-4 h-4" />
              Connect Wallet
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
            <div className="grid md:grid-cols-2 gap-6">
              {MOCK_PROJECTS.map((project, idx) => (
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
                        <Progress value={(project.current / project.target) * 100} className="h-2" />
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
                             <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">Funds Released</span>
                           </div>
                        ) : (
                          <div className="space-y-4 w-full">
                            <div className="flex gap-2">
                              <Input placeholder="Enter amount to fund..." type="number" className="rounded-xl border-zinc-200 dark:border-zinc-700" />
                              <Button className="rounded-xl px-6 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">Fund</Button>
                            </div>
                            
                            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                              <Label className="text-xs text-zinc-500">Milestone Proof URL (For Founders)</Label>
                              <div className="flex gap-2">
                                <Input placeholder="https://github.com/..." className="rounded-xl border-zinc-200 dark:border-zinc-700" />
                                <Button 
                                  variant="outline" 
                                  className="rounded-xl border-zinc-200 dark:border-zinc-700"
                                  onClick={handleVerify}
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
