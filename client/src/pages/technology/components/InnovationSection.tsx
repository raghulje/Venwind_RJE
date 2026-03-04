import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData, normalizeImageUrl } from '../../../utils/cms';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface InnovationContent {
  title?: string;
  items?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  { icon: 'ri-settings-3-line', title: 'High Reliability', description: 'Based on mature WTG design platform' },
  { icon: 'ri-flashlight-line', title: 'High Performance', description: 'The turbine specific and site-level self-learning optimization algorithm, enables autonomous optimization of power generation performance' },
  { icon: 'ri-stack-line', title: 'High Scalability', description: 'Multiple optional configurations and software & hardware interfaces based on platform and module development' },
  { icon: 'ri-plug-line', title: 'Grid Friendly Connection', description: 'ZVRT and primary frequency modulation realizes outstanding grid code compliance even in case of a weak grid, hence voltage ride through (LVRT & HVRT)' },
  { icon: 'ri-tools-line', title: 'High Adaptability', description: 'Load shedding technology based on advanced sensing for harnessing maximum performance potential' },
  { icon: 'ri-shield-check-line', title: 'High Safety', description: 'Reliable precaution strategies for extreme weather can be delivered based on the exclusively accurate weather data' },
];

export default function InnovationSection() {
  const [content, setContent] = useState<InnovationContent>({
    title: 'Salient features',
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
        const result = await getCMSData('technology', 'innovation', {
          defaultValue: { title: 'Salient features', items: defaultFeatures },
        });
        
        // Merge CMS items with defaults - only use defaults if CMS data is missing
        let mergedItems = defaultFeatures;
        if (result.data.items && result.data.items.length > 0) {
          mergedItems = result.data.items.map((item: FeatureItem, index: number) => ({
            ...item,
            // Only use default icon if icon is completely missing, not if it's intentionally empty
            icon: item.icon !== undefined && item.icon !== null ? item.icon.trim() : (defaultFeatures[index]?.icon || ''),
            title: item.title && item.title.trim() ? item.title.trim() : (defaultFeatures[index]?.title || ''),
            description: item.description && item.description.trim() ? item.description.trim() : (defaultFeatures[index]?.description || ''),
          }));
        }
        
        setContent({
          title: result.data.title || 'Salient features',
          items: mergedItems,
        });
      } catch (error) {
        console.error('Error loading innovation content:', error);
        setContent({
          title: 'Salient features',
          items: defaultFeatures,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'technology' && e.detail.section === 'innovation') {
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  const features = content.items || defaultFeatures;
  
  // Filter out items that have no content (no icon, no title, no description)
  const visibleFeatures = features.filter(feature => {
    const hasIcon = feature.icon && feature.icon.trim() && feature.icon.trim() !== '';
    const hasTitle = feature.title && feature.title.trim() && feature.title.trim() !== '';
    const hasDescription = feature.description && feature.description.trim() && feature.description.trim() !== '';
    return hasIcon || hasTitle || hasDescription;
  });

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <h2 className="text-gray-900 text-4xl lg:text-5xl font-bold text-center mb-16" data-aos="fade-up">
          {content.title || 'Salient features'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch">
          {visibleFeatures.map((feature, index) => (
            <div 
              key={index}
              className="text-center h-full flex flex-col"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {feature.icon && feature.icon.trim() && feature.icon.trim() !== '' && (
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8DC63F20' }}>
                  {(feature.icon.startsWith('http') || feature.icon.startsWith('/') || (feature.icon.includes('.') && !feature.icon.startsWith('ri-'))) ? (
                    <img 
                      src={normalizeImageUrl(feature.icon)} 
                      alt={feature.title}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        // Hide icon container if image fails to load and no fallback
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement?.parentElement;
                        if (parent) {
                          parent.style.display = 'none';
                        }
                      }}
                    />
                  ) : (
                    <i className={`${feature.icon} text-4xl`} style={{ color: '#8DC63F' }}></i>
                  )}
                </div>
              )}
              {feature.title && feature.title.trim() && (
                <h3 className="text-gray-900 text-xl font-bold mb-4">{feature.title}</h3>
              )}
              {feature.description && feature.description.trim() && (
                <p className="text-gray-700 text-base leading-relaxed flex-grow">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
