import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Waypoint",
  description: "Terms of Service for Waypoint",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-32 px-4 md:px-8">
      <div className="w-full max-w-3xl mx-auto glass p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            By using Waypoint, you agree to these Terms of Service. Please read them carefully before using our application.
          </p>
          
          <h2 className="text-xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Waypoint, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. Use of Service</h2>
          <p>
            Waypoint provides location-based task management. You are responsible for maintaining the confidentiality of your account (via your email access) and for all activities that occur under your account.
          </p>
          <p>
            You agree not to misuse the service or help anyone else do so.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Modifications</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes.
          </p>
          
          <p className="mt-8 pt-8 border-t border-border/50 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
