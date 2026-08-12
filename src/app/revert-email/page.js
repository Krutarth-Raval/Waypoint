import RevertClient from "./RevertClient";

export const metadata = {
  title: "Revert Email Change | Waypoint",
  description: "Securely revert an unauthorized email change.",
};

export default function RevertEmailPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden bg-background p-4">
      {/* Background decoration matching auth pages */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />
      
      <RevertClient />
    </div>
  );
}
