import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const login = useLogin();
  const register = useRegister();
  const isPending = login.isPending || register.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, password, full_name: fullName });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
        {/* Unsplash abstract dark texture */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 glass-panel rounded-[2rem] border-white/5"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 cursor-pointer hover:bg-primary/30 transition-colors">
            <Brain className="w-8 h-8 text-primary" />
          </Link>
          <h2 className="text-3xl font-display font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-muted-foreground mt-2 text-center">
            {mode === 'login' 
              ? 'Enter your credentials to access your courses' 
              : 'Join LearnAI to start creating adaptive courses'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="John Doe" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary/50"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary/50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 transition-all mt-4"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link href={mode === 'login' ? "/register" : "/login"} className="text-primary font-medium hover:underline">
            {mode === 'login' ? "Sign up" : "Sign in"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
