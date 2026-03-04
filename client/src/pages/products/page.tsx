import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';
import HeroSection from './components/HeroSection';
import IntroSection from './components/IntroSection';
import FeaturesSection from './components/FeaturesSection';
import SpecificationsSection from './components/SpecificationsSection';
import TechnicalBenefitsSection from './components/TechnicalBenefitsSection';
import GallerySection from './components/GallerySection';
import BrochureSection from './components/BrochureSection';

export default function Products() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <IntroSection />
      <FeaturesSection />
      <SpecificationsSection />
      <TechnicalBenefitsSection />
      <GallerySection />
      <BrochureSection />
      <Footer />
    </div>
  );
}
