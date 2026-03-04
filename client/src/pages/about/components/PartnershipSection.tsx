import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface PartnershipItem {
  number: string;
  text: string;
}

interface PartnershipContent {
  title?: string;
  partnerships?: PartnershipItem[];
}

const defaultPartnerships: PartnershipItem[] = [
  {
    number: '01',
    text: 'Venwind holds an exclusive license with Vensys Energy AG, Germany, to manufacture 5.3 MW wind turbine based on permanent magnet generator with hybrid drive train technology.',
  },
  {
    number: '02',
    text: 'Over 120 GW of WTGs based on Vensys technology are operational worldwide across five continents.',
  },
  {
    number: '03',
    text: 'Vensys technology is proven in India with over 2.5 GW currently in operation.',
  },
  {
    number: '04',
    text: 'Vensys provides Venwind with ongoing support in technology, training, supervision, upgrades, and market development in India.',
  },
  {
    number: '05',
    text: 'Vensys pioneered permanent magnet generator technology for direct drive gearless and hybrid wind turbines, offering simple, low-maintenance designs for reliable wind energy yields across all locations.',
  },
];

export default function PartnershipSection() {
  const [content, setContent] = useState<PartnershipContent>({
    title: 'Partnership',
    partnerships: defaultPartnerships,
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
        const result = await getCMSData('about', 'partnership', {
          defaultValue: {
            title: 'Partnership',
            partnerships: defaultPartnerships,
          },
        });
        
        // Use CMS data if partnerships array exists and has content, otherwise use defaults
        if (result.data.partnerships && Array.isArray(result.data.partnerships) && result.data.partnerships.length > 0) {
          setContent({
            title: result.data.title || 'Partnership',
            partnerships: result.data.partnerships,
          });
        } else {
          setContent({
            title: 'Partnership',
            partnerships: defaultPartnerships,
          });
        }
      } catch (error) {
        console.error('Error loading partnership content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    // Listen for CMS updates
    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'about' && e.detail.section === 'partnership') {
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
      <section className="py-20 bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        {/* Title */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{content.title || 'Partnership'}</h2>
          <div className="w-20 h-0.5 bg-gray-700 mx-auto"></div>
        </div>

        {/* Partnership Items */}
        <div className="space-y-0">
          {(content.partnerships || defaultPartnerships).map((item, index) => (
            <div key={index}>
              <div 
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                {/* Number */}
                <div className="lg:col-span-4">
                  <h1 className="text-7xl md:text-8xl font-bold text-gray-800 hover:text-[#8DC63F] transition-colors duration-300 cursor-default">
                    {item.number}
                  </h1>
                </div>

                {/* Text */}
                <div className="lg:col-span-8 flex items-center">
                  <p className="text-gray-300 text-base leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>

              {/* Divider */}
              {index < (content.partnerships || defaultPartnerships).length - 1 && (
                <div className="border-t border-gray-800"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
