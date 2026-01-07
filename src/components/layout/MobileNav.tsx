import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Library, Layers, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Browse', path: '/discovery', icon: Compass },
    { label: 'Omniportal', path: '/discovery?source=all', icon: Globe },
    { label: 'Collections', path: '/collections', icon: Layers },
    { label: 'Library', path: '/library', icon: Library },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-white/10 md:hidden safe-area-bottom">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              location.pathname === item.path 
                ? "text-primary" 
                : "text-gray-500 hover:text-white"
            )}
          >
            <item.icon className={cn("h-5 w-5", location.pathname === item.path && "fill-current")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
