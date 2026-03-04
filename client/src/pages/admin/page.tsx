import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CMSData {
  [key: string]: any;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [cmsData, setCmsData] = useState<CMSData>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Load all CMS data from backend API
    const loadCMSData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/admin/cms`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Transform the data structure from { page: { section: data } } to { cms_page_section: data }
            const transformedData: CMSData = {};
            Object.keys(result.data).forEach(page => {
              Object.keys(result.data[page]).forEach(section => {
                transformedData[`cms_${page}_${section}`] = result.data[page][section];
              });
            });
            setCmsData(transformedData);
          }
        }
      } catch (error) {
        console.error('Error loading CMS data from API:', error);
        // Fallback to localStorage if API fails
        const loadedData: CMSData = {};
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cms_')) {
            try {
              loadedData[key] = JSON.parse(localStorage.getItem(key) || '{}');
            } catch (e) {
              console.error('Error loading', key);
            }
          }
        });
        setCmsData(loadedData);
      } finally {
        setLoading(false);
      }
    };

    loadCMSData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/login');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    try {
      // Upload image to server
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
          
          // Update the input field with the image URL
          const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
          if (input) {
            input.value = fullUrl;
            // Trigger change event to update form state
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
      setUploadingImage(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, page: string, section: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Convert FormData to object
    const dataObj: any = {};
    formData.forEach((value, key) => {
      dataObj[key] = value;
    });

    // Save to backend API
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/cms/page/${page}/section/${section}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataObj),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update state with saved data
          const dataKey = `cms_${page}_${section}`;
          setCmsData(prev => ({
            ...prev,
            [dataKey]: result.data || dataObj
          }));

          // Also save to localStorage as backup
          localStorage.setItem(dataKey, JSON.stringify(result.data || dataObj));

          // Show success message
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);

          // Dispatch custom event to update pages
          window.dispatchEvent(new CustomEvent('cmsUpdate', { detail: { page, section } }));
        } else {
          console.error('Failed to save:', result.message);
          alert('Failed to save changes. Please try again.');
        }
      } else {
        console.error('API error:', response.statusText);
        // Fallback to localStorage if API fails
        const dataKey = `cms_${page}_${section}`;
        localStorage.setItem(dataKey, JSON.stringify(dataObj));
        setCmsData(prev => ({
          ...prev,
          [dataKey]: dataObj
        }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        alert('Saved to local storage. API unavailable.');
      }
    } catch (error) {
      console.error('Error saving to API:', error);
      // Fallback to localStorage
      const dataKey = `cms_${page}_${section}`;
      localStorage.setItem(dataKey, JSON.stringify(dataObj));
      setCmsData(prev => ({
        ...prev,
        [dataKey]: dataObj
      }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      alert('Saved to local storage. API unavailable.');
    }
  };

  const getFieldValue = (page: string, section: string, field: string) => {
    const key = `cms_${page}_${section}`;
    return cmsData[key]?.[field] || '';
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: 'ri-home-4-line' },
    { id: 'about', label: 'About', icon: 'ri-information-line' },
    { id: 'products', label: 'Products', icon: 'ri-product-hunt-line' },
    { id: 'technology', label: 'Technology', icon: 'ri-lightbulb-line' },
    { id: 'sustainability', label: 'Sustainability', icon: 'ri-leaf-line' },
    { id: 'careers', label: 'Careers', icon: 'ri-briefcase-line' },
    { id: 'contact', label: 'Contact', icon: 'ri-mail-line' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CMS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management System</h1>
              <p className="text-sm text-gray-600 mt-1">Edit your website content and images</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
                <i className="ri-eye-line mr-2"></i>View Site
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                <i className="ri-logout-box-line mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-6 bg-[#8DC63F] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <i className="ri-check-line mr-2"></i>Changes saved successfully!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveSection('hero');
                }}
                className={`flex items-center px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#8DC63F] text-[#8DC63F] bg-[#8DC63F]/10'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <i className={`${tab.icon} text-lg mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forms */}
          <div className="lg:col-span-2">
            {/* HOME PAGE */}
            {activeTab === 'home' && (
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
                    <form onSubmit={(e) => handleSubmit(e, 'home', 'hero')} id="home-hero-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
                          <input
                            type="text"
                            name="title"
                            defaultValue={getFieldValue('home', 'hero', 'title')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                            placeholder="Revolutionizing Wind Energy"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea
                            name="subtitle"
                            defaultValue={getFieldValue('home', 'hero', 'subtitle')}
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
                            defaultValue={getFieldValue('home', 'hero', 'buttonText')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                            placeholder="Learn More"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                          <input
                            type="text"
                            name="buttonLink"
                            defaultValue={getFieldValue('home', 'hero', 'buttonLink')}
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
                                defaultValue={getFieldValue('home', 'hero', 'videoUrl')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                                placeholder="https://example.com/video.mp4"
                              />
                              {getFieldValue('home', 'hero', 'videoUrl') && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Remove this video?')) {
                                      const input = document.querySelector('input[name="videoUrl"]') as HTMLInputElement;
                                      if (input) {
                                        const videoUrl = input.value;
                                        // If it's an uploaded file, try to delete it
                                        if (videoUrl.includes('/uploads/')) {
                                          try {
                                            const { deleteUploadedFile } = await import('./components/AdminLayout');
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Background Image (fallback)</label>
                          <div className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1">Upload image from local:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'bgImageUrl')}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                            />
                          </div>
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Or enter image URL:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                name="bgImageUrl"
                                defaultValue={getFieldValue('home', 'hero', 'bgImageUrl')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                              />
                              {getFieldValue('home', 'hero', 'bgImageUrl') && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Remove this image?')) {
                                      const input = document.querySelector('input[name="bgImageUrl"]') as HTMLInputElement;
                                      if (input) {
                                        const imageUrl = input.value;
                                        // If it's an uploaded file, try to delete it
                                        if (imageUrl.includes('/uploads/')) {
                                          try {
                                            const { deleteUploadedFile } = await import('./components/AdminLayout');
                                            await deleteUploadedFile(imageUrl);
                                          } catch (error) {
                                            console.error('Error deleting image:', error);
                                          }
                                        }
                                        input.value = '';
                                        input.dispatchEvent(new Event('input', { bubbles: true }));
                                        input.dispatchEvent(new Event('change', { bubbles: true }));
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                                  title="Remove image"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
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
                    <form onSubmit={(e) => handleSubmit(e, 'home', 'stats')} id="home-stats-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                          <div className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1">Upload image from local:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'bgImageUrl')}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                            />
                          </div>
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Or enter image URL:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                name="bgImageUrl"
                                defaultValue={getFieldValue('home', 'stats', 'bgImageUrl')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                                placeholder="https://example.com/stats-bg.jpg"
                              />
                              {getFieldValue('home', 'stats', 'bgImageUrl') && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Remove this image?')) {
                                      const input = document.querySelector('input[name="bgImageUrl"]') as HTMLInputElement;
                                      if (input) {
                                        const imageUrl = input.value;
                                        // If it's an uploaded file, try to delete it
                                        if (imageUrl.includes('/uploads/')) {
                                          try {
                                            const { deleteUploadedFile } = await import('./components/AdminLayout');
                                            await deleteUploadedFile(imageUrl);
                                          } catch (error) {
                                            console.error('Error deleting image:', error);
                                          }
                                        }
                                        input.value = '';
                                        input.dispatchEvent(new Event('input', { bubbles: true }));
                                        input.dispatchEvent(new Event('change', { bubbles: true }));
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                                  title="Remove image"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Number</label>
                            <input type="text" name="stat1Number" defaultValue={getFieldValue('home', 'stats', 'stat1Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="500+" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Label</label>
                            <input type="text" name="stat1Label" defaultValue={getFieldValue('home', 'stats', 'stat1Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="MW Installed" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Icon</label>
                          <div className="flex gap-2 mb-2">
                            <input type="text" name="stat1Icon" defaultValue={getFieldValue('home', 'stats', 'stat1Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                            {getFieldValue('home', 'stats', 'stat1Icon') && (
                              <button
                                type="button"
                                onClick={async () => {
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
                          {getFieldValue('home', 'stats', 'stat1Icon') && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                {getFieldValue('home', 'stats', 'stat1Icon').startsWith('http') || getFieldValue('home', 'stats', 'stat1Icon').startsWith('/') || (getFieldValue('home', 'stats', 'stat1Icon').includes('.') && !getFieldValue('home', 'stats', 'stat1Icon').startsWith('ri-')) ? (
                                  <img src={getFieldValue('home', 'stats', 'stat1Icon')} alt="Icon preview" className="w-12 h-12 object-contain" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                                    <i className={`${getFieldValue('home', 'stats', 'stat1Icon')} text-[#8DC63F] text-2xl`}></i>
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
                            <input type="text" name="stat2Number" defaultValue={getFieldValue('home', 'stats', 'stat2Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="25+" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stat 2 Label</label>
                            <input type="text" name="stat2Label" defaultValue={getFieldValue('home', 'stats', 'stat2Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Years Experience" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stat 2 Icon</label>
                          <div className="flex gap-2 mb-2">
                            <input type="text" name="stat2Icon" defaultValue={getFieldValue('home', 'stats', 'stat2Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                            {getFieldValue('home', 'stats', 'stat2Icon') && (
                              <button
                                type="button"
                                onClick={async () => {
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
                          {getFieldValue('home', 'stats', 'stat2Icon') && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                {getFieldValue('home', 'stats', 'stat2Icon').startsWith('http') || getFieldValue('home', 'stats', 'stat2Icon').startsWith('/') || (getFieldValue('home', 'stats', 'stat2Icon').includes('.') && !getFieldValue('home', 'stats', 'stat2Icon').startsWith('ri-')) ? (
                                  <img src={getFieldValue('home', 'stats', 'stat2Icon')} alt="Icon preview" className="w-12 h-12 object-contain" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                                    <i className={`${getFieldValue('home', 'stats', 'stat2Icon')} text-[#8DC63F] text-2xl`}></i>
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
                            <input type="text" name="stat3Number" defaultValue={getFieldValue('home', 'stats', 'stat3Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="15+" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stat 3 Label</label>
                            <input type="text" name="stat3Label" defaultValue={getFieldValue('home', 'stats', 'stat3Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Countries" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stat 3 Icon</label>
                          <div className="flex gap-2 mb-2">
                            <input type="text" name="stat3Icon" defaultValue={getFieldValue('home', 'stats', 'stat3Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                            {getFieldValue('home', 'stats', 'stat3Icon') && (
                              <button
                                type="button"
                                onClick={async () => {
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
                          {getFieldValue('home', 'stats', 'stat3Icon') && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                {getFieldValue('home', 'stats', 'stat3Icon').startsWith('http') || getFieldValue('home', 'stats', 'stat3Icon').startsWith('/') || (getFieldValue('home', 'stats', 'stat3Icon').includes('.') && !getFieldValue('home', 'stats', 'stat3Icon').startsWith('ri-')) ? (
                                  <img src={getFieldValue('home', 'stats', 'stat3Icon')} alt="Icon preview" className="w-12 h-12 object-contain" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-[#8DC63F]/10 flex items-center justify-center">
                                    <i className={`${getFieldValue('home', 'stats', 'stat3Icon')} text-[#8DC63F] text-2xl`}></i>
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
                            <input type="text" name="stat4Number" defaultValue={getFieldValue('home', 'stats', 'stat4Number')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="98%" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stat 4 Label</label>
                            <input type="text" name="stat4Label" defaultValue={getFieldValue('home', 'stats', 'stat4Label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Uptime" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stat 4 Icon</label>
                          <div className="flex gap-2 mb-2">
                            <input type="text" name="stat4Icon" defaultValue={getFieldValue('home', 'stats', 'stat4Icon')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Icon URL or RemixIcon class" />
                            {getFieldValue('home', 'stats', 'stat4Icon') && (
                              <button
                                type="button"
                                onClick={async () => {
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
                            <label className="block text-xs text-gray-600 mb-1">Upload icon image:</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'stat4Icon')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
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
                    <form onSubmit={(e) => handleSubmit(e, 'home', 'differentiators')} id="home-differentiators-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('home', 'differentiators', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Why Choose Us" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 1 Title</label>
                          <input type="text" name="feature1Title" defaultValue={getFieldValue('home', 'differentiators', 'feature1Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="German Engineering" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 1 Description</label>
                          <textarea name="feature1Desc" defaultValue={getFieldValue('home', 'differentiators', 'feature1Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 1 Image URL</label>
                          <input type="text" name="feature1Image" defaultValue={getFieldValue('home', 'differentiators', 'feature1Image')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/feature1.jpg" />
                          <div className="mt-2">
                            <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'feature1Image')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 2 Title</label>
                          <input type="text" name="feature2Title" defaultValue={getFieldValue('home', 'differentiators', 'feature2Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Proven Technology" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 2 Description</label>
                          <textarea name="feature2Desc" defaultValue={getFieldValue('home', 'differentiators', 'feature2Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 2 Image URL</label>
                          <input type="text" name="feature2Image" defaultValue={getFieldValue('home', 'differentiators', 'feature2Image')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/feature2.jpg" />
                          <div className="mt-2">
                            <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'feature2Image')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 3 Title</label>
                          <input type="text" name="feature3Title" defaultValue={getFieldValue('home', 'differentiators', 'feature3Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Local Support" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 3 Description</label>
                          <textarea name="feature3Desc" defaultValue={getFieldValue('home', 'differentiators', 'feature3Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 3 Image URL</label>
                          <input type="text" name="feature3Image" defaultValue={getFieldValue('home', 'differentiators', 'feature3Image')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/feature3.jpg" />
                          <div className="mt-2">
                            <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'feature3Image')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
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
                    <form onSubmit={(e) => handleSubmit(e, 'home', 'header')} id="home-header-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name/Logo Text</label>
                          <input type="text" name="companyName" defaultValue={getFieldValue('home', 'header', 'companyName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="VenWind Refex" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image</label>
                          <div className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1">Upload logo from local:</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Or enter image URL:</label>
                            <input type="text" name="logoUrl" defaultValue={getFieldValue('home', 'header', 'logoUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/logo.png" />
                          </div>
                          {getFieldValue('home', 'header', 'logoUrl') && (
                            <div className="mt-2">
                              <img src={getFieldValue('home', 'header', 'logoUrl')} alt="Logo preview" className="h-16 w-auto object-contain border border-gray-200 rounded-lg p-2" />
                            </div>
                          )}
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
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
                    <form onSubmit={(e) => handleSubmit(e, 'home', 'footer')} id="home-footer-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Footer Logo URL</label>
                          <input type="text" name="logoUrl" defaultValue={getFieldValue('home', 'footer', 'logoUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/footer-logo.png" />
                          <div className="mt-2">
                            <label className="block text-sm text-gray-600 mb-1">Or upload logo:</label>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                          <textarea name="description" defaultValue={getFieldValue('home', 'footer', 'description')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Leading manufacturer of wind turbines..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input type="email" name="email" defaultValue={getFieldValue('home', 'footer', 'email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="info@company.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input type="text" name="phone" defaultValue={getFieldValue('home', 'footer', 'phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="+91 44 - 3504 0050" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <input type="text" name="address" defaultValue={getFieldValue('home', 'footer', 'address')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="123 Wind Energy St, City" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
                          <input type="text" name="copyright" defaultValue={getFieldValue('home', 'footer', 'copyright')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="© 2025 Company Name. All rights reserved." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ABOUT PAGE */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {['hero', 'introduction', 'vision', 'partnership'].map(section => (
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

                {activeSection === 'hero' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About Hero Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'about', 'hero')} id="about-hero-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('about', 'hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="About Us" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea name="subtitle" defaultValue={getFieldValue('about', 'hero', 'subtitle')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Learn about our journey..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Background Image Prompt</label>
                          <textarea name="bgImage" defaultValue={getFieldValue('about', 'hero', 'bgImage')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Describe the background image..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'introduction' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'about', 'introduction')} id="about-intro-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('about', 'introduction', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Who We Are" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <textarea name="content" defaultValue={getFieldValue('about', 'introduction', 'content')} rows={5} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Company introduction..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'vision' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Vision & Mission</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'about', 'vision')} id="about-vision-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Vision Title</label>
                          <input type="text" name="visionTitle" defaultValue={getFieldValue('about', 'vision', 'visionTitle')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Vision" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Vision Content</label>
                          <textarea name="visionContent" defaultValue={getFieldValue('about', 'vision', 'visionContent')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Vision statement..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mission Title</label>
                          <input type="text" name="missionTitle" defaultValue={getFieldValue('about', 'vision', 'missionTitle')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Mission" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mission Content</label>
                          <textarea name="missionContent" defaultValue={getFieldValue('about', 'vision', 'missionContent')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Mission statement..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'partnership' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Partnership Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'about', 'partnership')} id="about-partnership-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('about', 'partnership', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Partnership" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Partner Name</label>
                          <input type="text" name="partnerName" defaultValue={getFieldValue('about', 'partnership', 'partnerName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Vensys Energy AG" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Description</label>
                          <textarea name="description" defaultValue={getFieldValue('about', 'partnership', 'description')} rows={4} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Partnership details..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTS PAGE */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {['hero', 'intro', 'features', 'specifications', 'gallery', 'technical-benefits', 'brochure'].map(section => (
                      <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeSection === section
                            ? 'bg-[#8DC63F] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {activeSection === 'hero' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Products Hero</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'products', 'hero')} id="products-hero-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('products', 'hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Products" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea name="subtitle" defaultValue={getFieldValue('products', 'hero', 'subtitle')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Discover our wind turbine solutions..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'intro' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Introduction</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'products', 'intro')} id="products-intro-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                          <input type="text" name="productName" defaultValue={getFieldValue('products', 'intro', 'productName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Vensys 3.0 MW" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea name="description" defaultValue={getFieldValue('products', 'intro', 'description')} rows={4} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Product description..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'features' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Features</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'products', 'features')} id="products-features-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('products', 'features', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Key Features" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 1</label>
                          <input type="text" name="feature1" defaultValue={getFieldValue('products', 'features', 'feature1')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Gearless Technology" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 2</label>
                          <input type="text" name="feature2" defaultValue={getFieldValue('products', 'features', 'feature2')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="High Efficiency" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 3</label>
                          <input type="text" name="feature3" defaultValue={getFieldValue('products', 'features', 'feature3')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Low Maintenance" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feature 4</label>
                          <input type="text" name="feature4" defaultValue={getFieldValue('products', 'features', 'feature4')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Smart Control" />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'specifications' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'products', 'specifications')} id="products-specs-form">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rated Power</label>
                            <input type="text" name="ratedPower" defaultValue={getFieldValue('products', 'specifications', 'ratedPower')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="3.0 MW" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rotor Diameter</label>
                            <input type="text" name="rotorDiameter" defaultValue={getFieldValue('products', 'specifications', 'rotorDiameter')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="126 m" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hub Height</label>
                            <input type="text" name="hubHeight" defaultValue={getFieldValue('products', 'specifications', 'hubHeight')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="120 m" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cut-in Speed</label>
                            <input type="text" name="cutInSpeed" defaultValue={getFieldValue('products', 'specifications', 'cutInSpeed')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="3 m/s" />
                          </div>
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'gallery' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Gallery</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'products', 'gallery')} id="products-gallery-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image 1 Prompt</label>
                          <textarea name="image1" defaultValue={getFieldValue('products', 'gallery', 'image1')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Describe image 1..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image 2 Prompt</label>
                          <textarea name="image2" defaultValue={getFieldValue('products', 'gallery', 'image2')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Describe image 2..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image 3 Prompt</label>
                          <textarea name="image3" defaultValue={getFieldValue('products', 'gallery', 'image3')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Describe image 3..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'technical-benefits' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Benefits</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'products', 'technical-benefits')} id="products-technical-benefits-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('products', 'technical-benefits', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Technical Benefits" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 1 Title</label>
                          <input type="text" name="benefit1Title" defaultValue={getFieldValue('products', 'technical-benefits', 'benefit1Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Benefit title..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 1 Description</label>
                          <textarea name="benefit1Desc" defaultValue={getFieldValue('products', 'technical-benefits', 'benefit1Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'brochure' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Brochure Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'products', 'brochure')} id="products-brochure-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('products', 'brochure', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Download Brochure" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea name="description" defaultValue={getFieldValue('products', 'brochure', 'description')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Get detailed information..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Brochure PDF URL</label>
                          <input type="text" name="pdfUrl" defaultValue={getFieldValue('products', 'brochure', 'pdfUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/brochure.pdf" />
                          <div className="mt-2">
                            <label className="block text-sm text-gray-600 mb-1">Or upload PDF file:</label>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              const uploadUrl = API_BASE_URL ? `${API_BASE_URL}/api/upload/file` : '/api/upload/file';
                              fetch(uploadUrl, {
                                method: 'POST',
                                body: formData,
                              }).then(res => res.json()).then(result => {
                                if (result.success && result.fileUrl) {
                                  const fullUrl = API_BASE_URL ? `${API_BASE_URL}${result.fileUrl}` : result.fileUrl;
                                  const input = document.querySelector('input[name="pdfUrl"]') as HTMLInputElement;
                                  if (input) input.value = fullUrl;
                                  alert('File uploaded successfully!');
                                }
                              });
                            }} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TECHNOLOGY PAGE */}
            {activeTab === 'technology' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {['hero', 'intro', 'advantages', 'comparison', 'innovation', 'benefits', 'technical-advantages'].map(section => (
                      <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          activeSection === section
                            ? 'bg-[#8DC63F] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {activeSection === 'hero' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technology Hero</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'technology', 'hero')} id="technology-hero-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('technology', 'hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Technology" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea name="subtitle" defaultValue={getFieldValue('technology', 'hero', 'subtitle')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Innovation in wind energy..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'intro' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technology Introduction</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'technology', 'intro')} id="technology-intro-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('technology', 'intro', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Gearless Technology" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <textarea name="content" defaultValue={getFieldValue('technology', 'intro', 'content')} rows={5} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Technology description..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'advantages' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Advantages</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'technology', 'advantages')} id="technology-advantages-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Advantage 1 Title</label>
                          <input type="text" name="adv1Title" defaultValue={getFieldValue('technology', 'advantages', 'adv1Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Higher Efficiency" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Advantage 1 Description</label>
                          <textarea name="adv1Desc" defaultValue={getFieldValue('technology', 'advantages', 'adv1Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Advantage 2 Title</label>
                          <input type="text" name="adv2Title" defaultValue={getFieldValue('technology', 'advantages', 'adv2Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Lower Maintenance" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Advantage 2 Description</label>
                          <textarea name="adv2Desc" defaultValue={getFieldValue('technology', 'advantages', 'adv2Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Advantage 3 Title</label>
                          <input type="text" name="adv3Title" defaultValue={getFieldValue('technology', 'advantages', 'adv3Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Longer Lifespan" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Advantage 3 Description</label>
                          <textarea name="adv3Desc" defaultValue={getFieldValue('technology', 'advantages', 'adv3Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Description..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'comparison' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technology Comparison</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'technology', 'comparison')} id="technology-comparison-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('technology', 'comparison', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Gearless vs Traditional" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Comparison Content</label>
                          <textarea name="content" defaultValue={getFieldValue('technology', 'comparison', 'content')} rows={5} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Comparison details..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'innovation' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Innovation Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'technology', 'innovation')} id="technology-innovation-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('technology', 'innovation', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Innovation" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <textarea name="content" defaultValue={getFieldValue('technology', 'innovation', 'content')} rows={4} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Innovation details..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'benefits' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'technology', 'benefits')} id="technology-benefits-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('technology', 'benefits', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Benefits" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 1</label>
                          <input type="text" name="benefit1" defaultValue={getFieldValue('technology', 'benefits', 'benefit1')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Benefit..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 2</label>
                          <input type="text" name="benefit2" defaultValue={getFieldValue('technology', 'benefits', 'benefit2')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Benefit..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'technical-advantages' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Advantages</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'technology', 'technical-advantages')} id="technology-technical-advantages-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('technology', 'technical-advantages', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Technical Advantages" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <textarea name="content" defaultValue={getFieldValue('technology', 'technical-advantages', 'content')} rows={4} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Technical advantages..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* SUSTAINABILITY PAGE */}
            {activeTab === 'sustainability' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {['hero', 'commitment', 'goals'].map(section => (
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

                {activeSection === 'hero' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Sustainability Hero</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'sustainability', 'hero')} id="sustainability-hero-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('sustainability', 'hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Sustainability" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea name="subtitle" defaultValue={getFieldValue('sustainability', 'hero', 'subtitle')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our commitment to the environment..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'commitment' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Our Commitment</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'sustainability', 'commitment')} id="sustainability-commitment-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('sustainability', 'commitment', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Environmental Commitment" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <textarea name="content" defaultValue={getFieldValue('sustainability', 'commitment', 'content')} rows={5} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Commitment details..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'goals' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Future Goals</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'sustainability', 'goals')} id="sustainability-goals-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Goal 1</label>
                          <input type="text" name="goal1" defaultValue={getFieldValue('sustainability', 'goals', 'goal1')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Carbon Neutral by 2030" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Goal 2</label>
                          <input type="text" name="goal2" defaultValue={getFieldValue('sustainability', 'goals', 'goal2')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="100% Renewable Energy" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Goal 3</label>
                          <input type="text" name="goal3" defaultValue={getFieldValue('sustainability', 'goals', 'goal3')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Zero Waste Manufacturing" />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* CAREERS PAGE */}
            {activeTab === 'careers' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {['hero', 'positions', 'benefits', 'application', 'map'].map(section => (
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

                {activeSection === 'hero' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Careers Hero</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'careers', 'hero')} id="careers-hero-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('careers', 'hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Join Our Team" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea name="subtitle" defaultValue={getFieldValue('careers', 'hero', 'subtitle')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Build your career with us..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'positions' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Open Positions</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'careers', 'positions')} id="careers-positions-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position 1 Title</label>
                          <input type="text" name="pos1Title" defaultValue={getFieldValue('careers', 'positions', 'pos1Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Senior Engineer" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position 1 Description</label>
                          <textarea name="pos1Desc" defaultValue={getFieldValue('careers', 'positions', 'pos1Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Job description..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position 2 Title</label>
                          <input type="text" name="pos2Title" defaultValue={getFieldValue('careers', 'positions', 'pos2Title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Project Manager" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position 2 Description</label>
                          <textarea name="pos2Desc" defaultValue={getFieldValue('careers', 'positions', 'pos2Desc')} rows={2} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Job description..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'benefits' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Employee Benefits</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'careers', 'benefits')} id="careers-benefits-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 1</label>
                          <input type="text" name="benefit1" defaultValue={getFieldValue('careers', 'benefits', 'benefit1')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Competitive Salary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 2</label>
                          <input type="text" name="benefit2" defaultValue={getFieldValue('careers', 'benefits', 'benefit2')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Health Insurance" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 3</label>
                          <input type="text" name="benefit3" defaultValue={getFieldValue('careers', 'benefits', 'benefit3')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Professional Development" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit 4</label>
                          <input type="text" name="benefit4" defaultValue={getFieldValue('careers', 'benefits', 'benefit4')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Work-Life Balance" />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'application' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Application Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'careers', 'application')} id="careers-application-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('careers', 'application', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Apply Now" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea name="description" defaultValue={getFieldValue('careers', 'application', 'description')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Submit your application..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'map' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Map Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'careers', 'map')} id="careers-map-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                          <input type="text" name="locationName" defaultValue={getFieldValue('careers', 'map', 'locationName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Office" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed URL</label>
                          <input type="text" name="mapUrl" defaultValue={getFieldValue('careers', 'map', 'mapUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://www.google.com/maps/embed?..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* CONTACT PAGE */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {['hero', 'info', 'hours', 'form', 'map'].map(section => (
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

                {activeSection === 'hero' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Hero</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'contact', 'hero')} id="contact-hero-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('contact', 'hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Contact Us" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea name="subtitle" defaultValue={getFieldValue('contact', 'hero', 'subtitle')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Get in touch with us..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'info' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'contact', 'info')} id="contact-info-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <input type="text" name="address" defaultValue={getFieldValue('contact', 'info', 'address')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="123 Wind Energy St, City" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input type="text" name="phone" defaultValue={getFieldValue('contact', 'info', 'phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="+91 44 - 3504 0050" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input type="email" name="email" defaultValue={getFieldValue('contact', 'info', 'email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="info@company.com" />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'hours' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'contact', 'hours')} id="contact-hours-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Weekdays</label>
                          <input type="text" name="weekdays" defaultValue={getFieldValue('contact', 'hours', 'weekdays')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Monday - Friday: 9:00 AM - 6:00 PM" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Weekend</label>
                          <input type="text" name="weekend" defaultValue={getFieldValue('contact', 'hours', 'weekend')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Saturday - Sunday: Closed" />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'form' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Form Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'contact', 'form')} id="contact-form-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                          <input type="text" name="title" defaultValue={getFieldValue('contact', 'form', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Send us a message" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea name="description" defaultValue={getFieldValue('contact', 'form', 'description')} rows={3} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="We'd love to hear from you..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeSection === 'map' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Map Section</h2>
                    <form onSubmit={(e) => handleSubmit(e, 'contact', 'map')} id="contact-map-form">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                          <input type="text" name="locationName" defaultValue={getFieldValue('contact', 'map', 'locationName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Location" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed URL</label>
                          <input type="text" name="mapUrl" defaultValue={getFieldValue('contact', 'map', 'mapUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://www.google.com/maps/embed?..." />
                        </div>
                        <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
                          <i className="ri-save-line mr-2"></i>Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <i className="ri-eye-line mr-2"></i>Quick Preview
              </h3>
              <div className="space-y-4">
                <div className="bg-[#8DC63F]/10 rounded-lg p-4 border border-[#8DC63F]/30">
                  <p className="text-sm text-gray-700 mb-2">Current Page:</p>
                  <p className="font-semibold text-gray-900">{tabs.find(t => t.id === activeTab)?.label}</p>
                </div>
                <div className="bg-[#8DC63F]/10 rounded-lg p-4 border border-[#8DC63F]/30">
                  <p className="text-sm text-gray-700 mb-2">Current Section:</p>
                  <p className="font-semibold text-gray-900">{activeSection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                </div>
                <div className="bg-[#8DC63F]/10 rounded-lg p-4 border border-[#8DC63F]/30">
                  <p className="text-sm text-gray-700 mb-2">
                    <i className="ri-information-line mr-1"></i>Tip:
                  </p>
                  <p className="text-xs text-gray-600">Changes are saved automatically and will appear on your live site immediately.</p>
                </div>
                <a
                  href={`/${activeTab === 'home' ? '' : activeTab}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-gray-900 text-white text-center rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  <i className="ri-external-link-line mr-2"></i>Preview Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
