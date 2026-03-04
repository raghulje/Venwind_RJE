import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface VisionMissionContent {
  missionTitle?: string;
  missionContent?: string;
  missionImageUrl?: string;
  visionTitle?: string;
  visionContent?: string;
  visionImageUrl?: string;
}

const defaultContent: VisionMissionContent = {
  missionTitle: 'Mission',
  missionContent: 'To provide innovative, indigenous wind turbine solutions through strategic partnerships, ensuring cost efficiency, long-term reliability, and superior performance tailored to meet the needs of Independent Power Producers, Captive and Utility customers in a rapidly growing energy market.',
  missionImageUrl: 'https://venwindrefex.com/wp-content/uploads/elementor/thumbs/mission-qzn7h5mfpjwemfxu0i89k5p5zwy6rqmizyavo4zjiu.jpg',
  visionTitle: 'Vision',
  visionContent: 'To be a trusted leader in wind energy manufacturing, delivering cost-effective, reliable, and technologically advanced solutions that empower India\'s renewable energy sector and drive a sustainable future.',
  visionImageUrl: 'https://venwindrefex.com/wp-content/uploads/elementor/thumbs/vis-qzn7yb6fry1j7grkucaw20uhzrqupxso3h49510zys.jpg',
};

export default function VisionMissionSection() {
  const [content, setContent] = useState<VisionMissionContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('about', 'vision', {
          defaultValue: defaultContent,
        });
        // Merge with defaults to ensure all fields are present
        setContent({ ...defaultContent, ...result.data });
      } catch (error) {
        console.error('Error loading vision/mission content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    // Listen for CMS updates
    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'about' && e.detail.section === 'vision') {
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
      <section className="py-20 bg-[#f0f4f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#f0f4f0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Mission */}
          <div data-aos="fade-up">
            <div className="mb-8">
              <img 
                src={content.missionImageUrl || defaultContent.missionImageUrl}
                alt="Mission"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{content.missionTitle || defaultContent.missionTitle}</h2>
            <p className="text-gray-700 text-base leading-relaxed">
              {content.missionContent || defaultContent.missionContent}
            </p>
          </div>

          {/* Right Column - Vision */}
          <div data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{content.visionTitle || defaultContent.visionTitle}</h2>
            <p className="text-gray-700 text-base leading-relaxed mb-8">
              {content.visionContent || defaultContent.visionContent}
            </p>
            <div>
              <img 
                src={content.visionImageUrl || defaultContent.visionImageUrl}
                alt="Vision"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
