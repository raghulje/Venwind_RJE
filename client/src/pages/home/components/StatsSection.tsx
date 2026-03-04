import { useEffect, useRef, useState } from 'react';
import { normalizeImageUrl } from '../../../utils/cms';
import propellerIcon from '@/assets/propeller-1.svg';
import diameterIcon from '@/assets/diameter-5.svg';
import thunderboltIcon from '@/assets/thunderbolt.svg';
import planetEarthIcon from '@/assets/planet-earth.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface StatsData {
  stat1Number?: string;
  stat1Label?: string;
  stat1Icon?: string;
  stat2Number?: string;
  stat2Label?: string;
  stat2Icon?: string;
  stat3Number?: string;
  stat3Label?: string;
  stat3Icon?: string;
  stat4Number?: string;
  stat4Label?: string;
  stat4Icon?: string;
  bgImageUrl?: string;
}

export default function StatsSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState({
    power: 0,
    diameter: 0,
    operational: 0,
    countries: 0
  });
  const [statsData, setStatsData] = useState<StatsData>({});
  const [, setLoading] = useState(true);

  // Default stats
  const defaultStats = [
    {
      icon: propellerIcon,
      value: 5.3,
      unit: 'MW',
      key: 'power',
      description: 'Permanent Magnet Generator with Medium-Speed Gearbox Hybrid Technology – Best in Class',
      alt: 'Propeller',
      delay: 0
    },
    {
      icon: diameterIcon,
      value: 183.4,
      unit: 'm',
      key: 'diameter',
      description: 'Rotor Diameter and 130m Tower Height – Capturing Optimal Wind Energy',
      alt: 'Diameter',
      delay: 100
    },
    {
      icon: thunderboltIcon,
      value: 128,
      unit: '+ GW',
      key: 'operational',
      description: 'Operational Worldwide based on Vensys technology',
      alt: 'Thunderbolt',
      delay: 200
    },
    {
      icon: planetEarthIcon,
      value: 38,
      unit: '+',
      key: 'countries',
      description: 'Countries Operating globally utilizing wind turbine technology by Vensys',
      alt: 'Planet Earth',
      delay: 300
    }
  ];

  // Build stats from API data or use defaults
  const stats = statsData.stat1Number ? [
    {
      icon: statsData.stat1Icon || propellerIcon,
      value: parseFloat(statsData.stat1Number || '0') || 0,
      unit: '',
      key: 'power',
      description: statsData.stat1Label || '',
      alt: 'Stat 1',
      delay: 0
    },
    {
      icon: statsData.stat2Icon || diameterIcon,
      value: parseFloat(statsData.stat2Number || '0') || 0,
      unit: '',
      key: 'diameter',
      description: statsData.stat2Label || '',
      alt: 'Stat 2',
      delay: 100
    },
    {
      icon: statsData.stat3Icon || thunderboltIcon,
      value: parseFloat(statsData.stat3Number || '0') || 0,
      unit: '',
      key: 'operational',
      description: statsData.stat3Label || '',
      alt: 'Stat 3',
      delay: 200
    },
    {
      icon: statsData.stat4Icon || planetEarthIcon,
      value: parseFloat(statsData.stat4Number || '0') || 0,
      unit: '',
      key: 'countries',
      description: statsData.stat4Label || '',
      alt: 'Stat 4',
      delay: 300
    }
  ] : defaultStats;

  useEffect(() => {
    // Fetch stats data from API
    const fetchStatsData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cms/home/cms/stats`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && Object.keys(result.data).length > 0) {
            setStatsData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching stats content from API:', error);
        // Fallback to localStorage
        const savedContent = localStorage.getItem('cms_home_stats');
        if (savedContent) {
          try {
            setStatsData(JSON.parse(savedContent));
          } catch (e) {
            console.error('Error loading stats from localStorage:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts({
        power: parseFloat((5.3 * progress).toFixed(1)),
        diameter: parseFloat((183.4 * progress).toFixed(1)),
        operational: Math.floor(128 * progress),
        countries: Math.floor(38 * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounts({
          power: 5.3,
          diameter: 183.4,
          operational: 128,
          countries: 38
        });
      }
    }, interval);
  };

  const getDisplayValue = (stat: typeof stats[0]) => {
    const countKey = stat.key as keyof typeof counts;
    const currentValue = counts[countKey];
    
    if (stat.key === 'power' || stat.key === 'diameter') {
      return currentValue.toFixed(1);
    }
    return currentValue.toString();
  };

  return (
    <section 
      id="stats-section" 
      className="bg-white py-12 lg:py-16" 
      ref={sectionRef}
      style={statsData.bgImageUrl ? { 
        backgroundImage: `url(${normalizeImageUrl(statsData.bgImageUrl)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-5 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center" 
              data-aos="fade-up" 
              data-aos-delay={stat.delay}
            >
              <div className="flex justify-center mb-6">
                {(() => {
                  const iconUrl = typeof stat.icon === 'string' ? stat.icon : String(stat.icon || '');
                  const isImageUrl = iconUrl && iconUrl.trim() && !iconUrl.startsWith('ri-') && (iconUrl.startsWith('http') || iconUrl.startsWith('/') || iconUrl.includes('.'));
                  
                  if (isImageUrl) {
                    return (
                      <img 
                        src={normalizeImageUrl(iconUrl)} 
                        alt={stat.alt} 
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          // Fallback to RemixIcon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('i')) {
                            const iconElement = document.createElement('i');
                            iconElement.className = `ri-image-line text-[#8DC63F] text-5xl`;
                            parent.appendChild(iconElement);
                          }
                        }}
                      />
                    );
                  } else {
                    return (
                      <div className="w-20 h-20 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                        {iconUrl && iconUrl.startsWith('ri-') ? (
                          <i className={`${iconUrl} text-[#8DC63F] text-5xl`}></i>
                        ) : iconUrl ? (
                          <img 
                            src={iconUrl} 
                            alt={stat.alt} 
                            className="w-20 h-20 object-contain"
                          />
                        ) : (
                          <i className="ri-image-line text-[#8DC63F] text-5xl"></i>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
              <div className="text-gray-900 text-5xl font-bold mb-4">
                {getDisplayValue(stat)}{stat.unit}
              </div>
              <p className="text-gray-700 text-base leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
