# Waypoint

**Live Demo:** [waypoint-tasks.vercel.app](https://waypoint-tasks.vercel.app)

Waypoint is a beautifully designed, location-aware task application. It allows you to drop pins on a map, attach tasks to those locations, and get notified the moment you enter the radius of your saved locations using background geofencing.

## Features
- **Location-Based Tasks:** Attach your to-dos to specific geographical locations.
- **Geofence Alerts:** Get notified the second you arrive at your monitored locations.
- **Beautiful UI:** A stunning, fully responsive dark-mode optimized design with dynamic color themes.
- **Secure:** Built with magic link authentication and rigorous privacy controls.

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- Prisma ORM
- NextAuth (Passwordless Email Auth)
- Lucide Icons
- Photon Geocoding API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up your `.env` file with your database URL and NextAuth secrets.
4. Run Prisma migrations:
   ```bash
   bunx prisma db push
   ```
5. Start the development server:
   ```bash
   bun dev
   ```

## License
MIT License
