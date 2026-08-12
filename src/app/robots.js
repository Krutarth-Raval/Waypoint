export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profile', '/tasks', '/places', '/api/*'],
    },
    sitemap: 'https://waypoint-tasks.vercel.app/sitemap.xml',
  };
}
