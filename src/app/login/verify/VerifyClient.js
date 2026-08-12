"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyAuthOtp } from "@/app/auth-actions";
import { Loader2, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const isSignup = searchParams.get("isSignup") === "true";
  const name = searchParams.get("name") || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^[0-9]+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    
    // Focus next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError(null);
    setLoading(true);
    
    const formData = new FormData();
    formData.append("email", email);
    formData.append("code", fullCode);
    formData.append("isSignup", isSignup.toString());
    formData.append("name", name);

    try {
      const res = await verifyAuthOtp(formData);
      
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
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="text-muted-foreground text-sm mt-2 text-center max-w-[250px]">
          We sent a 6-digit verification code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-radius text-sm font-medium border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl border border-white/10 bg-black/20 text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-black/40 transition-all backdrop-blur-md"
            />
          ))}
        </div>

        <button 
          type="submit" 
          disabled={loading || code.join("").length !== 6}
          className="inline-flex h-12 mt-2 items-center justify-center rounded-xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Verify Code"
          )}
        </button>
      </form>
    </div>
  );
}
