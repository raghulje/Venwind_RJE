import { useState, useEffect, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData, normalizeImageUrl } from '../../../utils/cms';

interface AdvantageItem {
  title: string;
  content: string;
}

interface AdvantagesContent {
  title?: string;
  imageUrl?: string;
  items?: AdvantageItem[];
}

const defaultAdvantages: AdvantageItem[] = [
  { title: 'Higher Wind Energy Utilization', content: 'Permanent magnet medium speed technology' },
  { title: 'Larger Rotor Diameter and Higher Hub Heights in its Class', content: 'Captures more wind energy, higher tip speed ratio' },
  { title: 'Flexible Modular Design', content: 'Supports enhancement to higher capacity and higher rotor diameter' },
  { title: 'Supports application scenarios such as energy storage and distributed wind power', content: 'Designed to operate at higher capacities (4.8MW and above)' },
  { title: 'Grid Connection', content: 'Operates at a constant power factor, independent of grid voltage. No need for external grid excitation' },
  { title: 'Low cut-in wind speed', content: 'Cut-in wind speed 2.5m/s' },
];

export default function AdvantagesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [content, setContent] = useState<AdvantagesContent>({
    title: 'Advantages over Competitors',
    items: defaultAdvantages,
  });
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('technology', 'advantages', {
          defaultValue: { title: 'Advantages over Competitors', items: defaultAdvantages },
        });
        const imageUrl = result.data.imageUrl && result.data.imageUrl.trim() ? result.data.imageUrl.trim() : undefined;
        
        setContent({
          title: result.data.title || 'Advantages over Competitors',
          imageUrl,
          items: (result.data.items && result.data.items.length > 0) ? result.data.items : defaultAdvantages,
        });
      } catch (error) {
        console.error('Error loading advantages content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'technology' && e.detail.section === 'advantages') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, []);

  // Match image height to content height
  useEffect(() => {
    if (!content.imageUrl || loading) return;

    const updateImageHeight = () => {
      if (contentRef.current && imageContainerRef.current) {
        const contentHeight = contentRef.current.offsetHeight;
        if (contentHeight > 0) {
          imageContainerRef.current.style.height = `${contentHeight}px`;
        }
      }
    };

    // Initial update after render
    const timer1 = setTimeout(updateImageHeight, 100);
    
    // Update on resize
    window.addEventListener('resize', updateImageHeight);
    
    // Update when accordion state changes
    const timer2 = setTimeout(updateImageHeight, 200);
    
    return () => {
      window.removeEventListener('resize', updateImageHeight);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [openIndex, content.imageUrl, content.items, loading]);

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

  const advantages = content.items || defaultAdvantages;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Content Left */}
          <div ref={contentRef} className={content.imageUrl ? 'order-2 lg:order-1' : 'lg:col-span-2'}>
            <div className="mb-6" data-aos="fade-right">
              <h2 className="text-gray-900 text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
                {content.title || 'Advantages over Competitors'}
              </h2>
            </div>
            
            <div className="elementor-accordion bordered" style={{ borderTop: '1px solid #D4DFF2C7' }}>
              {advantages.map((advantage, index) => (
                <div key={index} className="elementor-accordion-item border-b border-gray-200" data-aos="fade-right" data-aos-delay={index * 50}>
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
                      {advantage.title}
                    </span>
                  </div>
                  
                  <div 
                    className={`elementor-tab-content elementor-clearfix overflow-hidden transition-all duration-300 ${
                      openIndex === index ? 'max-h-[500px] pb-4' : 'max-h-0'
                    }`}
                    role="region"
                  >
                    <div className="pl-10 pr-0">
                      {advantage.content.includes('. ') && advantage.content.split('. ').filter(s => s.trim().length > 0).length > 1 ? (
                        <ul className="text-gray-700 text-sm leading-relaxed space-y-2 list-none">
                          {advantage.content.split('. ').filter(s => s.trim().length > 0).map((sentence, idx) => {
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
                          {advantage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Right */}
          {content.imageUrl && (
            <div ref={imageContainerRef} className="block lg:flex mb-8 lg:mb-0 order-1 lg:order-2 items-center min-h-[300px] sm:min-h-[400px] lg:min-h-auto" data-aos="fade-left">
              <div className="w-full h-full overflow-hidden rounded-lg">  
                <img 
                  src={normalizeImageUrl(content.imageUrl)}
                  alt="Advantages over competitors"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

