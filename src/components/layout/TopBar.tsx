import { X } from 'lucide-react';
import { useState } from 'react';

export function TopBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-orange-500 text-white text-xs md:text-sm py-2 px-4 relative z-50">
      <div className="container flex items-center justify-between">
        <p className="flex-1 text-center font-medium truncate">
          FZ plugin helps you to stay up to date across platforms; install it now on Chrome, Edge...
        </p>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
