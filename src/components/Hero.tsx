import { Link } from 'react-router-dom';
import { Compass, PenTool } from 'lucide-react';

// Mock covers for the background grid
const COVERS = [
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy+novel+cover+dragon&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=scifi+novel+cover+space&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=romance+novel+cover+couple&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=horror+novel+cover+dark&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=action+novel+cover+hero&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mystery+novel+cover+detective&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=adventure+novel+cover+map&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magic+novel+cover+spell&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=martial+arts+novel+cover&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk+novel+cover&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=steampunk+novel+cover&image_size=portrait_4_3",
  "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=urban+novel+cover&image_size=portrait_4_3",
];

export function Hero() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-[#121212] flex items-center justify-center">
      {/* Background Grid with Gradient Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 p-4 transform -rotate-6 scale-110">
          {[...COVERS, ...COVERS].map((src, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
              <img src={src} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          ))}
        </div>
        {/* Radial Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/80 via-[#121212]/60 to-[#121212]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#121212_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center px-4 space-y-8">
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
            A Home for Readers.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">A Stage for Writers.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Whatever you want to read or experience, you'll find your place here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/discovery"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="h-5 w-5" />
            Explore Library
          </Link>
          <Link
            to="/auth"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <PenTool className="h-5 w-5" />
            Become an Author
          </Link>
        </div>
      </div>
    </div>
  );
}
