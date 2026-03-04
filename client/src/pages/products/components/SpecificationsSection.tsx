import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface SpecItem {
  value: string;
  label: string;
}

interface SpecificationsContent {
  title?: string;
  items?: SpecItem[];
}

const defaultSpecs: SpecItem[] = [
  { value: '5.3 MW', label: 'Rated Capacity' },
  { value: '183.4m', label: 'Rotor Diameter' },
  { value: '26417 m<sup>2</sup>', label: 'Swept Area' },
  { value: '130m', label: 'Hub Height' },
  { value: '2.5 m/s', label: 'Cut-in Wind Speed' },
  { value: 'IEC S', label: 'Class' },
];

export default function SpecificationsSection() {
  const [content, setContent] = useState<SpecificationsContent>({
    title: 'Technical Specifications',
    items: defaultSpecs,
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
        const result = await getCMSData('products', 'specifications', {
          defaultValue: { title: 'Technical Specifications', items: defaultSpecs },
        });
        setContent({
          title: result.data.title || 'Technical Specifications',
          items: (result.data.items && result.data.items.length > 0) ? result.data.items : defaultSpecs,
        });
      } catch (error) {
        console.error('Error loading specifications content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'products' && e.detail.section === 'specifications') {
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
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  const specs = content.items || defaultSpecs;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Abstract Wavy Line Pattern */}
      <div className="absolute left-0 top-0 w-1/2 lg:w-2/5 h-full pointer-events-none overflow-hidden">
        <svg 
          className="absolute inset-0 w-full h-full" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 600 1000" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wavy-fade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d1d5db" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#d1d5db" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#d1d5db" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Flowing abstract wavy lines with smooth curves */}
          {[...Array(35)].map((_, i) => {
            const baseY = i * 30;
            const amplitude = 5 + Math.sin(i * 0.5) * 4;
            const frequency = 0.012 + (i % 5) * 0.006;
            const phase = Math.sin(i * 0.7) * 25;
            const wave2Freq = frequency * 0.8;
            const wave2Amp = amplitude * 0.4;
            
            // Create smooth flowing path
            const points: string[] = [];
            for (let x = 0; x <= 600; x += 10) {
              const y = baseY + 
                       Math.sin(x * frequency + phase) * amplitude + 
                       Math.cos(x * wave2Freq + phase * 0.7) * wave2Amp;
              points.push(`${x},${y}`);
            }
            
            // Build smooth path using cubic bezier curves
            let pathData = `M ${points[0]}`;
            for (let j = 1; j < points.length; j++) {
              const [x1, y1] = points[j - 1].split(',').map(Number);
              const [x2, y2] = points[j].split(',').map(Number);
              const [x3, y3] = j < points.length - 1 ? points[j + 1].split(',').map(Number) : [x2, y2];
              
              const cp1x = x1 + (x2 - x1) / 3;
              const cp1y = y1 + (y2 - y1) / 3;
              const cp2x = x2 - (x3 - x2) / 3;
              const cp2y = y2 - (y3 - y2) / 3;
              
              pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
            }
            
            return (
              <path
                key={i}
                d={pathData}
                fill="none"
                stroke="#9ca3af"
                strokeWidth="0.6"
                opacity={0.22 - (i * 0.003)}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {/* Gradient overlay for fade effect */}
          <rect width="100%" height="100%" fill="url(#wavy-fade)" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-16 relative z-10">
        <h2 className="text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-16 md:mb-20" data-aos="fade-up">
          {content.title || 'Technical Specifications'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {specs.slice(0, 3).map((spec, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="fade-up"
            >
              <h2 className="text-gray-900 text-4xl sm:text-5xl md:text-6xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: spec.value }}></h2>
              <div className="w-24 h-1 bg-[#8DC63F] mx-auto mb-4"></div>
              <h5 className="text-gray-700 text-base sm:text-lg font-semibold">{spec.label}</h5>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {specs.slice(3).map((spec, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="fade-up"
            >
              <h2 className="text-gray-900 text-4xl sm:text-5xl md:text-6xl font-bold mb-4">{spec.value}</h2>
              <div className="w-24 h-1 bg-[#8DC63F] mx-auto mb-4"></div>
              <h5 className="text-gray-700 text-base sm:text-lg font-semibold">{spec.label}</h5>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
