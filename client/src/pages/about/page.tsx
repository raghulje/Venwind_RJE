import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';
import HeroSection from './components/HeroSection';
import IntroductionSection from './components/IntroductionSection';
import VisionMissionSection from './components/VisionMissionSection';
import PartnershipSection from './components/PartnershipSection';

export default function AboutUs() {
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
      <IntroductionSection />
      <VisionMissionSection />
      <PartnershipSection />
      <Footer />
    </div>
  );
}
