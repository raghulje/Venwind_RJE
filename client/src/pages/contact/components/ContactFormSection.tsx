import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useCooldownTimer } from '../../../hooks/enquiry/useCooldownTimer';
import { useEmailValidation } from '../../../hooks/enquiry/useEmailValidation';
import { usePhoneValidation } from '../../../hooks/enquiry/usePhoneValidation';
import { checkEnquiry, createEnquiry, HttpError } from '../../../hooks/enquiry/enquiryApi';

function SubmissionSuccessOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 4500);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#06121f]/90">
      <div className="relative w-full max-w-3xl rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-[#06121f] via-[#071a2c] to-[#06121f] shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="px-8 py-10 md:px-12 md:py-12">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20" />
              <div className="absolute -inset-3 rounded-full border border-emerald-400/30 animate-spin [animation-duration:6s]" />
              <div className="relative h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span className="text-white text-2xl font-bold leading-none">✓</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-2xl rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-6 py-5">
              <p className="text-white text-lg md:text-xl font-semibold">
                Your enquiry has been <span className="text-emerald-300">submitted successfully!</span>
              </p>
              <p className="mt-2 text-sm md:text-base text-slate-200/90 leading-relaxed">
                Thank you for reaching out to us.
                <br />
                Our <span className="text-emerald-200 font-semibold">Agentic AI</span> will call you shortly for further enquiry and details.
                During the call, you can provide more details and also ask any queries you may have.
              </p>
              <p className="mt-3 text-sm text-emerald-200 font-semibold">We&apos;re here to help!</p>
            </div>

            <div className="w-full max-w-xl">
              <p className="text-xs text-slate-200/70 mb-2">You will be redirected shortly...</p>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse" />
              </div>
            </div>

            <button
              type="button"
              onClick={onDone}
              className="mt-2 text-xs text-slate-200/70 hover:text-slate-200 underline underline-offset-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'email' | 'phone' | 'message', string>>>({});
  const [touched, setTouched] = useState<Partial<Record<'name' | 'email' | 'phone' | 'message', boolean>>>({});
  const { isCoolingDown, secondsLeft, startCooldown } = useCooldownTimer(10);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const emailValidation = useEmailValidation(formData.email, true);
  const phoneValidation = usePhoneValidation(formData.phone, true);
  const messageError =
    !formData.message.trim()
      ? 'Message is required'
      : formData.message.trim().length < 15
        ? 'Message must be at least 15 characters'
        : null;

  const validateAndSet = (field: keyof typeof touched) => {
    const next: Partial<Record<'name' | 'email' | 'phone' | 'message', string>> = {};
    if (field === 'name') {
      next.name = !formData.name.trim() ? 'Name is required' : formData.name.trim().length < 2 ? 'Name must be at least 2 characters' : undefined;
    }
    if (field === 'email') next.email = emailValidation.validate() || undefined;
    if (field === 'phone') next.phone = phoneValidation.validate() || undefined;
    if (field === 'message') next.message = messageError || undefined;
    setFieldErrors((prev) => ({ ...prev, ...next }));
  };

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
    const key = name as keyof typeof touched;
    if (key in touched) {
      setTouched((prev) => ({ ...prev, [key]: true }));
      if (touched[key]) validateAndSet(key);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCoolingDown) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setFieldErrors({});

    const nextErrors: typeof fieldErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters';
    const emailErr = emailValidation.validate();
    if (emailErr) nextErrors.email = emailErr;
    const phoneErr = phoneValidation.validate();
    if (phoneErr) nextErrors.phone = phoneErr;
    if (messageError) nextErrors.message = messageError;
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setTouched({ name: true, email: true, phone: true, message: true });
      setIsSubmitting(false);
      return;
    }

    try {
      // Duplicate check (non-blocking if endpoint not present)
      try {
        const dup = await checkEnquiry({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        });
        if (dup?.exists) {
          const field = dup.field || 'phone';
          const msg =
            field === 'email'
              ? 'This email is already registered'
              : field === 'phone'
                ? 'This phone number is already registered'
                : 'This name is already registered';
          setFieldErrors((prev) => ({ ...prev, [field]: msg } as any));
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        if (!(err instanceof HttpError && err.status === 404)) {
          throw err;
        }
      }

      // Preferred API
      try {
        await createEnquiry({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company,
          message: formData.message,
          source: 'venwind-contact',
        });
        setSubmitStatus('success');
        setShowSuccessOverlay(true);
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        startCooldown();
        return;
      } catch (err) {
        if (!(err instanceof HttpError && err.status === 404)) {
          throw err;
        }
      }

      // Fallback: existing endpoint to avoid breaking current behavior
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/contact-form` : '/api/contact-form';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setShowSuccessOverlay(true);
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        startCooldown();
      } else {
        setSubmitStatus('error');
        const errorMessage = result.message || result.error || 'Unknown error occurred';
        console.error('Form submission error:', errorMessage, result.errors);
        alert(
          `Error: ${errorMessage}${result.errors ? '\n' + result.errors.map((er: { msg: string }) => er.msg).join('\n') : ''}`
        );
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
      {showSuccessOverlay && (
        <SubmissionSuccessOverlay
          onDone={() => {
            setShowSuccessOverlay(false);
            setSubmitStatus('idle');
          }}
        />
      )}
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
                  <div className={`flex items-center border-b pb-2 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}>
                    <i className="ri-user-line text-gray-400 mr-3" aria-hidden />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, name: true }));
                        validateAndSet('name');
                      }}
                      placeholder="Name"
                      required
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                  {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>
                <div className="relative">
                  <div className={`flex items-center border-b pb-2 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}>
                    <i className="ri-mail-line text-gray-400 mr-3" aria-hidden />
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, email: true }));
                        validateAndSet('email');
                      }}
                      placeholder="Email Address"
                      required
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <div className={`flex items-center border-b pb-2 ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}>
                    <i className="ri-phone-line text-gray-400 mr-3" aria-hidden />
                    <div className="w-full">
                      <PhoneInput
                        country="in"
                        value={formData.phone.replace(/^\+/, '')}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: value ? `+${value}` : '',
                          }))
                        }
                        inputProps={{
                          name: 'phone',
                          required: true,
                          autoComplete: 'tel',
                          onBlur: () => {
                            setTouched((prev) => ({ ...prev, phone: true }));
                            validateAndSet('phone');
                          }
                        }}
                        containerClass="w-full"
                        inputClass="!w-full !bg-transparent !text-gray-900 !placeholder-gray-400 !text-sm !border-0 !shadow-none focus:!outline-none"
                        buttonClass="!bg-transparent !border-0"
                        dropdownClass="!text-sm"
                        placeholder="Phone"
                      />
                      {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                    </div>
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
                <div className={`flex items-start border-b pb-2 ${fieldErrors.message ? 'border-red-500' : 'border-gray-300'}`}>
                  <i className="ri-edit-line text-gray-400 mr-3 mt-1" aria-hidden />
                  <div className="w-full">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, message: true }));
                        validateAndSet('message');
                      }}
                      placeholder="Message"
                      required
                      rows={4}
                      maxLength={500}
                      className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm resize-none"
                    />
                    <div className="text-right text-xs text-gray-400">
                      {formData.message.length}/500
                    </div>
                    {fieldErrors.message && <p className="text-xs text-red-500 mt-1">{fieldErrors.message}</p>}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isCoolingDown}
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
