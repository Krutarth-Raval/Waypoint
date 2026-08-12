"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { processRevertEmail } from "@/app/profile/actions";
import { ShieldAlert, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

function RevertLogic() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No secure code was provided in the link. Please ensure you copied the full link from your email.");
      return;
    }

    async function revert() {
      const res = await processRevertEmail(token);
      if (res?.error) {
        setStatus("error");
        setErrorMessage(res.error);
      } else {
        setStatus("success");
      }
    }

    revert();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h1 className="text-xl font-semibold">Securing your account...</h1>
        <p className="text-muted-foreground text-sm">Please wait while we verify your request and restore your previous email address.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Account Secured</h1>
          <p className="text-muted-foreground text-sm">
            Your email address has been successfully restored. Any unauthorized sessions have been invalidated.
          </p>
        </div>
        <Link 
          href="/login"
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full font-medium transition-colors"
        >
          Sign in to continue
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Link Invalid or Expired</h1>
        <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-md border border-destructive/20 mt-4">
          {errorMessage}
        </p>
      </div>
      <p className="text-muted-foreground text-sm">
        This link may have already been used, or it expired after 7 days. If you still need help, please contact support.
      </p>
      <Link 
        href="/login"
        className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 px-8 rounded-full font-medium transition-colors"
      >
        Return to Login
      </Link>
    </div>
  );
}

export default function RevertClient() {
  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-10 glass rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Subtle internal glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <h1 className="text-xl font-semibold">Loading...</h1>
        </div>
      }>
        <RevertLogic />
      </Suspense>
    </div>
  );
}
