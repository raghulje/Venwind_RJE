import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

const KISSFLOW_FORM_URL = 'https://development-refexgroup.kissflow.com/public/Process/Pf1152c833-6b47-4361-a767-f66a99e07b30';
const KISSFLOW_ORIGIN = 'https://development-refexgroup.kissflow.com';

interface ContactInfoContent {
  title?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  email2?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

const defaultContactInfo: ContactInfoContent = {
  title: 'Have questions?\nGet in touch!',
  companyName: 'Venwind Refex Power Limited',
  address: 'CIN: U27101TN2024PLC175572\n2nd floor, Refex Towers, 313,\nValluvar Kottam High Road,\n Nungambakkam,Chennai-600034,\n Tamil Nadu, India',
  phone: '+91 44 - 6990 8410',
  email: 'cscompliance@refex.co.in',
  email2: 'contact@venwindrefex.com',
  facebookUrl: 'https://www.facebook.com/refexindustrieslimited/',
  twitterUrl: 'https://x.com/GroupRefex',
  linkedinUrl: 'https://in.linkedin.com/company/venwind-refex-power-limited',
  instagramUrl: 'https://www.instagram.com/refexgroup/',
  youtubeUrl: 'https://www.youtube.com/@refexgroup',
};

export default function ContactFormSection() {
  const [contactInfo, setContactInfo] = useState<ContactInfoContent>(defaultContactInfo);
  const [loading, setLoading] = useState(true);
  const [formLoaded, setFormLoaded] = useState(false);

  // Preconnect to Kissflow so the iframe request starts with connection already open
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = KISSFLOW_ORIGIN;
    document.head.appendChild(link);
    return () => { if (link.parentNode) document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('contact', 'contact-info', {
          defaultValue: defaultContactInfo,
        });
        setContactInfo({
          title: (result.data?.title && typeof result.data.title === 'string' && result.data.title.trim()) 
            ? result.data.title 
            : defaultContactInfo.title,
          companyName: (result.data?.companyName && typeof result.data.companyName === 'string' && result.data.companyName.trim()) 
            ? result.data.companyName 
            : defaultContactInfo.companyName,
          address: (result.data?.address && typeof result.data.address === 'string' && result.data.address.trim()) 
            ? result.data.address 
            : defaultContactInfo.address,
          phone: (result.data?.phone && typeof result.data.phone === 'string' && result.data.phone.trim()) 
            ? result.data.phone 
            : defaultContactInfo.phone,
          email: (result.data?.email && typeof result.data.email === 'string' && result.data.email.trim()) 
            ? result.data.email 
            : defaultContactInfo.email,
          email2: (result.data?.email2 && typeof result.data.email2 === 'string' && result.data.email2.trim()) 
            ? result.data.email2 
            : defaultContactInfo.email2,
          facebookUrl: (result.data?.facebookUrl && typeof result.data.facebookUrl === 'string' && result.data.facebookUrl.trim()) 
            ? result.data.facebookUrl 
            : defaultContactInfo.facebookUrl,
          twitterUrl: (result.data?.twitterUrl && typeof result.data.twitterUrl === 'string' && result.data.twitterUrl.trim()) 
            ? result.data.twitterUrl 
            : defaultContactInfo.twitterUrl,
          linkedinUrl: (result.data?.linkedinUrl && typeof result.data.linkedinUrl === 'string' && result.data.linkedinUrl.trim()) 
            ? result.data.linkedinUrl 
            : defaultContactInfo.linkedinUrl,
          instagramUrl: (result.data?.instagramUrl && typeof result.data.instagramUrl === 'string' && result.data.instagramUrl.trim()) 
            ? result.data.instagramUrl 
            : defaultContactInfo.instagramUrl,
          youtubeUrl: (result.data?.youtubeUrl && typeof result.data.youtubeUrl === 'string' && result.data.youtubeUrl.trim()) 
            ? result.data.youtubeUrl 
            : defaultContactInfo.youtubeUrl,
        });
      } catch (error) {
        console.error('Error loading contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'contact' && e.detail.section === 'contact-info') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, []);

  return (
    <>
      {/* Contact info section - contained */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div data-aos="fade-right">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight whitespace-pre-line">
              {contactInfo.title || defaultContactInfo.title}
            </h2>

            <div className="flex items-start mb-6">
              <div className="w-6 h-6 flex items-center justify-center mr-4 mt-1">
                <i className="ri-map-pin-line text-gray-500 text-xl" aria-hidden />
              </div>
              <div>
                <p className="text-gray-900 font-bold mb-1">{contactInfo.companyName || defaultContactInfo.companyName}</p>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {contactInfo.address || defaultContactInfo.address}
                </p>
              </div>
            </div>

            <div className="flex items-start mb-6">
              <div className="w-6 h-6 flex items-center justify-center mr-4 mt-1">
                <i className="ri-smartphone-line text-gray-500 text-xl" aria-hidden />
              </div>
              <div className="flex flex-col gap-1">
                <a href="tel:+914435040050" className="text-gray-600 text-sm hover:text-[#8DC63F] transition-colors">
                  +91 44 - 3504 0050
                </a>
                <a href="tel:+914469908410" className="text-gray-600 text-sm hover:text-[#8DC63F] transition-colors">
                  +91 44 - 6990 8410
                </a>
              </div>
            </div>

            <div className="flex items-start mb-8">
              <div className="w-6 h-6 flex items-center justify-center mr-4 mt-1">
                <i className="ri-mail-line text-gray-500 text-xl" aria-hidden />
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href={`mailto:${contactInfo.email || defaultContactInfo.email}`}
                  className="text-gray-600 text-sm hover:text-[#8DC63F] transition-colors"
                >
                  {contactInfo.email || defaultContactInfo.email}
                </a>
                {(contactInfo.email2 || defaultContactInfo.email2) && (
                  <a
                    href={`mailto:${contactInfo.email2 || defaultContactInfo.email2}`}
                    className="text-gray-600 text-sm hover:text-[#8DC63F] transition-colors"
                  >
                    {contactInfo.email2 || defaultContactInfo.email2}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {contactInfo.facebookUrl && (
                <a
                  href={contactInfo.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer"
                  aria-label="Facebook"
                >
                  <i className="ri-facebook-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.twitterUrl && (
                <a
                  href={contactInfo.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer"
                  aria-label="X (Twitter)"
                >
                  <i className="ri-twitter-x-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.linkedinUrl && (
                <a
                  href={contactInfo.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer"
                  aria-label="LinkedIn"
                >
                  <i className="ri-linkedin-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.instagramUrl && (
                <a
                  href={contactInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer"
                  aria-label="Instagram"
                >
                  <i className="ri-instagram-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.youtubeUrl && (
                <a
                  href={contactInfo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer"
                  aria-label="YouTube"
                >
                  <i className="ri-youtube-fill text-xl" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact form section - full width. Iframe starts loading as soon as the page is open. */}
      <section className="w-full bg-gray-50 relative min-h-[1000px]">
        {!formLoaded && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gray-100 text-gray-600"
            aria-live="polite"
          >
            <div className="w-12 h-12 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading contact form…</p>
          </div>
        )}
        <iframe
          src={KISSFLOW_FORM_URL}
          title="Contact form"
          className="w-full border-0 block relative z-0"
          style={{ height: '1000px', minHeight: '1000px' }}
          onLoad={() => setFormLoaded(true)}
        >
          Loading...
        </iframe>
      </section>
    </>
  );
}
