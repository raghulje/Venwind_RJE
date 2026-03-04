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
    title: 'Products',
  });
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const defaultImageUrl = 'https://readdy.ai/api/search-image?query=Modern%20wind%20turbines%20farm%20against%20clear%20blue%20sky%2C%20renewable%20energy%20infrastructure%2C%20clean%20technology%2C%20sustainable%20power%20generation%2C%20white%20wind%20turbines%20with%20three%20blades%20rotating%2C%20green%20energy%20landscape%2C%20environmental%20conservation%2C%20industrial%20wind%20power%20installation%2C%20bright%20daylight%20scene%20with%20minimal%20clouds&width=1920&height=500&seq=products-hero-bg&orientation=landscape';

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('products', 'hero', {
          defaultValue: { title: 'Products' },
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
      if (e.detail.page === 'products' && e.detail.section === 'hero') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, []);

  // Preload and optimize image loading - start loading immediately
  useEffect(() => {
    setImageLoaded(false); // Reset when image URL changes
    const imageUrl = heroContent.bgImageUrl || defaultImageUrl;
    if (imageUrl) {
      let isMounted = true;
      const img = new Image();
      
      img.onload = () => {
        if (isMounted) {
          setImageLoaded(true);
        }
      };
      img.onerror = () => {
        if (isMounted) {
          setImageLoaded(true); // Still show section even if image fails
        }
      };
      
      // Set src after setting handlers to ensure they fire
      img.src = imageUrl;
      
      // Fallback: if image doesn't load within 3 seconds, show section anyway
      const timeout = setTimeout(() => {
        if (isMounted) {
          setImageLoaded(true);
        }
      }, 3000);
      
      return () => {
        isMounted = false;
        clearTimeout(timeout);
      };
    } else {
      setImageLoaded(true);
    }
  }, [heroContent.bgImageUrl]);

  const imageUrl = heroContent.bgImageUrl || defaultImageUrl;

  if (loading) {
    return (
      <section className="relative h-[350px] w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section 
        className="relative h-[250px] sm:h-[300px] md:h-[350px] w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: imageLoaded 
            ? `url(${imageUrl})` 
            : 'linear-gradient(to bottom right, #4a5568, #2d3748)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: imageLoaded ? 'opacity 0.5s ease-in-out' : 'none',
          opacity: imageLoaded ? 1 : 0.9,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center">{heroContent.title || 'Products'}</h1>
        </div>
      </section>
  );
}
