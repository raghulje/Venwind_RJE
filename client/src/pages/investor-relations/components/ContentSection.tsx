import { useState, useEffect } from 'react';
import { getCMSData } from '../../../utils/cms';

interface ContentSectionProps {
  activeSection: string;
  activeSubsection: string;
}

export default function ContentSection({ activeSection, activeSubsection }: ContentSectionProps) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const sectionKey = `${activeSection}_${activeSubsection}`;
        const result = await getCMSData('investor-relations', sectionKey, {
          defaultValue: {
            title: '',
            content: '',
            documents: [],
          },
        });
        console.log('Fetched content for', sectionKey, ':', result.data);
        setContent(result.data);
      } catch (error) {
        console.error('Error loading content:', error);
        setContent({
          title: '',
          content: '',
          documents: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'investor-relations') {
        fetchContent();
      }
    };
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, [activeSection, activeSubsection]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const sectionTitles: Record<string, string> = {
    'annual-return': 'Annual Return',
    'notice-general-meetings': 'Notice of the General meetings',
  };

  const subsectionTitles: Record<string, string> = {
    'fy-2024-25': 'FY 2024-25',
    'fy-2025-26': 'FY 2025-26',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {sectionTitles[activeSection] || 'Investor Relations'}
      </h2>
      <h3 className="text-2xl font-semibold text-gray-700 mb-6">
        {subsectionTitles[activeSubsection] || ''}
      </h3>

      {content?.title && (
        <h4 className="text-xl font-semibold text-gray-800 mb-4">{content.title}</h4>
      )}

      {content?.content && (
        <div className="prose max-w-none mb-6">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {content.content}
          </div>
        </div>
      )}

      {content?.documents && Array.isArray(content.documents) && content.documents.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Documents</h4>
          <div className="space-y-3">
            {content.documents.map((doc: any, index: number) => {
              if (!doc || !doc.url) return null;
              
              const fileExtension = doc.url?.split('.').pop()?.toLowerCase() || '';
              const getFileIcon = () => {
                if (fileExtension === 'pdf') return 'ri-file-pdf-line text-red-600';
                if (['doc', 'docx'].includes(fileExtension)) return 'ri-file-word-line text-blue-600';
                if (['xls', 'xlsx'].includes(fileExtension)) return 'ri-file-excel-line text-green-600';
                return 'ri-file-line text-gray-600';
              };

              return (
                <a
                  key={index}
                  href={doc.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200 hover:border-[#8DC63F]"
                >
                  <i className={`${getFileIcon()} text-2xl`}></i>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doc.name || 'Document'}</p>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[#8DC63F]">
                    <i className="ri-download-line text-xl"></i>
                    <span className="text-sm font-medium">Download</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {(!content?.content && (!content?.documents || !Array.isArray(content.documents) || content.documents.length === 0)) && (
        <div className="text-center py-12 text-gray-500">
          <p>No content available for this section yet.</p>
        </div>
      )}
    </div>
  );
}

