
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';
import HeroSection from './components/HeroSection';
import IntroSection from './components/IntroSection';
import InnovationSection from './components/InnovationSection';
import ComparisonSection from './components/ComparisonSection';
import TechnicalAdvantagesSection from './components/TechnicalAdvantagesSection';
import AdvantagesSection from './components/AdvantagesSection';
import BenefitsSection from './components/BenefitsSection';

export default function Technology() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <IntroSection />
      <InnovationSection />
      <ComparisonSection />
      <TechnicalAdvantagesSection />
      <AdvantagesSection />
      <BenefitsSection />
      <div className="pt-24 pb-8">
        <Footer />
      </div>
    </div>
  );
}
