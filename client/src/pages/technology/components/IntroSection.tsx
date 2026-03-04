import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData, normalizeImageUrl } from '../../../utils/cms';

interface IntroContent {
  label?: string;
  title?: string;
  imageUrl?: string;
  listItems?: string[];
}

const defaultContent: IntroContent = {
  label: 'Overview',
  title: 'Advanced Technology for Superior Performance',
  imageUrl: 'https://venwindrefex.com/wp-content/uploads/2025/01/gallery-img03.jpg',
  listItems: [
    'Permanent magnet synchronous generator and full-scale power converter enables rapid dispatch response, more active power/frequency, reactive power/voltage control, and smoother fault voltage ride-through',
    'Reduced maintenance as a result of elimination of high-speed couplings and slip ring carbon brushes, cutting fault rates by 70% compared to DFIG wind turbines',
  ],
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
        const result = await getCMSData('technology', 'intro', {
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
      if (e.detail.page === 'technology' && e.detail.section === 'intro') {
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
      <section className="py-0 bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-0 bg-white">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 bg-white">
          <img
            src={normalizeImageUrl(content.imageUrl || defaultContent.imageUrl)}
            alt="Wind Turbine Technology"
            className="w-full h-full object-contain bg-white"
            data-aos="fade-right"
          />
        </div>

        <div className="w-full lg:w-1/2 bg-white relative flex items-center">
          <div className="w-full px-8 lg:px-12 xl:px-16 py-16 lg:py-20">
            <span className="text-xs font-semibold uppercase tracking-wider mb-4 block" style={{ color: '#8DC63F' }} data-aos="fade-up">
              {content.label || defaultContent.label}
            </span>
            <h2 className="text-gray-900 text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 lg:mb-10" data-aos="fade-up" data-aos-delay="100">
              {content.title || defaultContent.title}
            </h2>
            <ul className="space-y-5 text-gray-800 text-base lg:text-lg leading-relaxed" data-aos="fade-up" data-aos-delay="200">
              {(content.listItems || defaultContent.listItems || []).map((item, index) => (
                <li key={index} className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-2xl mr-4 mt-0.5 flex-shrink-0" style={{ color: '#8DC63F' }}></i>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
