import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface HeroContent {
  title?: string;
  bgImageUrl?: string;
}

export default function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: 'Contact',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('contact', 'hero', {
          defaultValue: { title: 'Contact' },
        });
        setHeroContent(result.data);
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'contact' && e.detail.section === 'hero') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <section className="relative h-[350px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[350px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: heroContent.bgImageUrl 
            ? `url(${heroContent.bgImageUrl})` 
            : `url('https://readdy.ai/api/search-image?query=Aerial%20view%20of%20wind%20turbines%20on%20green%20rolling%20hills%20with%20blue%20sky%20and%20white%20clouds%20renewable%20energy%20wind%20farm%20landscape%20professional%20photography%20high%20quality&width=1920&height=600&seq=contact-hero-1&orientation=landscape')`
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10 text-center" data-aos="fade-up">
        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
          {heroContent.title || 'Contact'}
        </h1>
      </div>
    </section>
  );
}
