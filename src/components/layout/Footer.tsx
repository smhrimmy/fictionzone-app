import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#121212] border-t border-white/10 py-12 text-sm">
      <div className="container flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <span className="font-bold text-white text-lg">F</span>
                </div>
                <span className="text-xl font-bold text-white tracking-wide">FICTIONZONE</span>
            </div>
            <p className="text-gray-500 text-xs">An Open Online Platform for Web Novels</p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 text-gray-400">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/discovery" className="hover:text-primary transition-colors">Browse</Link>
          <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
          <Link to="#" className="hover:text-primary transition-colors">Contact Us</Link>
          <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-primary transition-colors">DMCA</Link>
        </nav>

        {/* Copyright */}
        <div className="text-gray-600 text-xs text-center">
          <p>© 2026 Fictionzone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
