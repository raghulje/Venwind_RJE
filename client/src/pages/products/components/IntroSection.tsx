import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface IntroContent {
  title?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
}

const defaultContent: IntroContent = {
  title: 'State-of-the-Art Wind Turbine Solutions',
  paragraph1: 'Our flagship GWH182-5.3 MW wind turbine features advanced engineering for exceptional performance in low wind areas.',
  paragraph2: 'The GWH182-5.3 MW combines efficiency, adaptability, and reliability, marking a breakthrough in wind power technology.',
  paragraph3: 'Designed for India\'s diverse wind conditions, the GWH182-5.3 MW maximizes energy capture with its 182m rotor diameter and 130m hub height.',
};

export default function IntroSection() {
  const [content, setContent] = useState<IntroContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('products', 'intro', {
          defaultValue: defaultContent,
        });
        setContent({ ...defaultContent, ...result.data });
      } catch (error) {
        console.error('Error loading intro content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'products' && e.detail.section === 'intro') {
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <h2 className="text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 sm:mb-12 md:mb-16" data-aos="fade-up">
          {content.title || defaultContent.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16 md:mb-20">
          <div className="text-gray-700 text-sm sm:text-base leading-relaxed" data-aos="fade-up">
            {content.paragraph1 || defaultContent.paragraph1}
          </div>
          
          <div className="text-gray-700 text-sm sm:text-base leading-relaxed" data-aos="fade-up">
            {content.paragraph2 || defaultContent.paragraph2}
          </div>
          
          <div className="text-gray-700 text-sm sm:text-base leading-relaxed" data-aos="fade-up">
            {content.paragraph3 || defaultContent.paragraph3}
          </div>
        </div>
      </div>
    </section>
  );
}
