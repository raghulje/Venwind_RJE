import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useCMS } from '../../../hooks/useCMS';

interface FutureGoalsContent {
  title: string;
  description: string;
  bgImageUrl: string;
}

const defaultContent: FutureGoalsContent = {
  title: 'Future Goals',
  description: 'Scale up production to meet India\'s renewable targets and continue R&D investments for enhanced turbine efficiency.',
  bgImageUrl: 'https://static.readdy.ai/image/d0ead66ce635a168f1e83b108be94826/1068d46b1e389bbe3b4192e16de71e05.png',
};

export default function FutureGoalsSection() {
  const { data: content, loading } = useCMS<FutureGoalsContent>(
    'sustainability',
    'future-goals',
    {
      defaultValue: defaultContent,
    }
  );

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  // Ensure content always has values, merge with defaults
  const displayContent: FutureGoalsContent = {
    title: (content?.title && typeof content.title === 'string' && content.title.trim()) 
      ? content.title 
      : defaultContent.title,
    description: (content?.description && typeof content.description === 'string' && content.description.trim()) 
      ? content.description 
      : defaultContent.description,
    bgImageUrl: (content?.bgImageUrl && typeof content.bgImageUrl === 'string' && content.bgImageUrl.trim()) 
      ? content.bgImageUrl 
      : defaultContent.bgImageUrl,
  };

  return (
    <section 
      className="relative bg-cover bg-center py-16 sm:py-24 lg:py-32 xl:py-40 overflow-hidden"
      style={{
        backgroundImage: `url(${displayContent.bgImageUrl})`,
        position: 'relative',
      }}
    >
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30"
        style={{ zIndex: 1 }}
      ></div>
      
      {/* Content on top - Always visible, even during loading */}
      <div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-16"
        style={{ zIndex: 10, position: 'relative' }}
      >
        <div className="max-w-2xl" data-aos="fade-up">
          <h2 
            className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8 drop-shadow-lg" 
            style={{ position: 'relative', zIndex: 11 }}
          >
            {displayContent.title}
          </h2>
          <p 
            className="text-white text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed drop-shadow-md" 
            style={{ position: 'relative', zIndex: 11 }}
          >
            {displayContent.description}
          </p>
        </div>
        {loading && (
          <div className="absolute top-4 right-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </section>
  );
}
