import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HeroSection from './components/HeroSection';
import CommitmentSection from './components/CommitmentSection';
import FutureGoalsSection from './components/FutureGoalsSection';
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';

export default function SustainabilityPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CommitmentSection />
      <FutureGoalsSection />
      <Footer />
    </div>
  );
}
