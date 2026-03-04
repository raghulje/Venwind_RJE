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
    title: 'Careers',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('careers', 'hero', {
          defaultValue: { title: 'Careers' },
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
      if (e.detail.page === 'careers' && e.detail.section === 'hero') {
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
      <section className="relative w-full h-[350px] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative w-full h-[350px] bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: heroContent.bgImageUrl 
          ? `url(${heroContent.bgImageUrl})` 
          : 'url(https://readdy.ai/api/search-image?query=Modern%20professional%20office%20environment%20with%20diverse%20team%20collaborating%20in%20bright%20workspace%2C%20glass%20windows%20showing%20city%20skyline%2C%20contemporary%20corporate%20interior%20design%20with%20natural%20lighting%20and%20green%20plants%2C%20business%20atmosphere%2C%20high%20quality%20photography%2C%20clean%20and%20professional%20aesthetic&width=1920&height=400&seq=careers-hero-bg&orientation=landscape)'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10">
        <h1 className="text-white text-5xl md:text-6xl font-bold text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          {heroContent.title || 'Careers'}
        </h1>
      </div>
    </section>
  );
}
