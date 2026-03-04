import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface CommitmentItem {
  title: string;
  description: string;
  image: string;
}

interface CommitmentContent {
  title?: string;
  items?: CommitmentItem[];
}

const defaultCommitments: CommitmentItem[] = [
  {
    title: 'Carbon Footprint Reduction',
    description: 'Advanced wind technology minimizes emissions.',
    image: 'https://venwindrefex.com/wp-content/uploads/2025/01/sustainibility-img01.jpg'
  },
  {
    title: 'Cost Efficiency',
    description: 'Low lifecycle costs through innovative engineering.',
    image: 'https://venwindrefex.com/wp-content/uploads/2025/01/sustainibility-img02.jpg'
  },
  {
    title: 'Community Impact',
    description: 'Job creation and access to renewable energy for local communities.',
    image: 'https://venwindrefex.com/wp-content/uploads/2025/01/sustainibility-img03.jpg'
  }
];

export default function CommitmentSection() {
  const [content, setContent] = useState<CommitmentContent>({
    title: 'Our Commitment',
    items: defaultCommitments,
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
        const result = await getCMSData('sustainability', 'commitment', {
          defaultValue: { title: 'Our Commitment', items: defaultCommitments },
        });
        setContent({
          title: result.data.title || 'Our Commitment',
          items: (result.data.items && result.data.items.length > 0) ? result.data.items : defaultCommitments,
        });
      } catch (error) {
        console.error('Error loading commitment content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'sustainability' && e.detail.section === 'commitment') {
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
      <section className="bg-white py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  const commitments = content.items || defaultCommitments;

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <h2 
          className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16"
          data-aos="fade-up"
        >
          {content.title || 'Our Commitment'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {commitments.map((item, index) => (
            <div 
              key={index}
              className="text-center group cursor-pointer"
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <div className="mb-4 sm:mb-6 overflow-hidden rounded-lg shadow-lg">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
              </div>
              <h3 className="text-gray-900 text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                {item.title}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
