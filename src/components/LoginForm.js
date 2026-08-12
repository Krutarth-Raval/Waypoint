"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { requestAuthOtp } from "@/app/auth-actions";
import { ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initMode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(initMode !== 'signup');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.target);
    formData.append("isSignup", (!isLogin).toString());
    
    try {
      const res = await requestAuthOtp(formData);
      
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.redirectUrl) {
        router.push(res.redirectUrl);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-10 glass rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Subtle internal glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col items-center mb-8">
        <div className="mb-4">
          <Logo className="scale-125" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-4">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground text-sm mt-2 text-center">
          Do it when you're there. Do it when you leave.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-radius text-sm font-medium border border-destructive/20">
            {error}
          </div>
        )}
        
        {!isLogin && (
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              name="name"
              required={!isLogin}
              placeholder="Your Name"
              className="flex h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-black/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all backdrop-blur-md"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 mb-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="flex h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-black/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all backdrop-blur-md"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex h-12 mt-4 items-center justify-center rounded-xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Continue with Email
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </span>
        <button 
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-primary font-medium hover:underline"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
