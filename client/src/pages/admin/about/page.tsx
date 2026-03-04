import { useState } from 'react';
import AdminLayout, { API_BASE_URL } from '../components/AdminLayout';
import { useCMSData } from '../hooks/useCMSData';

export default function AdminAboutPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const { getFieldValue, loading } = useCMSData('about');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.imageUrl) {
          const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
          if (input) input.value = `${API_BASE_URL}${result.imageUrl}`;
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, section: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const dataObj: any = {};
    
    // Special handling for partnership section
    if (section === 'partnership') {
      // Default partnership content
      const defaultPartnerships = [
        {
          number: '01',
          text: 'Venwind holds an exclusive license with Vensys Energy AG, Germany, to manufacture 5.3 MW wind turbine based on permanent magnet generator with hybrid drive train technology.',
        },
        {
          number: '02',
          text: 'Over 120 GW of WTGs based on Vensys technology are operational worldwide across five continents.',
        },
        {
          number: '03',
          text: 'Vensys technology is proven in India with over 2.5 GW currently in operation.',
        },
        {
          number: '04',
          text: 'Vensys provides Venwind with ongoing support in technology, training, supervision, upgrades, and market development in India.',
        },
        {
          number: '05',
          text: 'Vensys pioneered permanent magnet generator technology for direct drive gearless and hybrid wind turbines, offering simple, low-maintenance designs for reliable wind energy yields across all locations.',
        },
      ];
      
      // Collect all partnership fields and convert to array
      const partnerships: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const number = (formData.get(`partnership_${i}_number`) as string)?.trim();
        const text = (formData.get(`partnership_${i}_text`) as string)?.trim();
        
        // Use custom value if provided, otherwise use default
        if (number || text) {
          partnerships.push({ 
            number: number || defaultPartnerships[i - 1]?.number || `0${i}`, 
            text: text || defaultPartnerships[i - 1]?.text || '' 
          });
        } else {
          // If both fields are empty, use default
          partnerships.push(defaultPartnerships[i - 1] || { number: `0${i}`, text: '' });
        }
      }
      dataObj.partnerships = partnerships;
      const title = (formData.get('title') as string)?.trim();
      dataObj.title = title || 'Partnership';
    } else {
      // Regular form data handling
      formData.forEach((value, key) => { 
        dataObj[key] = value;
      });
    }
    
    try {
      // Use the saveCMSData utility for proper cache management
      const { saveCMSData } = await import('../../../utils/cms');
      await saveCMSData('about', section, dataObj);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageName="About" pagePath="/about-us">
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageName="About" pagePath="/about-us">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {['hero', 'introduction', 'vision', 'partnership'].map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === section ? 'bg-[#8DC63F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <form onSubmit={(e) => handleSubmit(e, 'hero')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="About Us" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                  <input
                    type="text"
                    name="bgImageUrl"
                    defaultValue={getFieldValue('hero', 'bgImageUrl')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                    placeholder="https://example.com/hero-bg.jpg"
                  />
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'bgImageUrl')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                    />
                  </div>
                  {getFieldValue('hero', 'bgImageUrl') && (
                    <div className="mt-2">
                      <img src={getFieldValue('hero', 'bgImageUrl')} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
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

        {activeSection === 'introduction' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'introduction')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Label (Uppercase)</label>
                  <input type="text" name="label" defaultValue={getFieldValue('introduction', 'label')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Introduction" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('introduction', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Pioneering the Future of Renewable Energy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Paragraph</label>
                  <textarea name="paragraph1" defaultValue={getFieldValue('introduction', 'paragraph1')} rows={4} maxLength={1000} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="First paragraph content..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Second Paragraph</label>
                  <textarea name="paragraph2" defaultValue={getFieldValue('introduction', 'paragraph2')} rows={4} maxLength={1000} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Second paragraph content..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    defaultValue={getFieldValue('introduction', 'imageUrl')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                    placeholder="https://example.com/intro-image.jpg"
                  />
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'imageUrl')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                    />
                  </div>
                  {getFieldValue('introduction', 'imageUrl') && (
                    <div className="mt-2">
                      <img src={getFieldValue('introduction', 'imageUrl')} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overlay Text</label>
                  <input type="text" name="overlayText" defaultValue={getFieldValue('introduction', 'overlayText')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Driving Our Renewable Future" />
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'vision' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vision & Mission</h2>
            <form onSubmit={(e) => handleSubmit(e, 'vision')}>
              <div className="space-y-6">
                {/* Mission Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mission</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mission Image URL</label>
                      <input
                        type="text"
                        name="missionImageUrl"
                        defaultValue={getFieldValue('vision', 'missionImageUrl')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                        placeholder="https://example.com/mission-image.jpg"
                      />
                      <div className="mt-2">
                        <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'missionImageUrl')}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                        />
                      </div>
                      {getFieldValue('vision', 'missionImageUrl') && (
                        <div className="mt-2">
                          <img src={getFieldValue('vision', 'missionImageUrl')} alt="Mission Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mission Title</label>
                      <input type="text" name="missionTitle" defaultValue={getFieldValue('vision', 'missionTitle')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Mission" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mission Content</label>
                      <textarea name="missionContent" defaultValue={getFieldValue('vision', 'missionContent')} rows={4} maxLength={1000} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Mission statement..." />
                    </div>
                  </div>
                </div>

                {/* Vision Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Vision</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vision Title</label>
                      <input type="text" name="visionTitle" defaultValue={getFieldValue('vision', 'visionTitle')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Vision" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vision Content</label>
                      <textarea name="visionContent" defaultValue={getFieldValue('vision', 'visionContent')} rows={4} maxLength={1000} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Vision statement..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vision Image URL</label>
                      <input
                        type="text"
                        name="visionImageUrl"
                        defaultValue={getFieldValue('vision', 'visionImageUrl')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
                        placeholder="https://example.com/vision-image.jpg"
                      />
                      <div className="mt-2">
                        <label className="block text-sm text-gray-600 mb-1">Or upload image:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'visionImageUrl')}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer"
                        />
                      </div>
                      {getFieldValue('vision', 'visionImageUrl') && (
                        <div className="mt-2">
                          <img src={getFieldValue('vision', 'visionImageUrl')} alt="Vision Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                        </div>
                      )}
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

        {activeSection === 'partnership' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Partnership Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'partnership')}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('partnership', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Partnership" />
                </div>
                
                {/* Partnership Items - Individual Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Partnership Items (1-5)</label>
                  <p className="text-xs text-gray-500 mb-4">Leave fields empty to use default content. Only fill fields you want to change.</p>
                  {[1, 2, 3, 4, 5].map((num) => {
                    const partnerships = (() => {
                      try {
                        const value = getFieldValue('partnership', 'partnerships');
                        if (!value) return [];
                        return typeof value === 'string' ? JSON.parse(value) : (Array.isArray(value) ? value : []);
                      } catch {
                        return [];
                      }
                    })();
                    
                    // Default partnership content
                    const defaultPartnerships = [
                      {
                        number: '01',
                        text: 'Venwind holds an exclusive license with Vensys Energy AG, Germany, to manufacture 5.3 MW wind turbine based on permanent magnet generator with hybrid drive train technology.',
                      },
                      {
                        number: '02',
                        text: 'Over 120 GW of WTGs based on Vensys technology are operational worldwide across five continents.',
                      },
                      {
                        number: '03',
                        text: 'Vensys technology is proven in India with over 2.5 GW currently in operation.',
                      },
                      {
                        number: '04',
                        text: 'Vensys provides Venwind with ongoing support in technology, training, supervision, upgrades, and market development in India.',
                      },
                      {
                        number: '05',
                        text: 'Vensys pioneered permanent magnet generator technology for direct drive gearless and hybrid wind turbines, offering simple, low-maintenance designs for reliable wind energy yields across all locations.',
                      },
                    ];
                    
                    const item = partnerships[num - 1] || defaultPartnerships[num - 1] || { number: `0${num}`, text: '' };
                    
                    return (
                      <div key={num} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Partnership {num}</h3>
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Number</label>
                            <input
                              type="text"
                              name={`partnership_${num}_number`}
                              defaultValue={item.number || `0${num}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm"
                              placeholder={defaultPartnerships[num - 1]?.number || `0${num}`}
                            />
                          </div>
                          <div className="col-span-10">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                            <textarea
                              name={`partnership_${num}_text`}
                              defaultValue={item.text || ''}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm"
                              placeholder={defaultPartnerships[num - 1]?.text || `Enter partnership detail ${num}...`}
                            />
                          </div>
                        </div>
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
      </div>
    </AdminLayout>
  );
}

