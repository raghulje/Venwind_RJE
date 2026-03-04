import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData, normalizeImageUrl } from '../../../utils/cms';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesContent {
  title?: string;
  items?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  { icon: 'ri-settings-3-line', title: 'Core Efficiency', description: 'MSPM drive train with a permanent magnet generator minimizes energy loss and maximizes output.' },
  { icon: 'ri-thunderstorms-line', title: 'High Power Output', description: '182m rotor diameter.' },
  { icon: 'ri-plug-line', title: 'Grid-Friendly', description: 'Full-power converter (AC-DC-AC) ensures smooth grid integration with LVRT and HVRT compatibility.' },
  { icon: 'ri-tools-line', title: 'Low Maintenance', description: 'Medium-speed gearbox reduces wear, cutting costs and extending lifespan.' },
  { icon: 'ri-speed-line', title: 'Superior Performance', description: 'Starts power generation at 2.5 m/s cut-in wind speed.' },
  { icon: 'ri-stack-line', title: 'Adaptable Design', description: 'Modular structure supports future upgrades and scalability.' },
];

export default function FeaturesSection() {
  const [content, setContent] = useState<FeaturesContent>({
    title: 'Why choose the GWH182-5.3MW wind turbine?',
    items: defaultFeatures,
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
        const result = await getCMSData('products', 'features', {
          defaultValue: { title: 'Why choose the GWH182-5.3MW wind turbine?', items: defaultFeatures },
        });
        
        // Merge CMS items with defaults - use default icon if CMS icon is empty
        let mergedItems = defaultFeatures;
        if (result.data.items && result.data.items.length > 0) {
          mergedItems = result.data.items.map((item: FeatureItem, index: number) => ({
            ...item,
            icon: item.icon && item.icon.trim() ? item.icon.trim() : (defaultFeatures[index]?.icon || 'ri-settings-3-line'),
            title: item.title && item.title.trim() ? item.title.trim() : (defaultFeatures[index]?.title || ''),
            description: item.description && item.description.trim() ? item.description.trim() : (defaultFeatures[index]?.description || ''),
          }));
          // Ensure we have exactly 6 items
          while (mergedItems.length < 6) {
            mergedItems.push(defaultFeatures[mergedItems.length] || defaultFeatures[0]);
          }
        }
        
        setContent({
          title: result.data.title || 'Why choose the GWH182-5.3MW wind turbine?',
          items: mergedItems,
        });
      } catch (error) {
        console.error('Error loading features content:', error);
        setContent({
          title: 'Why choose the GWH182-5.3MW wind turbine?',
          items: defaultFeatures,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'products' && e.detail.section === 'features') {
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
      <section className="py-20 bg-[#f5f7f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  const features = content.items || defaultFeatures;

  return (
    <section className="py-20 bg-[#f5f7f0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <h2 className="text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 sm:mb-12 md:mb-16" data-aos="fade-up">
          {content.title || 'Why choose the GWH182-5.3MW wind turbine?'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {features.slice(0, 3).map((feature, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="fade-up"
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#8DC63F]/10 flex items-center justify-center hover:bg-[#8DC63F] hover:scale-110 transition-all duration-300 cursor-pointer group">
                  {feature.icon && feature.icon.trim() && (feature.icon.startsWith('http') || feature.icon.startsWith('/') || (feature.icon.includes('.') && !feature.icon.startsWith('ri-'))) ? (
                    <img 
                      src={normalizeImageUrl(feature.icon)} 
                      alt={feature.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to RemixIcon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const iconIndex = defaultFeatures.findIndex(f => f.title === feature.title);
                          const fallbackIcon = iconIndex >= 0 ? defaultFeatures[iconIndex].icon : 'ri-settings-3-line';
                          const iconElement = document.createElement('i');
                          iconElement.className = `${fallbackIcon} text-[#8DC63F] text-4xl sm:text-5xl group-hover:text-white group-hover:rotate-12 transition-all duration-300`;
                          parent.appendChild(iconElement);
                        }
                      }}
                    />
                  ) : (
                    <i className={`${feature.icon || defaultFeatures[index]?.icon || 'ri-settings-3-line'} text-[#8DC63F] text-4xl sm:text-5xl group-hover:text-white group-hover:rotate-12 transition-all duration-300`}></i>
                  )}
                </div>
              </div>
              <h4 className="text-gray-900 text-lg sm:text-xl font-bold mb-3 sm:mb-4">{feature.title}</h4>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {features.slice(3).map((feature, idx) => {
            const index = idx + 3;
            return (
              <div 
                key={index} 
                className="text-center"
                data-aos="fade-up"
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#8DC63F]/10 flex items-center justify-center hover:bg-[#8DC63F] hover:scale-110 transition-all duration-300 cursor-pointer group">
                    {feature.icon && feature.icon.trim() && (feature.icon.startsWith('http') || feature.icon.startsWith('/') || (feature.icon.includes('.') && !feature.icon.startsWith('ri-'))) ? (
                      <img 
                        src={normalizeImageUrl(feature.icon)} 
                        alt={feature.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to RemixIcon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const iconIndex = defaultFeatures.findIndex(f => f.title === feature.title);
                            const fallbackIcon = iconIndex >= 0 ? defaultFeatures[iconIndex].icon : 'ri-settings-3-line';
                            const iconElement = document.createElement('i');
                            iconElement.className = `${fallbackIcon} text-[#8DC63F] text-4xl sm:text-5xl group-hover:text-white group-hover:rotate-12 transition-all duration-300`;
                            parent.appendChild(iconElement);
                          }
                        }}
                      />
                    ) : (
                      <i className={`${feature.icon || defaultFeatures[index]?.icon || 'ri-settings-3-line'} text-[#8DC63F] text-4xl sm:text-5xl group-hover:text-white group-hover:rotate-12 transition-all duration-300`}></i>
                    )}
                  </div>
                </div>
                <h4 className="text-gray-900 text-lg sm:text-xl font-bold mb-3 sm:mb-4">{feature.title}</h4>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
