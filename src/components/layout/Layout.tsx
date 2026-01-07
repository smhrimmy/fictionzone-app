import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-foreground font-sans pb-16 md:pb-0">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
