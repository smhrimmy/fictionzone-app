import { useState } from 'react';
import { Search, Layers } from 'lucide-react';

const COLLECTIONS = [
  { id: 1, title: 'Promissing', count: 31, author: 'krazystev1088', time: '10h ago', covers: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+1&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+2&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+3&image_size=portrait_4_3'] },
  { id: 2, title: 'Next', count: 18, author: 'krazystev1088', time: '10h ago', covers: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+4&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+5&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+6&image_size=portrait_4_3'] },
  { id: 3, title: 'Terminados', count: 10, author: 'zagwaro4568', time: '1d ago', covers: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+7&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+8&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+9&image_size=portrait_4_3'] },
  { id: 4, title: 'urban or fanfiction', count: 36, author: 'hanelapi', time: '1d ago', covers: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+10&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+11&image_size=portrait_4_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=novel+cover+12&image_size=portrait_4_3'] },
];

export default function Collections() {
  const [search, setSearch] = useState('');

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Public Collections</h1>
        <p className="text-gray-400">Discover and explore curated collections of novels from our community</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input 
                type="text" 
                placeholder="Search collections..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
            />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All Categories', 'Trending', 'New Releases', 'Most Popular'].map((filter, i) => (
                <button 
                    key={filter}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary text-black' : 'bg-[#1a1a1a] text-gray-400 border border-white/10 hover:text-white'}`}
                >
                    {filter}
                </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COLLECTIONS.map((col) => (
            <div key={col.id} className="group bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-primary/50 transition-all cursor-pointer">
                {/* Stacked Covers */}
                <div className="relative h-48 mb-4 mx-auto w-3/4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-44 rotate-[-10deg] bg-gray-800 rounded shadow-lg transform group-hover:rotate-[-15deg] transition-transform origin-bottom">
                        <img src={col.covers[0]} alt="" className="w-full h-full object-cover rounded opacity-60" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-44 rotate-[10deg] bg-gray-800 rounded shadow-lg transform group-hover:rotate-[15deg] transition-transform origin-bottom">
                        <img src={col.covers[1]} alt="" className="w-full h-full object-cover rounded opacity-60" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-44 bg-gray-700 rounded shadow-xl z-10">
                        <img src={col.covers[2]} alt="" className="w-full h-full object-cover rounded" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg group-hover:text-primary transition-colors">{col.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                            {col.author[0].toUpperCase()}
                        </div>
                        <span>{col.author}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
                        <span>{col.count} novels</span>
                        <div className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            <span>Public</span>
                            <span>• {col.time}</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
