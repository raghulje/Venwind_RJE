import { useState } from 'react';
import AdminLayout, { API_BASE_URL, deleteUploadedFile } from '../components/AdminLayout';
import { useCMSData } from '../hooks/useCMSData';
import { normalizeImageUrl } from '../../../utils/cms';

export default function AdminHomePage() {
  const [activeSection, setActiveSection] = useState('hero');
  const { getFieldValue, loading } = useCMSData('home');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Use relative path if API_BASE_URL is empty (works with Vite proxy)
      const uploadUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/upload/image`
        : '/api/upload/image';
      
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
            // Trigger change event to update form state
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          setImageUrls(prev => ({ ...prev, [fieldName]: fullUrl }));
          alert('Icon uploaded successfully! Click "Save Changes" to save.');
        } else {
          alert('Failed to upload icon: ' + (result.error || 'Unknown error'));
        }
      } else {
        const errorText = await response.text();
        let errorMessage = 'Failed to upload icon. Please try again.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText;
        }
        alert(errorMessage);
        console.error('Upload error:', errorText);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload icon. Please try again.');
    } finally {
      e.target.value = ''; // Reset file input
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
          setImageUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[fieldName];
            return newUrls;
          });
          alert('Image deleted successfully!');
        } else {
          alert('Failed to delete image. It may have already been deleted.');
        }
      }
    } else {
      // For external URLs, just clear the field
      if (confirm('Remove this image URL?')) {
        input.value = '';
        setImageUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[fieldName];
          return newUrls;
        });
      }
    }
  };

  // Helper to check if field has an image
  const hasImage = (fieldName: string, section?: string) => {
    const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    const currentValue = input?.value && input.value.trim() !== '';
    const storedValue = imageUrls[fieldName];
    const defaultValue = section ? getFieldValue(section, fieldName) : '';
    return storedValue || currentValue || (defaultValue && defaultValue.trim() !== '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, section: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const dataObj: any = {};
    formData.forEach((value, key) => {
      dataObj[key] = value;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/cms/page/home/section/${section}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataObj),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const dataKey = `cms_home_${section}`;
          localStorage.setItem(dataKey, JSON.stringify(result.data || dataObj));
          window.dispatchEvent(new CustomEvent('cmsUpdate', { detail: { page: 'home', section } }));
          alert('Changes saved successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageName="Home" pagePath="/">
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageName="Home" pagePath="/">
      <div className="space-y-6">
        {/* Section Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {['hero', 'stats', 'differentiators', 'header', 'footer'].map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === section
                    ? 'bg-[#8DC63F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        {activeSection === 'hero' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hero Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'hero')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={getFieldValue('hero', 'title')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                    placeholder="Revolutionizing Wind Energy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    name="subtitle"
                    defaultValue={getFieldValue('hero', 'subtitle')}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                    placeholder="Explore the power of cutting-edge wind turbine manufacturing..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    defaultValue={getFieldValue('hero', 'buttonText')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                  <input
                    type="text"
                    name="buttonLink"
                    defaultValue={getFieldValue('hero', 'buttonLink')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                    placeholder="/products"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Video</label>
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload video from local:</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        try {
                          const formData = new FormData();
                          formData.append('video', file);
                          
                          const uploadUrl = API_BASE_URL 
                            ? `${API_BASE_URL}/api/upload/video`
                            : '/api/upload/video';
                          
                          const response = await fetch(uploadUrl, {
                            method: 'POST',
                            body: formData,
                          });
                          
                          if (response.ok) {
                            const result = await response.json();
                            if (result.success && (result.videoUrl || result.fileUrl)) {
                              const fullUrl = API_BASE_URL 
                                ? `${API_BASE_URL}${result.videoUrl || result.fileUrl}` 
                                : (result.videoUrl || result.fileUrl);
                              const input = document.querySelector('input[name="videoUrl"]') as HTMLInputElement;
                              if (input) {
                                input.value = fullUrl;
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                              }
                              alert('Video uploaded successfully! Click "Save Changes" to save.');
                            } else {
                              alert('Failed to upload video: ' + (result.error || 'Unknown error'));
                            }
                          } else {
                            const errorText = await response.text();
                            let errorMessage = 'Failed to upload video. Please try again.';
                            try {
                              const errorJson = JSON.parse(errorText);
                              errorMessage = errorJson.error || errorJson.message || errorMessage;
                            } catch {
                              if (errorText) errorMessage = errorText;
                            }
                            alert(errorMessage);
                          }
                        } catch (error) {
                          console.error('Error uploading video:', error);
                          alert('Failed to upload video: ' + (error instanceof Error ? error.message : 'Please try again.'));
                        } finally {
                          e.target.value = '';
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Or enter video URL:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="videoUrl"
                        defaultValue={getFieldValue('hero', 'videoUrl')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                        placeholder="https://example.com/video.mp4"
                      />
                      {getFieldValue('hero', 'videoUrl') && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Remove this video?')) {
                              const input = document.querySelector('input[name="videoUrl"]') as HTMLInputElement;
                              if (input) {
                                const videoUrl = input.value;
                                if (videoUrl.includes('/uploads/')) {
                                  try {
                                    await deleteUploadedFile(videoUrl);
                                  } catch (error) {
                                    console.error('Error deleting video:', error);
                                  }
                                }
                                input.value = '';
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                              }
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                          title="Remove video"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL (fallback)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="bgImageUrl"
                      defaultValue={getFieldValue('hero', 'bgImageUrl')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {hasImage('bgImageUrl', 'hero') && (
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
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'bgImageUrl')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Section */}
        {activeSection === 'stats' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Stats Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'stats')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="bgImageUrl"
                      defaultValue={getFieldValue('stats', 'bgImageUrl')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                      placeholder="https://example.com/stats-bg.jpg"
                    />
                    {hasImage('bgImageUrl', 'hero') && (
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
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'bgImageUrl')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Number</label>
                    <input type="text" name="stat1Number" defaultValue={getFieldValue('stats', 'stat1Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="500+" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Label</label>
                    <input type="text" name="stat1Label" defaultValue={getFieldValue('stats', 'stat1Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="MW Installed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Icon</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" name="stat1Icon" defaultValue={getFieldValue('stats', 'stat1Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                    {getFieldValue('stats', 'stat1Icon') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Remove this icon?')) {
                            const input = document.querySelector('input[name="stat1Icon"]') as HTMLInputElement;
                            if (input) input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        title="Remove icon"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload icon image (SVG, PNG, JPG):</label>
                    <input type="file" accept="image/*,.svg" onChange={(e) => handleImageUpload(e, 'stat1Icon')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('stats', 'stat1Icon') && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                        {getFieldValue('stats', 'stat1Icon').startsWith('http') || getFieldValue('stats', 'stat1Icon').startsWith('/') || getFieldValue('stats', 'stat1Icon').includes('.') && !getFieldValue('stats', 'stat1Icon').startsWith('ri-') ? (
                          <img src={getFieldValue('stats', 'stat1Icon')} alt="Icon preview" className="w-12 h-12 object-contain" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                            <i className={`${getFieldValue('stats', 'stat1Icon')} text-[#8DC63F] text-2xl`}></i>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">Current Icon</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 2 Number</label>
                    <input type="text" name="stat2Number" defaultValue={getFieldValue('stats', 'stat2Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="25+" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 2 Label</label>
                    <input type="text" name="stat2Label" defaultValue={getFieldValue('stats', 'stat2Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Years Experience" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stat 2 Icon</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" name="stat2Icon" defaultValue={getFieldValue('stats', 'stat2Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                    {getFieldValue('stats', 'stat2Icon') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Remove this icon?')) {
                            const input = document.querySelector('input[name="stat2Icon"]') as HTMLInputElement;
                            if (input) input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        title="Remove icon"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload icon image (SVG, PNG, JPG):</label>
                    <input type="file" accept="image/*,.svg" onChange={(e) => handleImageUpload(e, 'stat2Icon')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('stats', 'stat2Icon') && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                        {getFieldValue('stats', 'stat2Icon').startsWith('http') || getFieldValue('stats', 'stat2Icon').startsWith('/') || getFieldValue('stats', 'stat2Icon').includes('.') && !getFieldValue('stats', 'stat2Icon').startsWith('ri-') ? (
                          <img src={getFieldValue('stats', 'stat2Icon')} alt="Icon preview" className="w-12 h-12 object-contain" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                            <i className={`${getFieldValue('stats', 'stat2Icon')} text-[#8DC63F] text-2xl`}></i>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">Current Icon</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 3 Number</label>
                    <input type="text" name="stat3Number" defaultValue={getFieldValue('stats', 'stat3Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="15+" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 3 Label</label>
                    <input type="text" name="stat3Label" defaultValue={getFieldValue('stats', 'stat3Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Countries" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stat 3 Icon</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" name="stat3Icon" defaultValue={getFieldValue('stats', 'stat3Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                    {getFieldValue('stats', 'stat3Icon') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Remove this icon?')) {
                            const input = document.querySelector('input[name="stat3Icon"]') as HTMLInputElement;
                            if (input) input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        title="Remove icon"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload icon image (SVG, PNG, JPG):</label>
                    <input type="file" accept="image/*,.svg" onChange={(e) => handleImageUpload(e, 'stat3Icon')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('stats', 'stat3Icon') && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                        {getFieldValue('stats', 'stat3Icon').startsWith('http') || getFieldValue('stats', 'stat3Icon').startsWith('/') || getFieldValue('stats', 'stat3Icon').includes('.') && !getFieldValue('stats', 'stat3Icon').startsWith('ri-') ? (
                          <img src={getFieldValue('stats', 'stat3Icon')} alt="Icon preview" className="w-12 h-12 object-contain" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                            <i className={`${getFieldValue('stats', 'stat3Icon')} text-[#8DC63F] text-2xl`}></i>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">Current Icon</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 4 Number</label>
                    <input type="text" name="stat4Number" defaultValue={getFieldValue('stats', 'stat4Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="98%" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stat 4 Label</label>
                    <input type="text" name="stat4Label" defaultValue={getFieldValue('stats', 'stat4Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Uptime" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stat 4 Icon</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" name="stat4Icon" defaultValue={getFieldValue('stats', 'stat4Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                    {getFieldValue('stats', 'stat4Icon') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Remove this icon?')) {
                            const input = document.querySelector('input[name="stat4Icon"]') as HTMLInputElement;
                            if (input) input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        title="Remove icon"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload icon image (SVG, PNG, JPG):</label>
                    <input type="file" accept="image/*,.svg" onChange={(e) => handleImageUpload(e, 'stat4Icon')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('stats', 'stat4Icon') && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                        {getFieldValue('stats', 'stat4Icon').startsWith('http') || getFieldValue('stats', 'stat4Icon').startsWith('/') || getFieldValue('stats', 'stat4Icon').includes('.') && !getFieldValue('stats', 'stat4Icon').startsWith('ri-') ? (
                          <img src={getFieldValue('stats', 'stat4Icon')} alt="Icon preview" className="w-12 h-12 object-contain" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                            <i className={`${getFieldValue('stats', 'stat4Icon')} text-[#8DC63F] text-2xl`}></i>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">Current Icon</span>
                      </div>
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

        {/* Differentiators Section */}
        {activeSection === 'differentiators' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Differentiators Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'differentiators')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('differentiators', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Why Choose Us" />
                </div>
                
                {/* Left Side Image - Main Section Image */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Side Image (Main Section Image)</label>
                  <p className="text-xs text-gray-500 mb-3">This image appears on the left side of the differentiators section</p>
                  <div className="flex gap-2 mb-2">
                    <input type="text" name="feature1Image" defaultValue={getFieldValue('differentiators', 'feature1Image')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/image.jpg or /uploads/images/image.jpg" />
                    {hasImage('feature1Image', 'differentiators') && (
                      <button
                        type="button"
                        onClick={() => handleImageDelete('feature1Image')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        title="Delete image"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload image from local:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'feature1Image')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('differentiators', 'feature1Image') && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-600 mb-1">Current Image Preview:</label>
                      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img 
                          src={normalizeImageUrl(getFieldValue('differentiators', 'feature1Image'))} 
                          alt="Left side image preview" 
                          className="max-w-full h-auto max-h-48 object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<p class="text-xs text-red-500">Failed to load image preview. Please check the image URL.</p>';
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Feature Items */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Items</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 1 Title</label>
                    <input type="text" name="feature1Title" defaultValue={getFieldValue('differentiators', 'feature1Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="German Engineering" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 1 Description</label>
                    <textarea name="feature1Desc" defaultValue={getFieldValue('differentiators', 'feature1Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 2 Title</label>
                    <input type="text" name="feature2Title" defaultValue={getFieldValue('differentiators', 'feature2Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Proven Technology" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 2 Description</label>
                    <textarea name="feature2Desc" defaultValue={getFieldValue('differentiators', 'feature2Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 2 Image URL</label>
                    <div className="flex gap-2">
                      <input type="text" name="feature2Image" defaultValue={getFieldValue('differentiators', 'feature2Image')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/feature2.jpg" />
                      {hasImage('feature2Image', 'differentiators') && (
                        <button
                          type="button"
                          onClick={() => handleImageDelete('feature2Image')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                          title="Delete image"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                    <div className="mt-2">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'feature2Image')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 3 Title</label>
                    <input type="text" name="feature3Title" defaultValue={getFieldValue('differentiators', 'feature3Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Local Support" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 3 Description</label>
                    <textarea name="feature3Desc" defaultValue={getFieldValue('differentiators', 'feature3Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feature 3 Image URL</label>
                    <div className="flex gap-2">
                      <input type="text" name="feature3Image" defaultValue={getFieldValue('differentiators', 'feature3Image')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/feature3.jpg" />
                      {hasImage('feature3Image', 'differentiators') && (
                        <button
                          type="button"
                          onClick={() => handleImageDelete('feature3Image')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                          title="Delete image"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                    <div className="mt-2">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'feature3Image')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Header Section */}
        {activeSection === 'header' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Header/Navigation</h2>
            <form onSubmit={(e) => handleSubmit(e, 'header')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name/Logo Text</label>
                  <input type="text" name="companyName" defaultValue={getFieldValue('header', 'companyName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="VenWind Refex" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image</label>
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload logo from local:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Or enter image URL:</label>
                    <div className="flex gap-2">
                      <input type="text" name="logoUrl" defaultValue={getFieldValue('header', 'logoUrl')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/logo.png" />
                      {hasImage('logoUrl', 'header') && (
                        <button
                          type="button"
                          onClick={() => handleImageDelete('logoUrl')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                          title="Delete image"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  {getFieldValue('header', 'logoUrl') && (
                    <div className="mt-2">
                      <img src={getFieldValue('header', 'logoUrl')} alt="Logo preview" className="h-16 w-auto object-contain border border-gray-200 rounded-lg p-2" />
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

        {/* Footer Section */}
        {activeSection === 'footer' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Footer</h2>
            <form onSubmit={(e) => handleSubmit(e, 'footer')}>
              <div className="space-y-4">
                {/* Logo Section */}
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Logo</label>
                  <p className="text-xs text-gray-500 mb-3">Logo displayed at the top of the footer</p>
                  <div className="flex gap-2 mb-2">
                    <input type="text" name="logoUrl" defaultValue={getFieldValue('footer', 'logoUrl')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/logo.png or /uploads/images/logo.png" />
                    {hasImage('logoUrl', 'footer') && (
                      <button
                        type="button"
                        onClick={() => handleImageDelete('logoUrl')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        title="Delete logo"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload logo from local:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('footer', 'logoUrl') && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-600 mb-1">Logo Preview:</label>
                      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img 
                          src={normalizeImageUrl(getFieldValue('footer', 'logoUrl'))} 
                          alt="Footer logo preview" 
                          className="h-12 w-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<p class="text-xs text-red-500">Failed to load logo preview</p>';
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Image Section */}
                <div className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Image</label>
                  <p className="text-xs text-gray-500 mb-3">Additional image that can be displayed in the footer (optional)</p>
                  <div className="flex gap-2 mb-2">
                    <input type="text" name="imageUrl" defaultValue={getFieldValue('footer', 'imageUrl')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/footer-image.jpg or /uploads/images/footer-image.jpg" />
                    {hasImage('imageUrl', 'footer') && (
                      <button
                        type="button"
                        onClick={() => handleImageDelete('imageUrl')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                        title="Delete image"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload image from local:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('footer', 'imageUrl') && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-600 mb-1">Image Preview:</label>
                      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img 
                          src={normalizeImageUrl(getFieldValue('footer', 'imageUrl'))} 
                          alt="Footer image preview" 
                          className="max-w-full h-auto max-h-48 object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<p class="text-xs text-red-500">Failed to load image preview</p>';
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                  <textarea name="description" defaultValue={getFieldValue('footer', 'description')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Leading manufacturer of wind turbines..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" name="email" defaultValue={getFieldValue('footer', 'email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="info@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="text" name="phone" defaultValue={getFieldValue('footer', 'phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="+91 44 - 3504 0050" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input type="text" name="address" defaultValue={getFieldValue('footer', 'address')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="123 Wind Energy St, City" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
                  <input type="text" name="copyright" defaultValue={getFieldValue('footer', 'copyright')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="© 2025 Company Name. All rights reserved." />
                </div>
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

