export default function manifest() {
  return {
    name: 'Waypoint',
    short_name: 'Waypoint',
    description: 'A location-based task manager.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b', // dark background for splash screen
    theme_color: '#10b981', // emerald green
    icons: [
      {
        src: '/logo-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'apple touch icon',
      },
    ],
  }
}
