import { MapPin, Navigation, CheckCircle, ArrowRight, Bell, Smartphone, Map, Sun, ShieldCheck } from "lucide-react";
import { getActiveTasks } from "./actions";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import NowDashboard from "@/components/NowDashboard";
import Logo from "@/components/Logo";

export default async function Home() {
  const session = await getSession();

  if (!session?.userId) {
    return (
      <div className="flex flex-col min-h-screen relative overflow-hidden pt-12 md:pt-20 pb-12 md:pb-20 px-4 md:px-8">

        <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-16 md:gap-24 relative">

          {/* Main Hero Card */}
          <div className="relative">
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 md:p-16 lg:p-24 group">
              <h1 className="relative z-10 text-5xl md:text-7xl xl:text-8xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                Tasks tied to your <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">Location</span>
              </h1>

              <p className="relative z-10 text-lg md:text-xl xl:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
                Waypoint alerts you to your tasks exactly when and where you need them.
                Drop a pin on the map, add a task, and get notified the moment you arrive.
              </p>

              <div className="relative z-10 flex justify-center w-full sm:w-auto">
                <Link
                  href="/login?mode=signup"
                  className="flex w-full sm:w-auto h-12 md:h-16 items-center justify-center rounded-full bg-primary px-6 md:px-10 text-base md:text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.4)] hover:shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.8)] hover:-translate-y-1 active:scale-95 duration-300"
                >
                  Start for free
                  <ArrowRight className="ml-2 md:ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Animation & Explanation Section */}
          <div className="relative flex flex-col xl:flex-row items-stretch gap-12 xl:gap-16">

            {/* Visual Side */}
            <div className="relative z-10 w-full xl:w-1/2 h-full min-h-[400px] bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2.5rem] shadow-xl flex items-center justify-center overflow-hidden group hover:shadow-primary/10 transition-shadow duration-500">
              <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 pointer-events-none z-10" />
              <Image
                src="/hero-illustration.png"
                alt="Waypoint App Map Pin"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                priority
              />
            </div>

            {/* Text Side */}
            <div className="w-full xl:w-1/2 flex flex-col justify-center text-left px-4 xl:px-0">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-foreground">
                Get pinged the <br className="hidden md:block" /> second you arrive
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                Our lightweight background engine monitors your geofences. The moment you step into the radius of your saved location, your device will instantly notify you.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Set custom radiuses for places like home or the grocery store. You'll only see what you need to do, exactly when you're in the right place to do it.
              </p>
            </div>
          </div>

          {/* Bottom Feature Grid */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">

            <div className="relative z-10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 group h-full border border-white/10 hover:border-primary/50 hover:shadow-[0_0_40px_-15px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Map className="w-8 h-8 text-primary transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">Drop a Pin</h3>
              <p className="text-muted-foreground leading-relaxed">Select any location in the world on our interactive map. Set your home, office, or local grocery store.</p>
            </div>

            <div className="relative z-10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 group h-full border border-white/10 hover:border-primary/50 hover:shadow-[0_0_40px_-15px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                <CheckCircle className="w-8 h-8 text-primary transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">Add Tasks</h3>
              <p className="text-muted-foreground leading-relaxed">Attach to-dos to your locations. Need to pick up milk? Attach it to the grocery store pin.</p>
            </div>

            <div className="relative z-10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 group h-full border border-white/10 hover:border-primary/50 hover:shadow-[0_0_40px_-15px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Bell className="w-8 h-8 text-primary transition-transform duration-500 group-hover:animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">Get Notified</h3>
              <p className="text-muted-foreground leading-relaxed">The magic happens when you move. Waypoint alerts your device the second you enter a location's geofence.</p>
            </div>

            <div className="relative z-10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 group h-full border border-white/10 hover:border-primary/50 hover:shadow-[0_0_40px_-15px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                <ShieldCheck className="w-8 h-8 text-primary transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">Secure & Private</h3>
              <p className="text-muted-foreground leading-relaxed">Your location data never leaves your device. We use passwordless authentication and strict privacy protocols to keep you safe.</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="relative max-w-[1200px] w-full mx-auto mt-24">
          <div className="relative z-10 bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 shadow-xl">
            <div className="flex items-center opacity-80">
              <Logo className="text-xl" />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Waypoint. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const tasks = await getActiveTasks();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-8 pb-32">

      {/* Dashboard Layout (Handles location and tasks) */}
      <NowDashboard tasks={tasks} greeting={greeting} firstName={firstName} />
    </div>
  );
}
