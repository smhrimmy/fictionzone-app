import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MangaService } from '../services/mangaService';
import type { Story } from '../types';

export default function MangaHome() {
  const [stories, setStories] = useState<Story[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    MangaService.getAllStories().then(res => setStories(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24">
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1542261777448-23d2a287091c?auto=format&fit=crop&q=80&w=1600"
          alt="Manga Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="px-3 py-1 bg-[#2ECC71] text-black text-xs font-bold rounded-full mb-3 inline-block">
              FEATURED MANGA
            </span>
            <h1 className="text-4xl font-bold text-white mb-2">Cyberpunk: Edgerunners</h1>
            <p className="text-gray-300 line-clamp-2 max-w-xl mb-4">
              In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw — an edgerunner.
            </p>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-[#2ECC71] text-black font-bold rounded-lg hover:bg-[#27ae60] transition-colors">
                Read Now
              </button>
              <button className="px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm">
                + Library
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-[#2ECC71] w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Popular Updates</h2>
          </div>
          <Link to="/manga/discovery" className="text-sm text-gray-400 hover:text-[#2ECC71]">View All</Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {stories.map((manga, idx) => (
            <motion.div
              key={manga.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer"
              onClick={() => navigate(`/story/${manga.id}`)}
            >
              <img 
                src={manga.cover_image} 
                alt={manga.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100" />
              
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs text-[#2ECC71] font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  {manga.average_rating}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 p-3 w-full">
                <h3 className="text-white font-bold text-sm line-clamp-1 mb-1">{manga.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Ch. {manga.chapters_count}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2h
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
