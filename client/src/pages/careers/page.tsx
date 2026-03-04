import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';
import HeroSection from './components/HeroSection';
import ApplicationSection from './components/ApplicationSection';

export default function CareersPage() {
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
      <ApplicationSection />
      <Footer />
    </div>
  );
}
