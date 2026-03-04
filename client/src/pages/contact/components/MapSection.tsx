import { useState, useEffect } from 'react';
import { getCMSData } from '../../../utils/cms';

interface MapContent {
  mapUrl?: string;
}

const defaultMapUrl = 'https://maps.google.com/maps?t=m&output=embed&iwloc=near&z=17&q=Sixth+Floor%2C+Refex+Towers%2C+Sterling+Road+Signal%2C++313%2C+Valluvar+Kottam+High+Road%2C++Nungambakkam%2C+Chennai+%E2%80%93+600034%2C+Tamil+Nadu';

export default function MapSection() {
  const [mapUrl, setMapUrl] = useState<string>(defaultMapUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const result = await getCMSData('contact', 'map', {
          defaultValue: { mapUrl: defaultMapUrl },
        });
        setMapUrl(
          (result.data?.mapUrl && typeof result.data.mapUrl === 'string' && result.data.mapUrl.trim()) 
            ? result.data.mapUrl 
            : defaultMapUrl
        );
      } catch (error) {
        console.error('Error loading map content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'contact' && e.detail.section === 'map') {
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
      <section className="w-full">
        <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <iframe
        src={mapUrl}
        className="w-full h-[400px]"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Venwind Refex Office Location"
      />
    </section>
  );
}
