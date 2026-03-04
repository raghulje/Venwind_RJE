import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface MapContent {
  title?: string;
  description?: string;
  mapUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const defaultContent: MapContent = {
  title: 'Visit Our Office',
  description: '6th Floor, Refex Towers, Sterling Road Signal, 313, Valluvar Kottam High Road, Nungambakkam, Chennai – 600034, Tamil Nadu',
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6234567890123!2d80.24123!3d13.05678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzI0LjQiTiA4MMKwMTQnMjguNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin&q=Valluvar+Kottam+High+Road+Nungambakkam+Chennai',
  address: '6th Floor, Refex Towers\nNungambakkam, Chennai – 600034',
  phone: '+91 44 - 6990 8410',
  email: 'contact@venwindrefex.com',
};

export default function MapSection() {
  const [content, setContent] = useState<MapContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });

    const fetchContent = async () => {
      try {
        const result = await getCMSData('careers', 'map', {
          defaultValue: defaultContent,
        });
        setContent({
          title: (result.data?.title && typeof result.data.title === 'string' && result.data.title.trim()) 
            ? result.data.title 
            : defaultContent.title,
          description: (result.data?.description && typeof result.data.description === 'string' && result.data.description.trim()) 
            ? result.data.description 
            : defaultContent.description,
          mapUrl: (result.data?.mapUrl && typeof result.data.mapUrl === 'string' && result.data.mapUrl.trim()) 
            ? result.data.mapUrl 
            : defaultContent.mapUrl,
          address: (result.data?.address && typeof result.data.address === 'string' && result.data.address.trim()) 
            ? result.data.address 
            : defaultContent.address,
          phone: (result.data?.phone && typeof result.data.phone === 'string' && result.data.phone.trim()) 
            ? result.data.phone 
            : defaultContent.phone,
          email: (result.data?.email && typeof result.data.email === 'string' && result.data.email.trim()) 
            ? result.data.email 
            : defaultContent.email,
        });
      } catch (error) {
        console.error('Error loading map content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'careers' && e.detail.section === 'map') {
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{content.title || defaultContent.title}</h2>
          <p className="text-lg text-gray-600">
            {content.description || defaultContent.description}
          </p>
        </div>

        <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg" data-aos="fade-up" data-aos-delay="100">
          <iframe
            src={content.mapUrl || defaultContent.mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venwind Refex Office Location"
          ></iframe>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="text-center" data-aos="fade-up" data-aos-delay="200">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-map-pin-line text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {content.address || defaultContent.address}
            </p>
          </div>

          <div className="text-center" data-aos="fade-up" data-aos-delay="300">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-phone-line text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
            <a 
              href={`tel:${content.phone || defaultContent.phone}`}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              {content.phone || defaultContent.phone}
            </a>
          </div>

          <div className="text-center" data-aos="fade-up" data-aos-delay="400">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-mail-line text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <a 
              href={`mailto:${content.email || defaultContent.email}`}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              {content.email || defaultContent.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
