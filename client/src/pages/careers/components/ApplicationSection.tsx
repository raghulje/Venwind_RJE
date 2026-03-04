import { useState, useEffect, FormEvent } from 'react';
import { getCMSData } from '../../../utils/cms';
import CaptchaComponent from './CaptchaComponent';

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [content, setContent] = useState<ApplicationContent>(defaultContent);
  const [loading, setLoading] = useState(true);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['.doc', '.docx', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Please upload a .doc, .pdf, or .docx file');
        e.target.value = '';
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 10 MB');
        e.target.value = '';
        return;
      }
      
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      alert('Please complete the captcha verification');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    if (!resumeFile) {
      alert('Please upload your resume. Resume is required.');
      return;
    }

    if (formData.message.length > 500) {
      alert('Message must be less than 500 characters');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/careers-application` : '/api/careers-application';

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('message', formData.message);
      submitData.append('recaptchaToken', 'verified'); // Custom captcha is already verified
      
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
        setResumeFile(null);
        setFileName('');
        setCaptchaVerified(false);
      } else {
        setSubmitStatus('error');
        const errorMessage = result.message || result.error || 'Unknown error occurred';
        console.error('Application submission error:', errorMessage, result.errors);
        alert(`Error: ${errorMessage}${result.errors ? '\n' + result.errors.map((e: any) => e.msg).join('\n') : ''}`);
      }
    } catch (error: any) {
      setSubmitStatus('error');
      const errorMessage = error.message || 'Network error. Please check your connection and try again.';
      console.error('Application submission error:', error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

          {/* Right Column - Application Form */}
          <div className="bg-white">
            <h2 className="text-gray-900 text-3xl md:text-4xl font-bold mb-8">{content.formTitle || defaultContent.formTitle}</h2>
            
            <form onSubmit={handleSubmit} id="careers-application">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    required
                    maxLength={400}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 text-sm"
                  />
                </div>
                <div className="relative">
                  <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    required
                    maxLength={400}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 text-sm"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    required
                    maxLength={400}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 text-sm"
                  />
                </div>
                <div className="relative">
                  <i className="ri-phone-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    required
                    maxLength={400}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 text-sm"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <div className="relative">
                  <i className="ri-message-3-line absolute left-4 top-4 text-gray-400 text-lg"></i>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Message"
                    required
                    maxLength={500}
                    rows={5}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-green-600 resize-none text-sm"
                  ></textarea>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.message.length}/500 characters
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="mb-6">
                <label className="inline-block bg-gray-900 text-white px-6 py-3 rounded cursor-pointer hover:bg-gray-800 transition-colors whitespace-nowrap">
                  <i className="ri-upload-2-line mr-2"></i>
                  Upload Resume <span className="text-red-500">*</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />
                </label>
                {fileName && (
                  <span className="ml-4 text-sm text-gray-600">{fileName}</span>
                )}
                {!fileName && (
                  <span className="ml-4 text-sm text-red-600">Resume is required</span>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  (Upload your resume in .doc, .pdf, or .docx format, less than 10 MB. <span className="text-red-500 font-semibold">Required</span>)
                </p>
              </div>

              {/* Captcha */}
              <div className="mb-6">
                <CaptchaComponent onVerify={setCaptchaVerified} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#8DC63F] hover:bg-[#7AB62F] text-white px-8 py-3 rounded font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <i className="ri-send-plane-fill mr-2"></i>
                {isSubmitting ? 'Submitting...' : 'Get In Touch'}
              </button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  Thank you for your application! We will review it and get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  There was an error submitting your application. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
