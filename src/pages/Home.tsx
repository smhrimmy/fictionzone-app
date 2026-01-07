import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Disc } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { NovelService } from '../services/novelService';
import { NovelCard } from '../components/NovelCard';
import { HorizontalNovelCard } from '../components/HorizontalNovelCard';
import { ReviewCard } from '../components/ReviewCard';
import { Hero } from '../components/Hero';
import type { Story, Review } from '../types';
import { cn } from '../lib/utils';

// @ts-expect-error - swiper css types missing
import 'swiper/css';
// @ts-expect-error - swiper css types missing
import 'swiper/css/navigation';
// @ts-expect-error - swiper css types missing
import 'swiper/css/pagination';

export default function Home() {
  const [featured, setFeatured] = useState<Story[]>([]);
  const [trending, setTrending] = useState<Story[]>([]);
  const [latest, setLatest] = useState<Story[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [mostReadTab, setMostReadTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [featuredData, trendingData, latestData, reviewsData] = await Promise.all([
        NovelService.getFeaturedStories(),
        NovelService.getTrendingStories(),
        NovelService.getLatestUpdates(),
        NovelService.getRecentReviews()
      ]);
      setFeatured(featuredData);
      setTrending(trendingData);
      setLatest(latestData);
      setReviews(reviewsData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
     return (
        <div className="min-h-screen bg-[#121212]">
            <div className="h-[500px] bg-[#1a1a1a] animate-pulse" />
            <div className="container py-8 space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-[#1a1a1a] rounded-lg animate-pulse" />)}
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      <Hero />

      <div className="container py-12 space-y-16">
        
        {/* Recently Added Novels */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Recently Added Novels</h2>
                <div className="flex gap-2">
                    {/* Swiper Navigation placeholders if needed, Swiper has its own */}
                </div>
            </div>
            
            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={20}
                slidesPerView={2}
                navigation
                autoplay={{ delay: 5000 }}
                breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                    1280: { slidesPerView: 6 },
                }}
                className="pb-4"
            >
                {latest.concat(featured).map((story) => (
                    <SwiperSlide key={story.id}>
                        <NovelCard story={story} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>

        {/* Most Read Novels */}
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">Most Read Novels</h2>
                <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-full border border-white/5">
                    {(['Daily', 'Weekly', 'Monthly', 'All Time'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setMostReadTab(tab as any)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                                mostReadTab === tab 
                                    ? "bg-primary text-black font-bold shadow-lg shadow-primary/20" 
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trending.concat(featured).slice(0, 9).map((story, index) => (
                    <HorizontalNovelCard key={story.id} story={story} rank={index + 1} />
                ))}
            </div>
            
            <div className="flex justify-center">
                <Link to="/discovery" className="px-6 py-2 rounded-full border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/30 transition-all">
                    View More
                </Link>
            </div>
        </section>

        {/* Recent Reviews */}
        <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">Recent Reviews</h2>
                <div className="flex gap-2">
                    {/* Navigation buttons handled by Swiper */}
                </div>
            </div>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                className="pb-12"
            >
                {reviews.map((review) => (
                    <SwiperSlide key={review.id} className="h-auto">
                        <ReviewCard review={review} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>

        {/* Community CTA */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 p-8 md:p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
                <div className="h-16 w-16 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center shadow-2xl">
                    <Disc className="h-8 w-8 text-primary animate-spin-slow" />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">Join Our Discord Community</h2>
                    <p className="text-gray-400">
                        Connect with thousands of avid readers, creators, and curators. Share your feedback, find your next binge, and influence feature development.
                    </p>
                </div>

                <a 
                    href="#" 
                    className="px-8 py-3 rounded-full bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-colors flex items-center gap-2 shadow-lg shadow-[#5865F2]/20"
                >
                    Join Discord Server
                </a>
                
                <p className="text-xs text-gray-500">No spam. Just stories and updates.</p>
            </div>
        </section>

      </div>
    </div>
  );
}
