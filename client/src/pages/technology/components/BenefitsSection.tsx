import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData, normalizeImageUrl } from '../../../utils/cms';

interface BenefitItem {
  title: string;
  content: string;
}

interface BenefitsContent {
  title?: string;
  imageUrl?: string;
  items?: BenefitItem[];
}

const defaultBenefits: BenefitItem[] = [
  { title: 'Improved Power Generation', content: 'Higher wind energy utilization and adaptability. Large rotor diameter and higher hub height for its class. Lesser BOP and O&M costs due to larger size resulting in improved LCOE' },
  { title: 'Technology optimization', content: 'Optimized design strategy to get advantage of permanent magnet generator at medium speed' },
  { title: 'Lesser maintenance', content: 'Medium speed Gearbox (MSPM) design ensures minimum maintenance and high reliability' },
  { title: 'Reliability', content: 'German technology with more than 2GW installations of the 5.3MW WTG platform worldwide by Vensys technology partners' },
];

export default function BenefitsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [content, setContent] = useState<BenefitsContent>({
    title: 'Other Benefits',
    items: defaultBenefits,
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
        const result = await getCMSData('technology', 'benefits', {
          defaultValue: { title: 'Other Benefits', items: defaultBenefits },
        });
        const imageUrl = result.data.imageUrl && result.data.imageUrl.trim() ? result.data.imageUrl.trim() : undefined;
        
        setContent({
          title: result.data.title || 'Other Benefits',
          imageUrl,
          items: (result.data.items && result.data.items.length > 0) ? result.data.items : defaultBenefits,
        });
      } catch (error) {
        console.error('Error loading benefits content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'technology' && e.detail.section === 'benefits') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

  const benefits = content.items || defaultBenefits;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Image Left */}
          {content.imageUrl && (
            <div className="block mb-8 lg:mb-0" data-aos="fade-right">
              <div className="w-full overflow-hidden rounded-lg">
                <img 
                  src={normalizeImageUrl(content.imageUrl)}
                  alt="Other benefits"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Content Right */}
          <div className={content.imageUrl ? '' : 'lg:col-span-2'}>
            <div className="mb-6" data-aos="fade-left">
              <h2 className="text-gray-900 text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
                {content.title || 'Other Benefits'}
              </h2>
            </div>
            
            <div className="elementor-accordion bordered" style={{ borderTop: '1px solid #D4DFF2C7' }}>
              {benefits.map((benefit, index) => (
                <div key={index} className="elementor-accordion-item border-b border-gray-200" data-aos="fade-left" data-aos-delay={index * 50}>
                  <div
                    onClick={() => toggleAccordion(index)}
                    className="elementor-tab-title w-full flex items-center text-left py-4 hover:bg-[#8DC63F]/10 transition-colors cursor-pointer group"
                    role="button"
                    aria-expanded={openIndex === index}
                    tabIndex={0}
                  >
                    <span className="elementor-accordion-icon elementor-accordion-icon-left flex items-center justify-center flex-shrink-0 mr-4" aria-hidden="true">
                      <span className={openIndex === index ? 'elementor-accordion-icon-opened' : 'elementor-accordion-icon-closed'}>
                        {openIndex === index ? (
                          <i className="ri-subtract-line text-xl text-[#8DC63F]"></i>
                        ) : (
                          <i className="ri-add-line text-xl text-[#8DC63F]"></i>
                        )}
                      </span>
                    </span>
                    <span 
                      className="elementor-accordion-title text-gray-900 text-lg font-semibold flex-1 transition-colors group-hover:text-[#8DC63F] cursor-pointer"
                      style={{ color: openIndex === index ? '#8DC63F' : undefined }}
                    >
                      {benefit.title}
                    </span>
                  </div>
                  
                  <div 
                    className={`elementor-tab-content elementor-clearfix overflow-hidden transition-all duration-300 ${
                      openIndex === index ? 'max-h-[500px] pb-4' : 'max-h-0'
                    }`}
                    role="region"
                  >
                    <div className="pl-10 pr-0">
                      {benefit.content.includes('. ') && benefit.content.split('. ').filter(s => s.trim().length > 0).length > 1 ? (
                        <ul className="text-gray-700 text-sm leading-relaxed space-y-2 list-none">
                          {benefit.content.split('. ').filter(s => s.trim().length > 0).map((sentence, idx) => {
                            const trimmed = sentence.trim();
                            const cleanSentence = trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
                            return (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2 text-gray-400 flex-shrink-0">•</span>
                                <span>{cleanSentence}</span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {benefit.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

