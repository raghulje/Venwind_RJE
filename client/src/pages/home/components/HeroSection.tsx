
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface HeroContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  videoUrl: string;
  bgImageUrl?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: 'Revolutionizing Wind Energy',
    subtitle: 'Explore the power of cutting-edge wind turbine manufacturing technology in partnership with Vensys Energy AG, Germany',
    buttonText: 'Learn More',
    buttonLink: '/products',
    videoUrl: 'https://venwindrefex.com/wp-content/uploads/2025/01/5097121_Aerial-View_Alternative_1920x1080-1.mp4'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: -1000, // Very large negative offset to ensure immediate trigger
      startEvent: 'DOMContentLoaded', // Start on DOM ready
      disable: false,
    });
  }, []);

  useEffect(() => {
    // Fetch from API first, fallback to localStorage
    const fetchHeroContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cms/home/cms/hero`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && Object.keys(result.data).length > 0) {
            setHeroContent(prev => ({
              ...prev,
              ...result.data,
              buttonLink: result.data.buttonLink || prev.buttonLink || '/products'
            }));
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching hero content from API:', error);
      }

      // Fallback to localStorage
      const savedContent = localStorage.getItem('cms_home_hero');
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent);
          setHeroContent(prev => ({
            ...prev,
            ...parsed,
            buttonLink: parsed.buttonLink || prev.buttonLink || '/products'
          }));
        } catch (error) {
          console.error('Error loading hero content from localStorage:', error);
        }
      }
      setLoading(false);
    };

    fetchHeroContent();
  }, []);

  // Force AOS to refresh and trigger animations immediately when content is loaded
  useEffect(() => {
    if (!loading) {
      // Wait for next frame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Refresh AOS multiple times to ensure detection
        AOS.refresh();
        
        // Trigger scroll event to activate AOS
        window.dispatchEvent(new Event('scroll'));
        
        // Also manually add animation classes with proper delays
        setTimeout(() => {
          const titleEl = document.querySelector('[data-aos][data-aos-delay="0"]') || 
                          document.querySelector('h5[data-aos]');
          if (titleEl) titleEl.classList.add('aos-animate');
        }, 100);
        
        setTimeout(() => {
          const subtitleEl = document.querySelector('[data-aos][data-aos-delay="200"]') || 
                            document.querySelector('p[data-aos]');
          if (subtitleEl) subtitleEl.classList.add('aos-animate');
        }, 300);
        
        setTimeout(() => {
          const buttonEl = document.querySelector('a[data-aos]');
          if (buttonEl) buttonEl.classList.add('aos-animate');
        }, 400);
        
        // Final refresh after manual triggers
        setTimeout(() => {
          AOS.refresh();
          window.dispatchEvent(new Event('scroll'));
        }, 500);
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video or Image */}
      {heroContent.videoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroContent.videoUrl} type="video/mp4" />
        </video>
      ) : heroContent.bgImageUrl ? (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${heroContent.bgImageUrl})` }}
        />
      ) : null}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-8 md:pb-10 px-4 md:px-5 lg:px-6">
        <div className="max-w-7xl w-full">
          <h5 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
            data-aos="fade-right"
            data-aos-offset="0"
          >
            {heroContent.title}
          </h5>
          <p 
            className="text-base md:text-lg text-white/90 mb-8 whitespace-nowrap"
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-offset="0"
          >
            {heroContent.subtitle}
          </p>
          <Link
            to={heroContent.buttonLink}
            className="inline-block bg-[#8DC63F] hover:bg-[#7AB62F] text-white font-bold px-8 py-4 rounded-md transition-all duration-300 whitespace-nowrap"
            data-aos="fade-right"
            data-aos-delay="300"
            data-aos-offset="0"
            data-aos-anchor-placement="top-center"
          >
            {heroContent.buttonText}
          </Link>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div 
        className="absolute bottom-8 right-4 md:right-6 flex flex-col items-center text-white/80 hover:text-white transition-colors cursor-pointer z-10"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <span className="text-xs md:text-sm font-medium mb-1">SCROLL DOWN</span>
        <i className="ri-arrow-down-line text-lg md:text-xl animate-bounce"></i>
      </div>
    </section>
  );
}
