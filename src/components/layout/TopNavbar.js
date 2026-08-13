"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, LogOut } from "lucide-react";
import { logout } from "@/app/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

export default function TopNavbar({ isAuthenticated, user }) {
  const pathname = usePathname();
  const [showConfirm, setShowConfirm] = useState(false);

  if (pathname.startsWith("/login") || pathname.startsWith("/revert-email")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Now" },
    { href: "/places", label: "Places" },
    { href: "/tasks", label: "Tasks" },
    { href: "/download", label: "Download App" },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-4 md:px-8 flex justify-center pointer-events-none">
      <header className="relative z-10 flex h-16 max-w-[1200px] w-full items-center justify-between pl-6 md:pl-8 pr-3 rounded-[2rem] bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-2xl border border-border pointer-events-auto transition-all duration-300">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center group">
            <Logo className="text-2xl md:text-[28px]" />
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-base font-semibold transition-colors hover:text-foreground/80 ${
                      isActive ? "text-foreground" : "text-foreground/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Profile Avatar - Desktop Only */}
              <Link href="/profile" className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors border border-primary/30 overflow-hidden shrink-0 shadow-inner mr-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-sm">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </Link>
              
              <ThemeToggle />
              
              <button 
                onClick={() => setShowConfirm(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/50 hover:bg-destructive/10 text-destructive transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-base font-semibold text-foreground/80 hover:text-foreground transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link 
                href="/login?mode=signup"
                className="inline-flex h-9 sm:h-11 items-center justify-center rounded-full bg-primary px-5 sm:px-6 py-2 text-sm sm:text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <span className="sm:hidden">Log In</span>
                <span className="hidden sm:inline">Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-[2rem] p-6 md:p-8 shadow-2xl border border-border flex flex-col items-center text-center animate-in zoom-in-95 duration-200 pointer-events-auto mx-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4 md:mb-6">
              <LogOut className="w-6 h-6 md:w-8 md:h-8 ml-1" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2 tracking-tight">Sign Out?</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-6 md:mb-8">Are you sure you want to sign out of Waypoint?</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 py-2.5 md:py-3 text-sm md:text-base rounded-full bg-accent hover:bg-accent/80 font-bold transition-colors"
              >
                Cancel
              </button>
              <form action={logout} className="flex-1">
                <button 
                  type="submit" 
                  className="w-full py-2.5 md:py-3 text-sm md:text-base rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold transition-colors shadow-lg shadow-destructive/20"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
