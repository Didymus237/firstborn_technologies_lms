import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  UserCheck,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/AuthProvider";

export default function Register() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users/register", {
        name,
        email,
        password,
        role, 
        isActive: true
      });

      toast.success("Account constructed seamlessly!", {
        description: "Your digital profile is active. Please authenticate."
      });
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Fault logging credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#FCFCFC] dark:bg-[#121212] font-sans antialiased overflow-hidden">
      {/* Left Pane - Registration Form */}
      <div className="relative flex flex-col justify-between p-6 md:p-10 z-10">
        
        {/* Glow Effects behind the Registration Card */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#8B1E1E]/8 blur-[100px] pointer-events-none animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-[#C5A03A]/8 blur-[100px] pointer-events-none animate-pulse duration-[6000ms]"></div>

        {/* Top Header Logo */}
        <div className="flex justify-center lg:justify-start">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 duration-300">
            <img src="./images/main_logo.png" alt="Firstborn Technologies Logo" className="h-10 w-auto filter drop-shadow-[0_2px_8px_rgba(139,30,30,0.15)]" />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md bg-white/70 dark:bg-[#1C1C1C]/75 backdrop-blur-xl border border-[#E5E5E5]/50 dark:border-[#2A2A2A]/50 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl p-8 relative overflow-hidden transition-all duration-300">
            
            {/* Design accent */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8B1E1E] via-[#C5A03A] to-[#8B1E1E]"></div>

            <div className="flex flex-col items-center mb-6 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Create Account
              </h1>
              <p className="text-muted-foreground mt-2 text-sm max-w-[280px]">
                Join the Firstborn operational ecosystem securely
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
                  Full Name
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="w-4 h-4" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 bg-input/40 border-[#E2E2E2] dark:border-[#2E2E2E] focus-visible:border-[#8B1E1E] focus-visible:ring-[#8B1E1E]/20"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
                  Email Address
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    type="email"
                    placeholder="name@gravity.network"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-input/40 border-[#E2E2E2] dark:border-[#2E2E2E] focus-visible:border-[#8B1E1E] focus-visible:ring-[#8B1E1E]/20"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Account Tier (Role Selector) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
                  Account Tier
                </Label>
                <Select value={role} onValueChange={setRole} disabled={loading}>
                  <SelectTrigger className="h-11 bg-input/40 border-[#E2E2E2] dark:border-[#2E2E2E] focus-visible:border-[#8B1E1E] focus-visible:ring-[#8B1E1E]/20 text-left">
                    <SelectValue placeholder="Select Identity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#8B1E1E]" /> Student Portal
                      </span>
                    </SelectItem>
                    <SelectItem value="parent">
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#C5A03A]" /> Parent Overlay
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Security Passkey (Password) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
                  Security Passkey
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-input/40 border-[#E2E2E2] dark:border-[#2E2E2E] focus-visible:border-[#8B1E1E] focus-visible:ring-[#8B1E1E]/20"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-[#8B1E1E] hover:bg-[#8B1E1E]/95 text-white font-semibold rounded-xl shadow-lg shadow-[#8B1E1E]/15 dark:shadow-[#8B1E1E]/5 hover:shadow-xl hover:shadow-[#8B1E1E]/25 transition-all duration-300 mt-2 flex items-center justify-center gap-2 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Register Profile
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Already mapped a profile?{" "}
                  <Link
                    to="/login"
                    className="text-[#8B1E1E] dark:text-[#C5A03A] font-semibold hover:underline"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer legal/credit text */}
        <div className="text-center lg:text-left text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Firstborn Technologies. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Visual Branding Splash (Lg screens only) */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-[#8B1E1E] via-[#5C1414] to-[#290505] justify-center items-center p-12">
        {/* Dynamic Vector/Grid Background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#C5A03A_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        
        {/* Subtle glowing circular elements */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#C5A03A]/20 blur-[120px]"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#8B1E1E]/40 blur-[120px]"></div>

        {/* Content Box */}
        <div className="relative max-w-lg text-center z-10 space-y-12">
          
          {/* Main Info */}
          <div className="space-y-4">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-[#C5A03A] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
              IT Solutions & Capacity Building
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Professional Digital Solutions
            </h2>
            <p className="text-white/85 text-base leading-relaxed">
              We combine software development, cybersecurity, and practical training to support and drive digital transformation across all educational sectors.
            </p>
          </div>

          {/* Floating UI Widget Mockups for Premium Onboarding Visual */}
          <div className="relative w-full max-w-sm mx-auto h-48 select-none">
            
            {/* Widget 1: Identity Creation Checklist */}
            <div className="absolute top-0 left-4 bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/15 dark:border-white/5 rounded-2xl p-4 shadow-xl w-64 transform -rotate-6 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer">
              <p className="text-[10px] text-white/55 font-bold uppercase tracking-wider mb-2">Onboarding Progress</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Security Keys Generated
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Database Profile Initialized
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center text-[8px]">3</span> Role Authorization
                </div>
              </div>
            </div>

            {/* Widget 2: Security Banner */}
            <div className="absolute top-16 right-4 bg-white/15 dark:bg-black/35 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-2xl w-60 transform rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                  <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-xs text-white/55 font-semibold uppercase">Security Tier</p>
                  <p className="text-sm font-bold text-white">End-to-End Crypt</p>
                </div>
              </div>
            </div>

            {/* Widget 3: Live Community Count */}
            <div className="absolute bottom-0 left-16 bg-white/8 backdrop-blur-md border border-white/10 rounded-xl py-2.5 px-4 shadow-lg flex items-center gap-2 transform translate-y-6 -rotate-2 hover:rotate-0 transition-all duration-500">
              <Sparkles className="w-4 h-4 text-[#C5A03A]" />
              <span className="text-xs font-bold text-white">Join over 2.4k users</span>
            </div>

          </div>

          {/* Slogan */}
          <p className="text-xs text-white/40 tracking-widest uppercase pt-6">
            Engineered by Firstborn Technologies
          </p>

        </div>
      </div>
    </div>
  );
}
