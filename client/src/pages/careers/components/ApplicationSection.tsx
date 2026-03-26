import { useState, useEffect } from 'react';
import { getCMSData } from '../../../utils/cms';

// Kissflow careers form iframe – careers page only (contact form is unchanged).
// Replace with your Kissflow careers process public/embed URL if different.
const KISSFLOW_CAREERS_FORM_URL = 'https://development-refexgroup.kissflow.com/public/Process/Pf1152c833-6b47-4361-a767-f66a99e07b30';

interface ApplicationContent {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  formTitle?: string;
}

const defaultContent: ApplicationContent = {
  title: 'Make a Difference',
  subtitle: 'Shape your future with Venwind Refex',
  imageUrl: 'https://readdy.ai/api/search-image?query=Inspiring%20career%20growth%20concept%20with%20professional%20team%20members%20working%20together%20on%20innovative%20renewable%20energy%20projects%2C%20modern%20workspace%20with%20wind%20turbine%20models%20and%20sustainable%20technology%20displays%2C%20bright%20and%20motivational%20atmosphere%2C%20people%20collaborating%20with%20enthusiasm%2C%20clean%20professional%20photography%20with%20natural%20lighting%20and%20green%20accents%20representing%20environmental%20commitment&width=800&height=600&seq=careers-difference-bg&orientation=portrait',
  formTitle: 'Apply Now',
};

export default function ApplicationSection() {
  const [content, setContent] = useState<ApplicationContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const result = await getCMSData('careers', 'application', {
          defaultValue: defaultContent,
        });
        setContent({
          title: (result.data?.title && typeof result.data.title === 'string' && result.data.title.trim()) 
            ? result.data.title 
            : defaultContent.title,
          subtitle: (result.data?.subtitle && typeof result.data.subtitle === 'string' && result.data.subtitle.trim()) 
            ? result.data.subtitle 
            : defaultContent.subtitle,
          imageUrl: (result.data?.imageUrl && typeof result.data.imageUrl === 'string' && result.data.imageUrl.trim()) 
            ? result.data.imageUrl 
            : defaultContent.imageUrl,
          formTitle: (result.data?.formTitle && typeof result.data.formTitle === 'string' && result.data.formTitle.trim()) 
            ? result.data.formTitle 
            : defaultContent.formTitle,
        });
      } catch (error) {
        console.error('Error loading application content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'careers' && e.detail.section === 'application') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Make a Difference */}
          <div 
            className="relative bg-cover bg-center rounded-lg overflow-hidden h-full min-h-[600px] flex items-center justify-center group"
            style={{
              backgroundImage: `url(${content.imageUrl || defaultContent.imageUrl})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 transition-all duration-700 group-hover:from-black/50 group-hover:to-black/30"></div>
            <div className="relative z-10 text-center px-8">
              <h2 className="text-white text-4xl md:text-5xl font-bold mb-6" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {content.title || defaultContent.title}
              </h2>
              <p className="text-white text-lg md:text-xl" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                {content.subtitle || defaultContent.subtitle}
              </p>
            </div>
          </div>

          {/* Right Column – Kissflow careers form iframe (careers page only; contact form unchanged) */}
          <div className="bg-white">
            <h2 className="text-gray-900 text-3xl md:text-4xl font-bold mb-8">{content.formTitle || defaultContent.formTitle}</h2>
            <div className="relative min-h-[800px] rounded-lg overflow-hidden border border-gray-200">
              {!formLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gray-50 text-gray-600" aria-live="polite">
                  <div className="w-12 h-12 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading application form…</p>
                </div>
              )}
              <iframe
                src={KISSFLOW_CAREERS_FORM_URL}
                title="Careers application form"
                className="w-full border-0 block relative z-0"
                style={{ height: '800px', minHeight: '800px' }}
                onLoad={() => setFormLoaded(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
