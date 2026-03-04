import { useState, useEffect, useRef } from 'react';
import { normalizeImageUrl } from '../../../utils/cms';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface DifferentiatorsData {
  title?: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature1Image?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature2Image?: string;
  feature3Title?: string;
  feature3Desc?: string;
  feature3Image?: string;
}

export default function DifferentiatorsSection() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [data, setData] = useState<DifferentiatorsData>({});
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Default features
  const defaultFeatures = [
    {
      icon: 'ri-settings-3-line',
      text: 'Hybrid drive-train (gearbox + medium speed PMG) for superior performance'
    },
    {
      icon: 'ri-global-line',
      text: 'Proven technology with global installations in Australia, South Africa, Brazil and the Middle East'
    },
    {
      icon: 'ri-time-line',
      text: 'Rapid delivery'
    },
    {
      icon: 'ri-money-dollar-circle-line',
      text: 'Reduced Opex costs due to PMG and hybrid drive-train'
    },
    {
      icon: 'ri-hand-coin-line',
      text: 'Lower BOP costs with larger WTG sizes, achieving 20-25% savings'
    },
    {
      icon: 'ri-leaf-line',
      text: 'Decreased LCOE through technological efficiency and BOP savings'
    }
  ];

  // Build features from API data or use defaults
  const features = data.feature1Title ? [
    { icon: 'ri-settings-3-line', text: `${data.feature1Title}: ${data.feature1Desc || ''}` },
    { icon: 'ri-global-line', text: `${data.feature2Title || ''}: ${data.feature2Desc || ''}` },
    { icon: 'ri-time-line', text: `${data.feature3Title || ''}: ${data.feature3Desc || ''}` }
  ].filter(f => f.text.trim()) : defaultFeatures;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cms/home/cms/differentiators`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && Object.keys(result.data).length > 0) {
            setData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching differentiators content from API:', error);
        // Fallback to localStorage
        const savedContent = localStorage.getItem('cms_home_differentiators');
        if (savedContent) {
          try {
            setData(JSON.parse(savedContent));
          } catch (e) {
            console.error('Error loading differentiators from localStorage:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateImageHeight = () => {
      if (contentRef.current && imageRef.current) {
        const contentHeight = contentRef.current.offsetHeight;
        imageRef.current.style.height = `${contentHeight}px`;
      }
    };

    updateImageHeight();
    window.addEventListener('resize', updateImageHeight);
    
    return () => {
      window.removeEventListener('resize', updateImageHeight);
    };
  }, [loading, features]);

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-5 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
          {/* Content */}
          <div ref={contentRef} className="order-1 lg:order-2 flex flex-col flex-1">
            <h2 className="text-gray-900 text-4xl lg:text-5xl font-bold mb-6" data-aos="fade-left" data-aos-duration="1000">
              {data.title || 'Our differentiators'}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-8" data-aos="fade-left" data-aos-delay="100">
              Offering wind turbines with advanced German technology from Vensys Energy AG at competitive prices.
            </p>
            {!loading && (
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-4"
                    data-aos="fade-left"
                    data-aos-delay={150 + (index * 50)}
                    data-aos-duration="800"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8DC63F]/10 hover:bg-gray-900 flex items-center justify-center transition-all duration-300 group cursor-pointer">
                      <i className={`${feature.icon} text-[#8DC63F] group-hover:text-white text-xl transition-colors duration-300`}></i>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed pt-2">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>
            )}


            <div className="mt-10" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000">
              <a 
                href="/technology" 
                className="inline-block bg-[#8DC63F] hover:bg-[#7AB62F] text-white text-lg font-bold px-10 py-4 transition-all duration-300 cursor-pointer whitespace-nowrap"
              >
                Discover Our Technology
              </a>
            </div>
          </div>

          {/* Image */}
          <div ref={imageRef} className="order-2 lg:order-1 relative overflow-hidden flex-1" data-aos="fade-right" data-aos-duration="1200">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              src={data.feature1Image ? normalizeImageUrl(data.feature1Image) : normalizeImageUrl("https://venwindrefex.com/wp-content/uploads/2025/01/home-image.jpg")} 
              alt="Wind Turbine" 
              className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = normalizeImageUrl("https://venwindrefex.com/wp-content/uploads/2025/01/home-image.jpg");
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}