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
    title: 'Sustainability',
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
        const result = await getCMSData('sustainability', 'hero', {
          defaultValue: { title: 'Sustainability' },
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
      if (e.detail.page === 'sustainability' && e.detail.section === 'hero') {
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
      <section className="relative h-[250px] sm:h-[300px] lg:h-[350px] w-full overflow-hidden bg-cover bg-center flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section 
        className="relative h-[250px] sm:h-[300px] lg:h-[350px] w-full overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: heroContent.bgImageUrl 
            ? `url(${heroContent.bgImageUrl})` 
            : 'url(https://readdy.ai/api/search-image?query=Modern%20wind%20turbines%20in%20a%20vast%20green%20field%20under%20blue%20sky%20with%20white%20clouds%2C%20renewable%20energy%20farm%20landscape%2C%20sustainable%20power%20generation%2C%20clean%20technology%20infrastructure%2C%20aerial%20perspective%20showing%20multiple%20wind%20turbines%20across%20rolling%20hills%2C%20bright%20natural%20lighting%2C%20professional%20photography%20style&width=1920&height=800&seq=sustainability-hero-bg&orientation=landscape)'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center">{heroContent.title || 'Sustainability'}</h1>
        </div>
      </section>
  );
}
