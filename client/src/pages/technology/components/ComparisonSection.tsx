import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getCMSData } from '../../../utils/cms';

interface ComparisonRow {
  aspect: string;
  vensys: string;
  dfig: string;
}

interface ComparisonContent {
  title?: string;
  rows?: ComparisonRow[];
}

const defaultRows: ComparisonRow[] = [
  { aspect: 'Design concept', vensys: 'Optimized design strategy to get advantage of permanent magnet generator at medium speed', dfig: 'High speed generator and moving parts' },
  { aspect: 'Reliability', vensys: 'Higher reliability due to medium speed', dfig: 'More prone to mechanical failures due to high speed' },
  { aspect: 'Maintenance', vensys: 'Lower maintenance costs', dfig: 'Higher maintenance costs and regular up keep for high-speed gearbox and other components' },
  { aspect: 'Efficiency', vensys: 'Higher efficiency due to lower losses', dfig: 'Energy losses due to high temperature operations' },
  { aspect: 'Noise Level', vensys: 'Quieter operations', dfig: 'Noisier due to high speed operation' },
  { aspect: 'Grid Friendly', vensys: 'Active & Reactive power control and LVRT & HVRT', dfig: 'Challenges of maintaining power factor and LVRT & HVRT' },
  { aspect: 'Cost', vensys: 'Lower LCOE during project lifetime', dfig: 'Higher LCOE due to higher operational expenses and lower turbine efficiency' },
];

export default function ComparisonSection() {
  const [content, setContent] = useState<ComparisonContent>({
    title: 'Technology Comparison',
    rows: defaultRows,
  });
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const result = await getCMSData('technology', 'comparison', {
          defaultValue: { title: 'Technology Comparison', rows: defaultRows },
        });
        setContent({
          title: result.data.title || 'Technology Comparison',
          rows: (result.data.rows && result.data.rows.length > 0) ? result.data.rows : defaultRows,
        });
      } catch (error) {
        console.error('Error loading comparison content:', error);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'technology' && e.detail.section === 'comparison') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, []);

  const rows = content.rows || defaultRows;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <h2 className="text-gray-900 text-4xl lg:text-5xl font-bold text-center mb-16" data-aos="fade-up">
          {content.title || 'Technology Comparison'}
        </h2>
        
        <div className="overflow-x-auto" data-aos="fade-up" data-aos-delay="100">
          <table className="w-full bg-white shadow-sm">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-4 text-left font-bold">Aspect</th>
                <th className="px-6 py-4 text-left font-bold">Vensys GWH182-5.3 PMG Hybrid technology</th>
                <th className="px-6 py-4 text-left font-bold">Gearbox wind turbines DFIG</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {rows.map((row, index) => (
                <tr key={index} className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 font-semibold">{row.aspect}</td>
                  <td className="px-6 py-4">{row.vensys}</td>
                  <td className="px-6 py-4">{row.dfig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
