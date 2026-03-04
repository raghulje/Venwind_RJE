import { useState, useEffect } from 'react';
import * as React from 'react';
import AdminLayout, { API_BASE_URL, deleteUploadedFile } from '../components/AdminLayout';
import { useCMSData } from '../hooks/useCMSData';

export default function AdminInvestorRelationsPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const [activeSubsection, setActiveSubsection] = useState('fy-2024-25');
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    documents: Array<{ name: string; url: string; description: string }>;
  }>({
    title: '',
    content: '',
    documents: [],
  });
  const { getFieldValue, loading, refreshData } = useCMSData('investor-relations');

  useEffect(() => {
    if (!loading) {
      const heroData = getFieldValue('hero');
      if (heroData?.bgImageUrl) {
        setHeroImageUrl(heroData.bgImageUrl);
      }
    }
  }, [loading, getFieldValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Use relative path if API_BASE_URL is empty (works with Vite proxy)
      const uploadUrl = API_BASE_URL ? `${API_BASE_URL}/api/upload/image` : '/api/upload/image';
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.imageUrl) {
          // Construct full URL - if API_BASE_URL is empty, use relative path
          const fullUrl = API_BASE_URL 
            ? `${API_BASE_URL}${result.imageUrl}` 
            : result.imageUrl;
          
          const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
          if (input) {
            input.value = fullUrl;
            // Update state for immediate preview
            if (fieldName === 'bgImageUrl') {
              setHeroImageUrl(fullUrl);
            }
            // Trigger change event
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          alert('Image uploaded successfully! Click "Save Changes" to save.');
        } else {
          alert('Failed to upload image: ' + (result.error || 'Unknown error'));
        }
      } else {
        const errorText = await response.text();
        alert('Failed to upload image. Please try again.');
        console.error('Upload error:', errorText);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      e.target.value = '';
    }
  };

  const handleImageDelete = async (fieldName: string) => {
    const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    if (!input || !input.value) return;

    const imageUrl = input.value;
    
    // Check if it's an uploaded file (starts with /uploads/)
    if (imageUrl.includes('/uploads/')) {
      if (confirm('Are you sure you want to delete this image? This will remove the file from the server.')) {
        const success = await deleteUploadedFile(imageUrl);
        if (success) {
          input.value = '';
          if (fieldName === 'bgImageUrl') {
            setHeroImageUrl('');
          }
          alert('Image deleted successfully!');
        } else {
          alert('Failed to delete image. It may have already been deleted.');
        }
      }
    } else {
      // For external URLs, just clear the field
      if (confirm('Remove this image URL?')) {
        input.value = '';
        if (fieldName === 'bgImageUrl') {
          setHeroImageUrl('');
        }
      }
    }
  };

  const handleHeroSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const dataObj: any = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        dataObj[key] = value.trim();
      }
    });
    
    try {
      const { saveCMSData } = await import('../../../utils/cms');
      await saveCMSData('investor-relations', 'hero', dataObj);
      window.dispatchEvent(
        new CustomEvent('cmsUpdate', {
          detail: { 
            page: 'investor-relations', 
            section: 'hero'
          },
        })
      );
      setTimeout(() => {
        refreshData();
      }, 500);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes.');
    }
  };

  const sections = [
    {
      id: 'annual-return',
      title: 'Annual Return',
      subsections: [
        { id: 'fy-2024-25', title: 'FY 2024-25' },
        { id: 'fy-2025-26', title: 'FY 2025-26' },
      ],
    },
    {
      id: 'notice-general-meetings',
      title: 'Notice of the General meetings',
      subsections: [
        { id: 'fy-2024-25', title: 'FY 2024-25' },
        { id: 'fy-2025-26', title: 'FY 2025-26' },
      ],
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (allow PDF, DOC, DOCX, XLS, XLSX, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
      alert('Please upload a valid document file (PDF, DOC, DOCX, XLS, XLSX)');
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size is too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }

    const uploadKey = `doc_${docIndex}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file); // Use 'file' field name to match backend endpoint
      
      const response = await fetch(`${API_BASE_URL}/api/upload/file`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.fileUrl) {
          const fullUrl = `${API_BASE_URL}${result.fileUrl}`;
          // Update form state directly
          setFormData(prev => {
            const newDocuments = [...prev.documents];
            if (!newDocuments[docIndex - 1]) {
              newDocuments[docIndex - 1] = { name: '', url: '', description: '' };
            }
            newDocuments[docIndex - 1] = {
              ...newDocuments[docIndex - 1],
              url: fullUrl,
              name: newDocuments[docIndex - 1].name || file.name.replace(/\.[^/.]+$/, ''), // Auto-fill name if empty
            };
            return { ...prev, documents: newDocuments };
          });
          alert('File uploaded successfully! Click "Save Changes" to save the document.');
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } else {
        const errorText = await response.text();
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error.message || 'Please try again'}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
      e.target.value = '';
    }
  };

  const handleFileDelete = async (docIndex: number) => {
    const doc = formData.documents[docIndex - 1];
    if (!doc || !doc.url) return;

    console.log('Deleting file:', doc.url);
    
    if (confirm('Are you sure you want to delete this file? This will remove the file from the server.')) {
      const success = await deleteUploadedFile(doc.url);
      if (success) {
        // Remove the document from the array
        const newDocuments = [...formData.documents];
        newDocuments[docIndex - 1] = { name: '', url: '', description: '' };
        setFormData(prev => ({ ...prev, documents: newDocuments }));
        alert('File deleted successfully!');
      } else {
        // Don't show alert here, deleteUploadedFile already shows error messages
      }
    }
  };

  const handleClearAllDocuments = async () => {
    const documentsWithFiles = formData.documents.filter(doc => doc.url);
    
    if (documentsWithFiles.length === 0) {
      alert('No documents to clear.');
      return;
    }

    if (confirm(`Are you sure you want to remove all ${documentsWithFiles.length} document(s)? This will clear all document entries from this section.`)) {
      // Optionally delete files from server
      const deleteFiles = confirm('Do you also want to delete the actual files from the server? (Click Cancel to only remove from CMS)');
      
      if (deleteFiles) {
        let deletedCount = 0;
        let failedCount = 0;
        
        for (const doc of documentsWithFiles) {
          if (doc.url) {
            const success = await deleteUploadedFile(doc.url);
            if (success) {
              deletedCount++;
            } else {
              failedCount++;
            }
          }
        }
        
        if (deletedCount > 0) {
          alert(`${deletedCount} file(s) deleted from server${failedCount > 0 ? `, ${failedCount} failed` : ''}.`);
        }
      }
      
      // Clear all documents from form
      setFormData(prev => ({
        ...prev,
        documents: [
          { name: '', url: '', description: '' },
          { name: '', url: '', description: '' },
          { name: '', url: '', description: '' },
          { name: '', url: '', description: '' },
          { name: '', url: '', description: '' },
        ]
      }));
      
      alert('All documents cleared. Click "Save Changes" to save the changes.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sectionKey = `${activeSection}_${activeSubsection}`;
    
    // Use state data directly instead of FormData
    const dataObj: any = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      documents: formData.documents
        .filter(doc => doc.name && doc.url) // Only include documents with both name and URL
        .map(doc => ({
          name: doc.name.trim(),
          url: doc.url.trim(),
          description: doc.description.trim(),
        })),
    };

    try {
      const { saveCMSData } = await import('../../../utils/cms');
      await saveCMSData('investor-relations', sectionKey, dataObj);
      
      // Dispatch custom event to update frontend immediately
      window.dispatchEvent(
        new CustomEvent('cmsUpdate', {
          detail: { 
            page: 'investor-relations', 
            section: sectionKey
          },
        })
      );
      
      // Don't refresh immediately - the form data is already correct
      // Only refresh in background to sync with server
      setTimeout(() => {
        refreshData();
      }, 500);
      
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes.');
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const currentSubsection = currentSection?.subsections.find(s => s.id === activeSubsection);
  const sectionKey = activeSection !== 'hero' ? `${activeSection}_${activeSubsection}` : '';
  const sectionData = sectionKey ? getFieldValue(sectionKey) : null;
  const currentContent = sectionData ? {
    title: sectionData.title || '',
    content: sectionData.content || '',
    documents: sectionData.documents || [],
  } : null;

  // Update form data ONLY when section/subsection changes, not during refresh
  useEffect(() => {
    if (!loading && activeSection !== 'hero') {
      const sectionKey = `${activeSection}_${activeSubsection}`;
      const sectionData = getFieldValue(sectionKey);
      if (sectionData) {
        setFormData({
          title: sectionData.title || '',
          content: sectionData.content || '',
          documents: Array.isArray(sectionData.documents) && sectionData.documents.length > 0 
            ? [...sectionData.documents, ...Array(Math.max(0, 5 - sectionData.documents.length)).fill({ name: '', url: '', description: '' })].slice(0, 5)
            : [
                { name: '', url: '', description: '' },
                { name: '', url: '', description: '' },
                { name: '', url: '', description: '' },
                { name: '', url: '', description: '' },
                { name: '', url: '', description: '' },
              ],
        });
      } else {
        // Only clear if switching to a new empty section
        setFormData({
          title: '',
          content: '',
          documents: [
            { name: '', url: '', description: '' },
            { name: '', url: '', description: '' },
            { name: '', url: '', description: '' },
            { name: '', url: '', description: '' },
            { name: '', url: '', description: '' },
          ],
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, activeSubsection]); // Only update when section changes, ignore loading/refresh

  if (loading) {
    return (
      <AdminLayout pageName="Investor Relations" pagePath="/investor-relations">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageName="Investor Relations" pagePath="/investor-relations">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Investor Relations CMS</h1>
          
          {/* Section Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Manage</label>
            <select
              value={activeSection}
              onChange={(e) => {
                setActiveSection(e.target.value);
                if (e.target.value !== 'hero') {
                  const section = sections.find(s => s.id === e.target.value);
                  if (section && section.subsections.length > 0) {
                    setActiveSubsection(section.subsections[0].id);
                  }
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
            >
              <option value="hero">Hero Section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>

          {/* Hero Section */}
          {activeSection === 'hero' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hero Section</h2>
              <form onSubmit={handleHeroSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input type="text" name="title" defaultValue={getFieldValue('hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Investor Relations" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                    <div className="mt-2 mb-2">
                      <label className="block text-xs text-gray-600 mb-1">Upload Image:</label>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bgImageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-600 mb-1">Or enter Image URL:</label>
                      <div className="flex gap-2">
                        <input type="text" name="bgImageUrl" defaultValue={getFieldValue('hero', 'bgImageUrl')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/hero-bg.jpg" />
                        {(heroImageUrl || getFieldValue('hero', 'bgImageUrl')) && (
                          <button
                            type="button"
                            onClick={() => handleImageDelete('bgImageUrl')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                            title="Delete image"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    {(heroImageUrl || getFieldValue('hero', 'bgImageUrl')) && (
                      <div className="mt-2">
                        <img src={heroImageUrl || getFieldValue('hero', 'bgImageUrl')} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                    <i className="ri-save-line mr-2"></i>Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section and Subsection Selector */}
          {activeSection !== 'hero' && (
            <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={activeSection}
                onChange={(e) => {
                  setActiveSection(e.target.value);
                  const section = sections.find(s => s.id === e.target.value);
                  if (section && section.subsections.length > 0) {
                    setActiveSubsection(section.subsections[0].id);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subsection</label>
              <select
                value={activeSubsection}
                onChange={(e) => setActiveSubsection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
              >
                {currentSection?.subsections.map((subsection) => (
                  <option key={subsection.id} value={subsection.id}>
                    {subsection.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}

          {/* Content Form */}
          {activeSection !== 'hero' && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  name="content"
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                  placeholder="Enter content here..."
                />
              </div>

              {/* Documents Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Documents</label>
                  {formData.documents.some(doc => doc.url) && (
                    <button
                      type="button"
                      onClick={handleClearAllDocuments}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                      title="Clear all documents"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>Clear All Documents
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const doc = formData.documents[num - 1] || { name: '', url: '', description: '' };
                    return (
                      <div key={num} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Document {num}</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Document Name</label>
                            <input
                              type="text"
                              name={`doc_${num}_name`}
                              value={doc.name}
                              onChange={(e) => {
                                const newDocuments = [...formData.documents];
                                if (!newDocuments[num - 1]) {
                                  newDocuments[num - 1] = { name: '', url: '', description: '' };
                                }
                                newDocuments[num - 1] = { ...newDocuments[num - 1], name: e.target.value };
                                setFormData(prev => ({ ...prev, documents: newDocuments }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm"
                              placeholder="e.g., Annual Report 2024-25"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Upload Document</label>
                            <div>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={(e) => handleFileUpload(e, num)}
                                disabled={uploadingFiles[`doc_${num}`]}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              {uploadingFiles[`doc_${num}`] && (
                                <div className="mt-2 text-sm text-blue-600 flex items-center">
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Uploading file...
                                </div>
                              )}
                            </div>
                            {doc.url && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <i className="ri-file-check-line text-green-600 text-lg"></i>
                                    <div>
                                      <p className="text-xs font-medium text-green-900">
                                        File uploaded successfully
                                      </p>
                                      <p className="text-xs text-green-700">
                                        {doc.url.split('/').pop()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs whitespace-nowrap"
                                    >
                                      <i className="ri-external-link-line mr-1"></i>View
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleFileDelete(num)}
                                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs whitespace-nowrap"
                                      title="Delete file"
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description (Optional)</label>
                            <input
                              type="text"
                              name={`doc_${num}_description`}
                              value={doc.description}
                              onChange={(e) => {
                                const newDocuments = [...formData.documents];
                                if (!newDocuments[num - 1]) {
                                  newDocuments[num - 1] = { name: '', url: '', description: '' };
                                }
                                newDocuments[num - 1] = { ...newDocuments[num - 1], description: e.target.value };
                                setFormData(prev => ({ ...prev, documents: newDocuments }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm"
                              placeholder="Brief description"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors"
              >
                <i className="ri-save-line mr-2"></i>Save Changes
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}


