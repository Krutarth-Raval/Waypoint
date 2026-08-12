import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Waypoint",
  description: "Privacy Policy for Waypoint",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            At Waypoint, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our location-based task management application.
          </p>
          
          <h2 className="text-xl font-bold text-foreground mt-8">1. Information We Collect</h2>
          <p>
            <strong>Location Data:</strong> To provide core functionality like geofenced notifications, we request access to your device's location. This data is processed locally on your device to trigger alerts and is never continuously tracked or stored on our servers.
          </p>
          <p>
            <strong>Account Information:</strong> We use passwordless authentication via email. We only store your email address and any tasks you explicitly create.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to provide and improve the Waypoint service. We do not sell, rent, or share your personal data or location history with any third parties or advertisers.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. All communication between your device and our servers is encrypted.
          </p>
          
          <p className="mt-8 pt-8 border-t border-border/50 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
