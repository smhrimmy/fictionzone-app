import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, X, BookOpen, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

export function Header() {
  const { user, mode, setMode } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMode = () => {
    const newMode = mode === 'novel' ? 'manga' : 'novel';
    setMode(newMode);
    navigate(newMode === 'novel' ? '/' : '/manga');
  };

  const navItems = mode === 'novel' ? [
    { label: 'Home', path: '/' },
    { label: 'Browse', path: '/discovery' },
    { label: 'Omniportal', path: '/discovery?source=all' },
    { label: 'Collections', path: '/collections' },
    { label: 'Library', path: '/library' },
  ] : [
    { label: 'Home', path: '/manga' },
    { label: 'Browse', path: '/manga/discovery' },
    { label: 'Latest', path: '/manga/latest' },
    { label: 'Library', path: '/library' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#121212]/95 backdrop-blur supports-[backdrop-filter]:bg-[#121212]/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo Section */}
        <Link to={mode === 'novel' ? "/" : "/manga"} className="flex items-center gap-3 group">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
              mode === 'novel' ? "bg-gradient-to-br from-orange-500 to-red-600" : "bg-gradient-to-br from-[#2ECC71] to-emerald-600"
            )}>
                 {/* Placeholder Logo Icon */}
                 <span className="font-bold text-white text-lg">F</span>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-none tracking-wide group-hover:text-primary transition-colors">FICTIONZONE</span>
                <span className="text-[10px] text-gray-400 font-medium leading-none mt-1">
                  {mode === 'novel' ? 'Web Novel Platform' : 'Manga Reader Platform'}
                </span>
            </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative py-1",
                location.pathname === item.path ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" : "text-gray-300"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Mode Switcher */}
          <button 
            onClick={toggleMode}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            {mode === 'novel' ? <BookOpen className="w-4 h-4 text-orange-500" /> : <ImageIcon className="w-4 h-4 text-[#2ECC71]" />}
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{mode} MODE</span>
          </button>

          <button className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white transition-colors relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border border-[#121212]" />
          </button>

          {user ? (
            <Link to="/profile" className="hidden md:flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-transparent hover:ring-primary transition-all">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col items-start hidden lg:flex">
                  <span className="text-xs font-bold text-white">{user.username}</span>
                  <span className="text-[10px] text-primary px-1.5 py-0.5 rounded bg-primary/10 leading-none mt-0.5">Reader</span>
              </div>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden md:flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 p-4 space-y-4 bg-[#121212]">
          <nav className="flex flex-col gap-4">
            <button 
                onClick={() => { toggleMode(); setIsMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 bg-white/5 rounded-lg mb-2"
            >
                {mode === 'novel' ? <BookOpen className="w-4 h-4 text-orange-500" /> : <ImageIcon className="w-4 h-4 text-[#2ECC71]" />}
                <span className="text-sm font-bold text-white uppercase">SWITCH TO {mode === 'novel' ? 'MANGA' : 'NOVEL'}</span>
            </button>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path ? "text-primary" : "text-gray-300"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/profile" : "/auth"}
              className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              {user ? "Profile" : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
