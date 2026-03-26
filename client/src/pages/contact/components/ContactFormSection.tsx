import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';
import CaptchaComponent from './CaptchaComponent';

// --- Kissflow iframe (commented out; uncomment to use in future) ---
// const KISSFLOW_FORM_URL = 'https://development-refexgroup.kissflow.com/public/Process/Pf1152c833-6b47-4361-a767-f66a99e07b30';
// const KISSFLOW_ORIGIN = 'https://development-refexgroup.kissflow.com';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function ContactFormSection() {
  const [contactInfo, setContactInfo] = useState<ContactInfoContent>(defaultContactInfo);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [captchaVerified, setCaptchaVerified] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 500) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      alert('Please complete the captcha verification');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/contact-form` : '/api/contact-form';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          message: formData.message,
          recaptchaToken: 'verified',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        setCaptchaVerified(false);
      } else {
        setSubmitStatus('error');
        const errorMessage = result.message || result.error || 'Unknown error occurred';
        console.error('Form submission error:', errorMessage, result.errors);
        alert(`Error: ${errorMessage}${result.errors ? '\n' + result.errors.map((err: { msg: string }) => err.msg).join('\n') : ''}`);
      }
    } catch (error: unknown) {
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      console.error('Form submission error:', error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Contact Info */}
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
                <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer" aria-label="Facebook">
                  <i className="ri-facebook-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.twitterUrl && (
                <a href={contactInfo.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer" aria-label="X (Twitter)">
                  <i className="ri-twitter-x-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.linkedinUrl && (
                <a href={contactInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer" aria-label="LinkedIn">
                  <i className="ri-linkedin-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.instagramUrl && (
                <a href={contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer" aria-label="Instagram">
                  <i className="ri-instagram-fill text-xl" aria-hidden />
                </a>
              )}
              {contactInfo.youtubeUrl && (
                <a href={contactInfo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-[#8DC63F] hover:text-[#7AB62F] transition-colors cursor-pointer" aria-label="YouTube">
                  <i className="ri-youtube-fill text-xl" aria-hidden />
                </a>
              )}
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div data-aos="fade-left">
            <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="flex items-center border-b border-gray-300 pb-2">
                    <i className="ri-user-line text-gray-400 mr-3" aria-hidden />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Name"
                      required
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center border-b border-gray-300 pb-2">
                    <i className="ri-mail-line text-gray-400 mr-3" aria-hidden />
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      required
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="flex items-center border-b border-gray-300 pb-2">
                    <i className="ri-phone-line text-gray-400 mr-3" aria-hidden />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone"
                      required
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center border-b border-gray-300 pb-2">
                    <i className="ri-building-line text-gray-400 mr-3" aria-hidden />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Company"
                      required
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-start border-b border-gray-300 pb-2">
                  <i className="ri-edit-line text-gray-400 mr-3 mt-1" aria-hidden />
                  <div className="w-full">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Message"
                      required
                      rows={4}
                      maxLength={500}
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm resize-none"
                    />
                    <div className="text-right text-xs text-gray-400">
                      {formData.message.length}/500
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <CaptchaComponent onVerify={setCaptchaVerified} />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#8DC63F] hover:bg-[#7AB62F] text-white px-8 py-3 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center"
                >
                  <i className="ri-send-plane-fill mr-2" aria-hidden />
                  {isSubmitting ? 'Sending...' : 'Get In Touch'}
                </button>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-[#8DC63F]/10 border border-[#8DC63F]/30 text-gray-800 px-4 py-3 rounded-md text-sm">
                  Thank you for your message! We will get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  Something went wrong. Please try again later.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* --- Kissflow iframe: uncomment below to use in future --- */}
      {/* <section className="w-full bg-gray-50 relative min-h-[1000px]">
        {!formLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gray-100 text-gray-600" aria-live="polite">
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
      </section> */}
    </section>
  );
}
