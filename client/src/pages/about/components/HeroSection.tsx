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
    title: 'About Us',
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
        const result = await getCMSData('about', 'hero', {
          defaultValue: { title: 'About Us' },
        });
        setHeroContent(result.data);
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    // Listen for CMS updates
    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'about' && e.detail.section === 'hero') {
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
            ? `url(${heroContent.bgImageUrl})` 
            : 'url(https://venwindrefex.com/wp-content/uploads/2025/01/about-us-banner.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-white text-6xl font-bold">{heroContent.title || 'About Us'}</h1>
        </div>
      </section>
  );
}
