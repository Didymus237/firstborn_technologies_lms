import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles, 
  GraduationCap, 
  Calendar,
  ArrowRight
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (user && !loading) {
    return <Navigate to="/dashboard" />;
  }

  const onSubmit = async (data: LoginValues) => {
    setSubmitting(true);
    try {
      const { data: userData } = await api.post("/users/login", {
        email: data.email,
        password: data.password,
      });
      console.log(userData);
      toast.success("Welcome back! Authenticated successfully.");
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#FCFCFC] dark:bg-[#121212] font-sans antialiased overflow-hidden">
      {/* Left Pane - Auth Form */}
      <div className="relative flex flex-col justify-between p-6 md:p-10 z-10">
        
        {/* Glow Effects behind the Form Card */}
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
            
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8B1E1E] via-[#C5A03A] to-[#8B1E1E]"></div>

            <div className="flex flex-col items-center mb-8 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Portal Authentication
              </h1>
              <p className="text-muted-foreground mt-2 text-sm max-w-[320px] leading-relaxed">
                Provide your credentials to securely authenticate and enter the Firstborn workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
                  Email Address
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@domain.com"
                    className="pl-10 h-11 bg-input/40 border-[#E2E2E2] dark:border-[#2E2E2E] focus-visible:border-[#8B1E1E] focus-visible:ring-[#8B1E1E]/20"
                    {...register("email")}
                    disabled={submitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-input/40 border-[#E2E2E2] dark:border-[#2E2E2E] focus-visible:border-[#8B1E1E] focus-visible:ring-[#8B1E1E]/20"
                    {...register("password")}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-[#8B1E1E] hover:bg-[#8B1E1E]/95 text-white font-semibold rounded-xl shadow-lg shadow-[#8B1E1E]/15 dark:shadow-[#8B1E1E]/5 hover:shadow-xl hover:shadow-[#8B1E1E]/25 transition-all duration-300 mt-2 flex items-center justify-center gap-2 group"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Authenticate & Enter
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => toast.info("Password Recovery", {
                    description: "Please contact your school administrator to reset your password or recover your account credentials."
                  })}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hover:underline cursor-pointer"
                >
                  Forgot your password?
                </button>
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
              Industrial Training & IT Solutions
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Innovative IT Solutions & Training
            </h2>
            <p className="text-white/85 text-base leading-relaxed">
              At FirstBorn Technologies, we deliver practical training, innovative technology solutions, and smart learning tools designed to meet real-world needs.
            </p>
          </div>

          {/* Floating UI Widget Mockups for Premium Visual WOW Factor */}
          <div className="relative w-full max-w-sm mx-auto h-48 select-none">
            
            {/* Widget 1: Academic Portal Status */}
            <div className="absolute top-0 left-4 bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/15 dark:border-white/5 rounded-2xl p-4 shadow-xl w-60 transform -rotate-6 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#C5A03A]/20 text-[#C5A03A]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-white/55 font-semibold uppercase">Academics</p>
                  <p className="text-sm font-bold text-white">LMS is Online</p>
                </div>
              </div>
            </div>

            {/* Widget 2: Schedule Synchronization */}
            <div className="absolute top-12 right-4 bg-white/15 dark:bg-black/35 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-2xl w-64 transform rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/55 font-semibold uppercase">Schedules</p>
                    <p className="text-sm font-bold text-white">Timetables Ready</p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              </div>
            </div>

            {/* Widget 3: Welcome Badge */}
            <div className="absolute bottom-0 left-16 bg-white/8 backdrop-blur-md border border-white/10 rounded-xl py-2.5 px-4 shadow-lg flex items-center gap-2 transform translate-y-6 -rotate-2 hover:rotate-0 transition-all duration-500">
              <Sparkles className="w-4 h-4 text-[#C5A03A]" />
              <span className="text-xs font-bold text-white">Academic Term Fall 2026</span>
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
};

export default Login;
