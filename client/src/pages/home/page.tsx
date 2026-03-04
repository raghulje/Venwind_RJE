import { useEffect } from 'react';
import AOS from 'aos';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import DifferentiatorsSection from './components/DifferentiatorsSection';
import Footer from './components/Footer';

export default function HomePage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
      offset: 100
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <DifferentiatorsSection />
      <Footer />
    </div>
  );
}
