export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center transition-transform hover:scale-105 active:scale-95 ${className}`}>
      <img src="/logo.png" alt="Waypoint Logo" className="h-6 md:h-8 object-contain hidden dark:block" />
      <img src="/logo-light.png" alt="Waypoint Logo" className="h-6 md:h-8 object-contain block dark:hidden" />
    </div>
  );
}
