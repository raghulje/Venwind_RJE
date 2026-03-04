import { useState, useEffect } from 'react';
import AdminLayout, { API_BASE_URL } from '../components/AdminLayout';
import { useCMSData } from '../hooks/useCMSData';
import { normalizeImageUrl } from '../../../utils/cms';

export default function AdminTechnologyPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const { getFieldValue, loading, refreshData } = useCMSData('technology');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [uploadingIcons, setUploadingIcons] = useState<Record<string, boolean>>({});
  const [iconUrls, setIconUrls] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0); // Key to force form re-render
  
  useEffect(() => {
    if (!loading) {
      const sections = ['technical-advantages', 'advantages', 'benefits'];
      const urls: Record<string, string> = {};
      sections.forEach(section => {
        const url = getFieldValue(section, 'imageUrl') || '';
        if (url) urls[`${section}_imageUrl`] = url;
      });
      setImageUrls(urls);
      
      // Initialize icon URLs from innovation section
      const innovationItems = getFieldValue('innovation', 'items') || [];
      const iconUrlMap: Record<string, string> = {};
      innovationItems.forEach((item: any, index: number) => {
        if (item && item.icon) {
          iconUrlMap[`innovation_${index + 1}_icon`] = item.icon;
        }
      });
      setIconUrls(iconUrlMap);
    }
  }, [loading, getFieldValue, activeSection]);

  // Listen for CMS updates to refresh admin page data
  useEffect(() => {
    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === 'technology') {
        // Refresh the CMS data in the admin page
        if (refreshData) {
          refreshData();
        }
        // Also update image URLs and icon URLs if needed
        setTimeout(() => {
          const sections = ['technical-advantages', 'advantages', 'benefits'];
          const urls: Record<string, string> = {};
          sections.forEach(section => {
            const url = getFieldValue(section, 'imageUrl') || '';
            if (url) urls[`${section}_imageUrl`] = url;
          });
          setImageUrls(urls);
          
          // Refresh icon URLs for innovation section
          if (e.detail.section === 'innovation' || !e.detail.section) {
            const innovationItems = getFieldValue('innovation', 'items') || [];
            const iconUrlMap: Record<string, string> = {};
            innovationItems.forEach((item: any, index: number) => {
              if (item && item.icon) {
                iconUrlMap[`innovation_${index + 1}_icon`] = item.icon;
              }
            });
            setIconUrls(iconUrlMap);
          }
        }, 500);
      }
    };
    
    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    return () => {
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, [getFieldValue, refreshData]);
  
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, section: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = `${section}_${fieldName}`;
    setUploading(prev => ({ ...prev, [uploadKey]: true }));

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
          
          // Try to find input by ID first, then by name
          const inputById = document.querySelector(`#${section}-${fieldName}`) as HTMLInputElement;
          const input = inputById || document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
          
          if (input) {
            input.value = fullUrl;
            // Update state for preview
            setImageUrls(prev => ({ ...prev, [uploadKey]: fullUrl }));
            // Trigger change event
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            alert('Image uploaded successfully! Click "Save Changes" to save.');
          } else {
            alert('Image uploaded but could not update the form field. Please refresh the page.');
          }
        } else {
          alert('Failed to upload image: ' + (result.error || 'Unknown error'));
        }
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        let errorMessage = `Failed to upload image: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          // Use default error message
        }
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message || 'Network error. Please check your connection and try again.'}`);
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
      e.target.value = '';
    }
  };

  const handleRemoveImage = (fieldName: string, section: string) => {
    // Try to find input by ID first, then by name
    const inputById = document.querySelector(`#${section}-${fieldName}`) as HTMLInputElement;
    const input = inputById || document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    if (input) {
      input.value = '';
      // Update state to remove preview
      setImageUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[`${section}_${fieldName}`];
        return newUrls;
      });
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const uploadKey = fieldName;
    setUploadingIcons(prev => ({ ...prev, [uploadKey]: true }));
    
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
          
          // Update state for immediate preview - this will replace existing icon
          setIconUrls(prev => ({ ...prev, [uploadKey]: fullUrl }));
          
          // Update the input field by finding it and updating its value
          setTimeout(() => {
            const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
            if (input) {
              input.value = fullUrl;
              // Force input update by triggering events
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, 100);
          
          // Force form re-render to show updated icon
          setFormKey(prev => prev + 1);
          
          alert('Icon uploaded successfully! Click "Save Changes" to save.');
        } else {
          alert('Failed to upload icon: ' + (result.error || 'Unknown error'));
        }
      } else {
        const errorText = await response.text();
        alert('Failed to upload icon. Please try again.');
        console.error('Upload error:', errorText);
      }
    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Failed to upload icon. Please try again.');
    } finally {
      setUploadingIcons(prev => ({ ...prev, [uploadKey]: false }));
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, section: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const dataObj: any = {};
    
    // Special handling for array sections
    if (section === 'innovation' || section === 'technical-advantages' || section === 'advantages' || section === 'benefits') {
      const items: any[] = [];
      for (let i = 1; i <= 10; i++) {
        const title = (formData.get(`${section}_${i}_title`) as string)?.trim();
        const description = (formData.get(`${section}_${i}_description`) as string)?.trim();
        const content = (formData.get(`${section}_${i}_content`) as string)?.trim();
        
        // Get icon from form data, but also check iconUrls state (for innovation section)
        let icon = (formData.get(`${section}_${i}_icon`) as string)?.trim();
        if (section === 'innovation') {
          // For innovation section, prefer icon from state if available (from upload)
          const iconFieldName = `${section}_${i}_icon`;
          icon = iconUrls[iconFieldName] || icon || '';
        }
        
        // For innovation section, save all 6 items (even if empty) to preserve icons
        // For other sections, save item if it has a title OR content/description
        if (section === 'innovation') {
          // Always save all 6 innovation items to preserve icons
          items.push({ 
            icon: icon || '', 
            title: title || '', 
            description: description || '',
            content: content || description || '',
          });
        } else if (title || description || content) {
          items.push({ 
            icon: icon || '', 
            title: title || '', 
            description: description || '',
            content: content || description || '',
          });
        }
      }
      dataObj.items = items;
      dataObj.title = (formData.get('title') as string)?.trim() || '';
      if (section === 'technical-advantages' || section === 'advantages' || section === 'benefits') {
        const imageUrl = (formData.get('imageUrl') as string)?.trim() || '';
        if (imageUrl) {
          dataObj.imageUrl = imageUrl;
        } else {
          // If empty, explicitly set to empty string to remove image
          dataObj.imageUrl = '';
        }
      }
    } else if (section === 'intro') {
      dataObj.label = (formData.get('label') as string)?.trim() || '';
      dataObj.title = (formData.get('title') as string)?.trim() || '';
      dataObj.imageUrl = (formData.get('imageUrl') as string)?.trim() || '';
      const listItems: string[] = [];
      for (let i = 1; i <= 10; i++) {
        const item = (formData.get(`listItem_${i}`) as string)?.trim();
        if (item) listItems.push(item);
      }
      dataObj.listItems = listItems;
    } else if (section === 'comparison') {
      dataObj.title = (formData.get('title') as string)?.trim() || '';
      const rows: any[] = [];
      for (let i = 1; i <= 10; i++) {
        const aspect = (formData.get(`row_${i}_aspect`) as string)?.trim();
        const vensys = (formData.get(`row_${i}_vensys`) as string)?.trim();
        const dfig = (formData.get(`row_${i}_dfig`) as string)?.trim();
        if (aspect && (vensys || dfig)) {
          rows.push({ aspect, vensys: vensys || '', dfig: dfig || '' });
        }
      }
      dataObj.rows = rows;
    } else {
      formData.forEach((value, key) => { 
        dataObj[key] = value;
      });
    }
    
    try {
      const { saveCMSData } = await import('../../../utils/cms');
      await saveCMSData('technology', section, dataObj);
      
      // Refresh admin page data immediately
      if (refreshData) {
        setTimeout(() => {
          refreshData();
          
          // Refresh icon URLs from saved data (especially for innovation section)
          if (section === 'innovation') {
            setTimeout(() => {
              const innovationItems = getFieldValue('innovation', 'items') || [];
              const iconUrlMap: Record<string, string> = {};
              innovationItems.forEach((item: any, index: number) => {
                if (item && item.icon) {
                  iconUrlMap[`innovation_${index + 1}_icon`] = item.icon;
                }
              });
              setIconUrls(iconUrlMap);
            }, 300);
          }
          
          // Force form re-render by updating key
          setFormKey(prev => prev + 1);
        }, 500);
      }
      
      // Dispatch custom event to update frontend immediately
      window.dispatchEvent(
        new CustomEvent('cmsUpdate', {
          detail: { 
            page: 'technology', 
            section: section
          },
        })
      );
      
      alert('Changes saved successfully!');
    } catch (error: any) {
      console.error('Error saving:', error);
      const errorMessage = error?.message || 'Failed to save changes.';
      
      // Provide helpful error message based on error type
      if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch') || errorMessage.includes('Cannot connect')) {
        alert(`Connection Error: ${errorMessage}\n\nPlease ensure:\n1. The backend server is running on port 8080\n2. The server is accessible\n3. There are no firewall issues\n\nYour changes have been saved to local storage and will be synced when the server is available.`);
      } else if (errorMessage.includes('local storage')) {
        alert(errorMessage + ' Please check your API connection.');
      } else {
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout pageName="Technology" pagePath="/technology">
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  const sections = ['hero', 'intro', 'innovation', 'comparison', 'technical-advantages', 'advantages', 'benefits'];

  return (
    <AdminLayout pageName="Technology" pagePath="/technology">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === section ? 'bg-[#8DC63F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        {activeSection === 'hero' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hero Section</h2>
            <form key={`hero-${formKey}`} onSubmit={(e) => handleSubmit(e, 'hero')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Technology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                  <p className="text-xs text-gray-500 mb-2">Upload an image file or enter an image URL</p>
                  <div className="mt-2 mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Upload Image:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'bgImageUrl', 'hero')} 
                      disabled={uploading['hero_bgImageUrl']}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    {uploading['hero_bgImageUrl'] && (
                      <p className="text-xs text-blue-600 mt-1">
                        <i className="ri-loader-4-line animate-spin mr-1"></i>Uploading...
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Or enter image URL:</label>
                    <input 
                      type="text" 
                      name="bgImageUrl" 
                      id="hero-bgImageUrl"
                      defaultValue={getFieldValue('hero', 'bgImageUrl')} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" 
                      placeholder="https://example.com/hero-bg.jpg or /uploads/images/..." 
                    />
                  </div>
                  {(getFieldValue('hero', 'bgImageUrl') || imageUrls['hero_bgImageUrl']) && (
                    <div className="mt-2">
                      <img 
                        src={normalizeImageUrl(imageUrls['hero_bgImageUrl'] || getFieldValue('hero', 'bgImageUrl'))} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200" 
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
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

        {/* Intro Section */}
        {activeSection === 'intro' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Intro Section</h2>
            <form key={`intro-${formKey}`} onSubmit={(e) => handleSubmit(e, 'intro')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label (Uppercase)</label>
                  <input type="text" name="label" defaultValue={getFieldValue('intro', 'label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Overview" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('intro', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Advanced Technology for Superior Performance" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <p className="text-xs text-gray-500 mb-2">Upload an image file or enter an image URL</p>
                  <div className="mt-2 mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Upload Image:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'imageUrl', 'intro')} 
                      disabled={uploading['intro_imageUrl']}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    {uploading['intro_imageUrl'] && (
                      <p className="text-xs text-blue-600 mt-1">
                        <i className="ri-loader-4-line animate-spin mr-1"></i>Uploading...
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Or enter image URL:</label>
                    <input 
                      type="text" 
                      name="imageUrl" 
                      id="intro-imageUrl"
                      defaultValue={getFieldValue('intro', 'imageUrl')} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" 
                      placeholder="https://example.com/image.jpg or /uploads/images/..." 
                    />
                  </div>
                  {(getFieldValue('intro', 'imageUrl') || imageUrls['intro_imageUrl']) && (
                    <div className="mt-2">
                      <img 
                        src={normalizeImageUrl(imageUrls['intro_imageUrl'] || getFieldValue('intro', 'imageUrl'))} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200" 
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">List Items</label>
                  {[1, 2, 3, 4, 5].map((num) => {
                    const listItems = getFieldValue('intro', 'listItems') || [];
                    const item = listItems[num - 1] || '';
                    return (
                      <div key={num} className="mb-3">
                        <textarea name={`listItem_${num}`} defaultValue={item} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder={`List item ${num}...`} />
                      </div>
                    );
                  })}
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Innovation Section */}
        {activeSection === 'innovation' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Innovation Section</h2>
            <form key={`innovation-${formKey}`} onSubmit={(e) => handleSubmit(e, 'innovation')}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('innovation', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Salient features" />
                </div>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const items = getFieldValue('innovation', 'items') || [];
                  const item = items[num - 1] || { icon: '', title: '', description: '' };
                  const iconFieldName = `innovation_${num}_icon`;
                  const currentIconUrl = iconUrls[iconFieldName] || item.icon || '';
                  const isIconImage = currentIconUrl && (currentIconUrl.startsWith('http') || currentIconUrl.startsWith('/') || currentIconUrl.includes('.') && !currentIconUrl.startsWith('ri-'));
                  
                  return (
                    <div key={num} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Feature {num}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Upload Icon Image:</label>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleIconUpload(e, iconFieldName)} 
                                disabled={uploadingIcons[iconFieldName]}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                              />
                              {uploadingIcons[iconFieldName] && (
                                <div className="mt-1 text-xs text-blue-600 flex items-center">
                                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Uploading...
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Or enter Icon URL / RemixIcon class:</label>
                              <input 
                                type="text" 
                                name={iconFieldName} 
                                key={`${iconFieldName}-${formKey}-${currentIconUrl}`}
                                defaultValue={currentIconUrl} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" 
                                placeholder="https://example.com/icon.png or ri-settings-3-line" 
                                onChange={(e) => {
                                  // Update iconUrls state when user types
                                  const newValue = e.target.value;
                                  setIconUrls(prev => ({ ...prev, [iconFieldName]: newValue }));
                                }}
                                onBlur={(e) => {
                                  // Ensure the value is synced when user leaves the field
                                  const newValue = e.target.value;
                                  setIconUrls(prev => ({ ...prev, [iconFieldName]: newValue }));
                                }}
                              />
                            </div>
                            {currentIconUrl ? (
                              <div className="mt-2">
                                {isIconImage ? (
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={currentIconUrl} 
                                      alt={`Icon ${num}`} 
                                      className="w-12 h-12 object-contain rounded border border-gray-200 bg-white p-1" 
                                    />
                                    <span className="text-xs text-gray-500">Icon Preview</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                                      <i className={`${currentIconUrl} text-[#8DC63F] text-2xl`}></i>
                                    </div>
                                    <span className="text-xs text-gray-500">RemixIcon Preview</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <i className="ri-image-line text-gray-300 text-xl"></i>
                                  </div>
                                  <span>No icon set - upload an image or enter an icon class/URL</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input type="text" name={`innovation_${num}_title`} defaultValue={item.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Feature title" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <textarea name={`innovation_${num}_description`} defaultValue={item.description} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Feature description" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Comparison Section */}
        {activeSection === 'comparison' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comparison Section</h2>
            <form key={`comparison-${formKey}`} onSubmit={(e) => handleSubmit(e, 'comparison')}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('comparison', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Technology Comparison" />
                </div>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                  const rows = getFieldValue('comparison', 'rows') || [];
                  const row = rows[num - 1] || { aspect: '', vensys: '', dfig: '' };
                  return (
                    <div key={num} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Row {num}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Aspect</label>
                          <input type="text" name={`row_${num}_aspect`} defaultValue={row.aspect} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Design concept" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Vensys GWH182-5.3 PMG Hybrid</label>
                          <textarea name={`row_${num}_vensys`} defaultValue={row.vensys} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Vensys description" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Gearbox wind turbines DFIG</label>
                          <textarea name={`row_${num}_dfig`} defaultValue={row.dfig} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="DFIG description" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Technical Advantages Section */}
        {activeSection === 'technical-advantages' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Advantages Section</h2>
            <form key={`technical-advantages-${formKey}`} onSubmit={(e) => handleSubmit(e, 'technical-advantages')}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('technical-advantages', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Technical Advantages" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <p className="text-xs text-gray-500 mb-2">Upload an image file or enter an image URL</p>
                  <div className="mt-2 mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Upload Image:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'imageUrl', 'technical-advantages')} 
                      disabled={uploading['technical-advantages_imageUrl']}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    {uploading['technical-advantages_imageUrl'] && (
                      <p className="text-xs text-blue-600 mt-1">
                        <i className="ri-loader-4-line animate-spin mr-1"></i>Uploading...
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Or enter image URL:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="imageUrl" 
                        id="technical-advantages-imageUrl"
                        defaultValue={getFieldValue('technical-advantages', 'imageUrl')} 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" 
                        placeholder="https://example.com/image.jpg or /uploads/images/..." 
                      />
                      {(imageUrls['technical-advantages_imageUrl'] || getFieldValue('technical-advantages', 'imageUrl')) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('imageUrl', 'technical-advantages')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                          <i className="ri-delete-bin-line mr-2"></i>Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {(imageUrls['technical-advantages_imageUrl'] || getFieldValue('technical-advantages', 'imageUrl')) && (
                    <div className="mt-2">
                      <img 
                        src={normalizeImageUrl(imageUrls['technical-advantages_imageUrl'] || getFieldValue('technical-advantages', 'imageUrl'))} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200" 
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const items = getFieldValue('technical-advantages', 'items') || [];
                  const defaultItems = [
                    { title: 'Variable-Speed Variable-Pitch Control', content: 'Adaptable to random changes in wind, optimizing power output.' },
                    { title: 'Permanent Magnet, Medium Speed Drive-Train Technology', content: 'Higher wind energy utilization, minimal energy loss and less maintenance (low speed). Optimized technology giving advantages of both permanent magnet generator and low-speed drive train. Active air-cooling system for generator and drive-train ensures high performance and reliability.' },
                    { title: 'Adaptive Active Yaw System', content: 'Automatically corrects wind vane orientation for improved wind alignment accuracy.' },
                    { title: 'Full-Power Converter', content: 'Outstanding fault ride through capability and grid friendliness (AC-DC-AC conversion). Full power converter is cooled by active liquid cooling system, effectively improving the cooling efficiency.' },
                    { title: 'Comprehensive Load and Strength Calculation', content: 'Redundancy design for high reliability.' },
                    { title: 'Capacitance Detection Technology', content: 'Regularly detects ultra capacitors of the pitch system, reducing risk to the wind turbine.' },
                    { title: 'Modular Structural Design', content: 'Enables flexible installation and construction.' },
                    { title: 'Quality Control and Factory Inspection System', content: 'Facilitates easy commissioning and stable operation.' },
                    { title: 'Monitoring Systems', content: 'Central, remote, and online monitoring systems for efficient operation and maintenance.' },
                  ];
                  const item = items[num - 1] || defaultItems[num - 1] || { title: '', content: '' };
                  const defaultItem = defaultItems[num - 1] || { title: '', content: '' };
                  return (
                    <div key={num} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Advantage {num}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input type="text" name={`technical-advantages_${num}_title`} defaultValue={item.title || defaultItem.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder={defaultItem.title || "Advantage title"} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                          <textarea name={`technical-advantages_${num}_content`} defaultValue={item.content || defaultItem.content} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder={defaultItem.content || "Advantage content"} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Advantages Section */}
        {activeSection === 'advantages' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Advantages Section</h2>
            <form key={`advantages-${formKey}`} onSubmit={(e) => handleSubmit(e, 'advantages')}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('advantages', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Advantages over Competitors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <p className="text-xs text-gray-500 mb-2">Upload an image file or enter an image URL</p>
                  <div className="mt-2 mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Upload Image:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'imageUrl', 'advantages')} 
                      disabled={uploading['advantages_imageUrl']}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    {uploading['advantages_imageUrl'] && (
                      <p className="text-xs text-blue-600 mt-1">
                        <i className="ri-loader-4-line animate-spin mr-1"></i>Uploading...
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Or enter image URL:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="imageUrl" 
                        id="advantages-imageUrl"
                        defaultValue={getFieldValue('advantages', 'imageUrl')} 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" 
                        placeholder="https://example.com/image.jpg or /uploads/images/..." 
                      />
                      {(imageUrls['advantages_imageUrl'] || getFieldValue('advantages', 'imageUrl')) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('imageUrl', 'advantages')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                          <i className="ri-delete-bin-line mr-2"></i>Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {(imageUrls['advantages_imageUrl'] || getFieldValue('advantages', 'imageUrl')) && (
                    <div className="mt-2">
                      <img 
                        src={normalizeImageUrl(imageUrls['advantages_imageUrl'] || getFieldValue('advantages', 'imageUrl'))} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200" 
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const items = getFieldValue('advantages', 'items') || [];
                  const item = items[num - 1] || { title: '', content: '' };
                  return (
                    <div key={num} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Advantage {num}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input type="text" name={`advantages_${num}_title`} defaultValue={item.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Advantage title" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                          <textarea name={`advantages_${num}_content`} defaultValue={item.content} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Advantage content" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Benefits Section */}
        {activeSection === 'benefits' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits Section</h2>
            <form key={`benefits-${formKey}`} onSubmit={(e) => handleSubmit(e, 'benefits')}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('benefits', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Other Benefits" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <p className="text-xs text-gray-500 mb-2">Upload an image file or enter an image URL</p>
                  <div className="mt-2 mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Upload Image:</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'imageUrl', 'benefits')} 
                      disabled={uploading['benefits_imageUrl']}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    {uploading['benefits_imageUrl'] && (
                      <p className="text-xs text-blue-600 mt-1">
                        <i className="ri-loader-4-line animate-spin mr-1"></i>Uploading...
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Or enter image URL:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="imageUrl" 
                        id="benefits-imageUrl"
                        defaultValue={getFieldValue('benefits', 'imageUrl')} 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" 
                        placeholder="https://example.com/image.jpg or /uploads/images/..." 
                      />
                      {(imageUrls['benefits_imageUrl'] || getFieldValue('benefits', 'imageUrl')) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('imageUrl', 'benefits')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                          <i className="ri-delete-bin-line mr-2"></i>Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {(imageUrls['benefits_imageUrl'] || getFieldValue('benefits', 'imageUrl')) && (
                    <div className="mt-2">
                      <img 
                        src={normalizeImageUrl(imageUrls['benefits_imageUrl'] || getFieldValue('benefits', 'imageUrl'))} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200" 
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                {[1, 2, 3, 4].map((num) => {
                  const items = getFieldValue('benefits', 'items') || [];
                  const item = items[num - 1] || { title: '', content: '' };
                  return (
                    <div key={num} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Benefit {num}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input type="text" name={`benefits_${num}_title`} defaultValue={item.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Benefit title" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                          <textarea name={`benefits_${num}_content`} defaultValue={item.content} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Benefit content" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
