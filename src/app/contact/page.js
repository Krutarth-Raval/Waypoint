import { Mail } from "lucide-react";

export const metadata = {
  title: "Contact Us | Waypoint",
  description: "Contact the Waypoint team",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-32 px-4 md:px-8">
      <div className="w-full max-w-3xl mx-auto glass p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Contact Us
          </h1>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Have a question, feedback, or need support? We'd love to hear from you.
            Reach out to the Waypoint admin directly through social media:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <a 
              href="https://instagram.com/raval_krutarth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border hover:bg-primary/10 hover:border-primary/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Instagram</p>
                <p className="text-xs text-muted-foreground">@raval_krutarth</p>
              </div>
            </a>

            <a 
              href="https://x.com/_KrutarthRaval_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border hover:bg-primary/10 hover:border-primary/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">X (Twitter)</p>
                <p className="text-xs text-muted-foreground">@_KrutarthRaval_</p>
              </div>
            </a>
          </div>
          
          <p className="mt-8 pt-8 border-t border-border/50 text-sm">
            We aim to respond to all inquiries within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
