import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData, normalizeImageUrl } from '../../../utils/cms';

interface HeroContent {
  title?: string;
  bgImageUrl?: string;
}

export default function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: 'Technology',
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
        const result = await getCMSData('technology', 'hero', {
          defaultValue: { title: 'Technology' },
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
      if (e.detail.page === 'technology' && e.detail.section === 'hero') {
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
      <section className="relative h-[350px] w-full overflow-hidden bg-cover bg-center flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section 
      className="relative h-[350px] w-full overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: heroContent.bgImageUrl 
          ? `url(${normalizeImageUrl(heroContent.bgImageUrl)})` 
          : 'url(https://readdy.ai/api/search-image?query=Aerial%20view%20of%20large%20wind%20farm%20with%20multiple%20white%20wind%20turbines%20spread%20across%20golden-brown%20fields%20under%20overcast%20sky%2C%20renewable%20energy%20infrastructure%2C%20aerial%20photography%20perspective%2C%20dry%20agricultural%20landscape%20with%20wind%20turbines%2C%20industrial%20scale%20renewable%20energy%20installation&width=1920&height=500&seq=technology-hero-bg&orientation=landscape)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'crisp-edges',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 h-full flex items-center justify-center">
        <h1 className="text-white text-6xl font-bold drop-shadow-lg">{heroContent.title || 'Technology'}</h1>
      </div>
    </section>
  );
}
