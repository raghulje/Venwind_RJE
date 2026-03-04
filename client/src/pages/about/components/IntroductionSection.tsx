import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface IntroductionContent {
  label?: string;
  title?: string;
  paragraph1?: string;
  paragraph2?: string;
  imageUrl?: string;
  overlayText?: string;
}

const defaultContent: IntroductionContent = {
  label: 'Introduction',
  title: 'Pioneering the Future of Renewable Energy',
  paragraph1: 'Venwind Refex, a partnership between Refex and Venwind, aims to transform wind energy in India through innovation and sustainability, delivering advanced turbine technology and manufacturing excellence.',
  paragraph2: 'Venwind Refex strives to be a leading wind turbine OEM in India, combining global expertise with local insight. Our advanced facility is set to produce 5.3 MW turbines, aiming for a 5 GW annual capacity within five years.',
  imageUrl: 'https://venwindrefex.com/wp-content/uploads/2025/01/about-usbg-630x630.jpg',
  overlayText: 'Driving Our Renewable Future',
};

export default function IntroductionSection() {
  const [content, setContent] = useState<IntroductionContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('about', 'introduction', {
          defaultValue: defaultContent,
        });
        // Merge with defaults to ensure all fields are present
        setContent({ ...defaultContent, ...result.data });
      } catch (error) {
        console.error('Error loading introduction content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    // Listen for CMS updates
    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'about' && e.detail.section === 'introduction') {
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
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div data-aos="fade-left">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              {content.label || defaultContent.label}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {content.title || defaultContent.title}
            </h2>
            <p className="text-gray-700 text-base leading-relaxed mb-6">
              {content.paragraph1 || defaultContent.paragraph1}
            </p>
            <p className="text-gray-700 text-base leading-relaxed">
              {content.paragraph2 || defaultContent.paragraph2}
            </p>
          </div>

          {/* Right Image */}
          <div data-aos="fade-up" className="flex justify-center">
            <div className="relative w-full max-w-[630px]">
              <div className="aspect-square rounded-full overflow-hidden shadow-xl">
                <img 
                  src={content.imageUrl || defaultContent.imageUrl}
                  alt={content.overlayText || defaultContent.overlayText}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
