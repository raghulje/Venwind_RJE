import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData, normalizeImageUrl } from '../../../utils/cms';

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

interface TechnicalBenefitsContent {
  title?: string;
  items?: BenefitItem[];
}

const defaultBenefits: BenefitItem[] = [
  { icon: 'ri-settings-3-line', title: 'PMG Advantage', description: 'No external power needed to start, with minimal reactive power consumption.' },
  { icon: 'ri-radar-line', title: 'LiDAR Control', description: 'Measures wind ahead of the rotor in 3D, enhancing accuracy over traditional anemometers.' },
  { icon: 'ri-plug-line', title: 'Grid Compatibility', description: 'Full Power Converter ensures efficiency, better power quality, and supports LVRT, HVRT, ZVRT, and frequency ride-through.' },
  { icon: 'ri-dashboard-line', title: 'High Efficiency', description: 'PMG and higher generator voltage (1380 V) reduce losses with lower RPM.' },
  { icon: 'ri-expand-diagonal-line', title: 'Scalability', description: 'Expandable platform.' },
];

export default function TechnicalBenefitsSection() {
  const [content, setContent] = useState<TechnicalBenefitsContent>({
    title: 'Technical Benefits',
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
        const result = await getCMSData('products', 'technical-benefits', {
          defaultValue: { title: 'Technical Benefits', items: defaultBenefits },
        });
        
        // Merge CMS items with defaults - use default icon if CMS icon is empty
        let mergedItems = defaultBenefits;
        if (result.data.items && result.data.items.length > 0) {
          mergedItems = result.data.items.map((item: BenefitItem, index: number) => ({
            ...item,
            icon: item.icon && item.icon.trim() ? item.icon.trim() : (defaultBenefits[index]?.icon || 'ri-settings-3-line'),
            title: item.title && item.title.trim() ? item.title.trim() : (defaultBenefits[index]?.title || ''),
            description: item.description && item.description.trim() ? item.description.trim() : (defaultBenefits[index]?.description || ''),
          }));
        }
        
        setContent({
          title: result.data.title || 'Technical Benefits',
          items: mergedItems,
        });
      } catch (error) {
        console.error('Error loading technical benefits content:', error);
        setContent({
          title: 'Technical Benefits',
          items: defaultBenefits,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'products' && e.detail.section === 'technical-benefits') {
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
      <section className="py-20 bg-gray-900 text-white">
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
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 sm:mb-12 md:mb-16" data-aos="fade-up">
          {content.title || 'Technical Benefits'}
        </h2>
        
        <div className="space-y-6 sm:space-y-8">
          {benefits.map((benefit, index) => (
            <div key={index}>
              <div 
                className="border-b border-gray-700 pb-6 sm:pb-8"
                data-aos="fade-up"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
                  <div className="md:col-span-2 flex justify-center md:justify-start">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white flex items-center justify-center hover:bg-[#8DC63F] hover:border-[#8DC63F] transition-all duration-300 cursor-pointer group">
                      {benefit.icon && benefit.icon.trim() && (benefit.icon.startsWith('http') || benefit.icon.startsWith('/') || (benefit.icon.includes('.') && !benefit.icon.startsWith('ri-'))) ? (
                        <img 
                          src={normalizeImageUrl(benefit.icon)} 
                          alt={benefit.title}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback to RemixIcon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const iconIndex = defaultBenefits.findIndex(b => b.title === benefit.title);
                              const fallbackIcon = iconIndex >= 0 ? defaultBenefits[iconIndex].icon : 'ri-settings-3-line';
                              const iconElement = document.createElement('i');
                              iconElement.className = `${fallbackIcon} text-xl sm:text-2xl group-hover:rotate-180 transition-transform duration-500`;
                              parent.appendChild(iconElement);
                            }
                          }}
                        />
                      ) : (
                        <i className={`${benefit.icon || defaultBenefits[index]?.icon || 'ri-settings-3-line'} text-xl sm:text-2xl group-hover:rotate-180 transition-transform duration-500`}></i>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-4 text-center md:text-left">
                    <h3 className="text-white text-xl sm:text-2xl font-bold">{benefit.title}</h3>
                  </div>
                  
                  <div className="md:col-span-6 text-center md:text-left">
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
