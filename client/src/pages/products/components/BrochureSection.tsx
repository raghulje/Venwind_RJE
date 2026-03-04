import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface BrochureContent {
  title?: string;
  buttonText?: string;
  brochureUrl?: string;
}

const defaultContent: BrochureContent = {
  title: 'Download Our Product Brochure!',
  buttonText: 'Download',
  brochureUrl: 'https://venwindrefex.com/wp-content/uploads/2025/02/Brochure_Venwind.pdf',
};

export default function BrochureSection() {
  const [content, setContent] = useState<BrochureContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('products', 'brochure', {
          defaultValue: defaultContent,
        });
        setContent({ ...defaultContent, ...result.data });
      } catch (error) {
        console.error('Error loading brochure content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'products' && e.detail.section === 'brochure') {
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
      <section className="py-16 bg-[#8DC63F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-[#8DC63F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
          <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
            {content.title || defaultContent.title}
          </h2>
          
          <a 
            href={content.brochureUrl || defaultContent.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white hover:bg-gray-100 text-gray-900 text-base sm:text-lg font-bold px-8 sm:px-10 py-3 sm:py-4 transition-all duration-300 cursor-pointer w-full sm:w-auto"
          >
            {content.buttonText || defaultContent.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
