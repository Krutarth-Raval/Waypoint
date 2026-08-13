"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, CheckSquare, LogOut, User, Download } from "lucide-react";
import { logout } from "@/app/auth-actions";

export default function Navigation({ user }) {
  const pathname = usePathname();
  const [showConfirm, setShowConfirm] = useState(false);
  
  if (pathname === '/login') return null;

  const [isNative, setIsNative] = useState(false);

  // Check if we are running in the Capacitor app or PWA
  import('react').then(({ useEffect }) => {
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const isCapacitor = window.Capacitor?.isNativePlatform();
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isCapacitor || isStandalone) {
          setIsNative(true);
        }
      }
    }, []);
  });

  const navItems = [
    { href: "/", label: "Now", icon: Home },
    { href: "/places", label: "Places", icon: MapPin },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
  ];

  if (!isNative) {
    navItems.push({ href: "/download", label: "App", icon: Download });
  }

  return (
    <>
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex items-center gap-2 z-50">
        <nav className="flex-1 bg-white/80 dark:bg-black/60 backdrop-blur-3xl rounded-[2rem] border border-border shadow-2xl h-16 px-3 flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center justify-center transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                <div className={`flex items-center rounded-full transition-all duration-300 ease-out ${isActive ? "bg-primary/20 shadow-inner px-4 py-2" : "p-2"}`}>
                  <Icon className="w-6 h-6 shrink-0" />
                  <span 
                    className={`font-bold whitespace-nowrap transition-all duration-300 ease-out text-sm overflow-hidden
                      ${isActive ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
                    `}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* Profile Avatar */}
        <Link 
          href="/profile"
          className={`bg-white/80 dark:bg-black/60 backdrop-blur-3xl rounded-full border border-border shadow-2xl h-16 w-16 flex items-center justify-center shrink-0 transition-all overflow-hidden ${pathname === '/profile' ? 'border-primary/50 ring-2 ring-primary/20' : 'hover:border-primary/30'}`}
        >
           {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
           ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-xl leading-none">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              </div>
           )}
        </Link>
      </div>
    </>
  );
}
