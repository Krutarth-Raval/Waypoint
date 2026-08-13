import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/layout/Navigation";
import TopNavbar from "@/components/layout/TopNavbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import PermissionsModal from "@/components/PermissionsModal";
import GeofenceInitializer from "@/components/GeofenceInitializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  metadataBase: new URL('https://waypoint-tasks.vercel.app'),
  title: {
    default: 'Waypoint - Location-Aware Tasks',
    template: '%s | Waypoint'
  },
  description: 'Waypoint alerts you to your tasks exactly when and where you need them using intelligent geofencing and background location tracking.',
  keywords: ['location-based tasks', 'geofencing', 'to-do list', 'productivity', 'task manager', 'reminders'],
  authors: [{ name: 'Waypoint Team' }],
  creator: 'Waypoint',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://waypoint-tasks.vercel.app',
    title: 'Waypoint - Location-Aware Tasks',
    description: 'Get notified the second you arrive at your destination. A geofence-powered task manager.',
    siteName: 'Waypoint',
    images: [{
      url: '/hero-illustration.png',
      width: 1200,
      height: 630,
      alt: 'Waypoint App Preview'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Waypoint - Location-Aware Tasks',
    description: 'Get notified the second you arrive at your destination. A geofence-powered task manager.',
    images: ['/hero-illustration.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Waypoint'
  },
  formatDetection: {
    telephone: false,
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  const isAuthenticated = !!session?.userId;
  
  let user = null;
  if (isAuthenticated) {
    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, avatar: true }
      });
    } catch (e) {
      console.error('Layout user query failed (even after auto-retry):', e.message);
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('color-theme') || 'theme-emerald';
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background relative selection:bg-primary/30" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Global Background Effects */}
          <div className="fixed inset-0 z-[-1] pointer-events-none bg-background transition-colors duration-300">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[100px] md:blur-[128px] opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-[100px] md:blur-[128px] opacity-40" />
          </div>

          <TopNavbar isAuthenticated={isAuthenticated} user={user} />
        
        {isAuthenticated ? (
          <>
            <Navigation user={user} />
            <PermissionsModal />
            <GeofenceInitializer />
            <main className="flex-1 w-full pb-20 md:pb-0 min-h-[calc(100dvh-4rem)]">
              {children}
            </main>
          </>
        ) : (
          <main className="flex-1 w-full min-h-[calc(100dvh-4rem)]">
            {children}
          </main>
        )}
        </ThemeProvider>
      </body>
    </html>
  );
}
