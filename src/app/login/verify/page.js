import { Suspense } from "react";
import VerifyClient from "./VerifyClient";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export const metadata = {
  title: "Verify Code | Waypoint",
  description: "Enter your verification code",
};

export default function VerifyPage() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/20 relative">
      <Link 
        href="/login"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 hover:bg-background border border-border backdrop-blur-md transition-all text-sm font-semibold text-foreground/80 hover:text-foreground shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
      <div className="relative z-10 w-full animate-in fade-in zoom-in-95 duration-500">
        <Suspense fallback={
          <div className="w-full max-w-md mx-auto p-10 glass rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <VerifyClient />
        </Suspense>
      </div>
    </div>
  );
}
