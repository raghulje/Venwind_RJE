
import Header from '../home/components/Header';
import Footer from '../home/components/Footer';
import HeroSection from './components/HeroSection';
import ContactFormSection from './components/ContactFormSection';
import MapSection from './components/MapSection';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ContactFormSection />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}
