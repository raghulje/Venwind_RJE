import { useState } from 'react';
import AdminLayout, { API_BASE_URL } from '../components/AdminLayout';
import { useCMSData } from '../hooks/useCMSData';

export default function AdminSustainabilityPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const { getFieldValue, loading } = useCMSData('sustainability');

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
    
    // Special handling for commitment section
    if (section === 'commitment') {
      const items: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const title = (formData.get(`commitment_${i}_title`) as string)?.trim();
        const description = (formData.get(`commitment_${i}_description`) as string)?.trim();
        const image = (formData.get(`commitment_${i}_image`) as string)?.trim();
        
        if (title || description || image) {
          items.push({ 
            title: title || '', 
            description: description || '',
            image: image || '',
          });
        }
      }
      dataObj.items = items;
      dataObj.title = (formData.get('title') as string)?.trim() || '';
    } else if (section === 'future-goals') {
      // Explicit handling for future-goals section
      const title = (formData.get('title') as string)?.trim();
      const description = (formData.get('description') as string)?.trim();
      const bgImageUrl = (formData.get('bgImageUrl') as string)?.trim();
      
      dataObj.title = title || '';
      dataObj.description = description || '';
      dataObj.bgImageUrl = bgImageUrl || '';
      
      console.log('Future Goals Data:', dataObj);
    } else {
      // For hero and other simple sections
      formData.forEach((value, key) => { 
        if (typeof value === 'string') {
          dataObj[key] = value.trim();
        } else {
          dataObj[key] = value;
        }
      });
    }
    
    try {
      const { saveCMSData } = await import('../../../utils/cms');
      await saveCMSData('sustainability', section, dataObj);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageName="Sustainability" pagePath="/sustainability">
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  const sections = ['hero', 'commitment', 'future-goals'];

  return (
    <AdminLayout pageName="Sustainability" pagePath="/sustainability">
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
            <form onSubmit={(e) => handleSubmit(e, 'hero')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Sustainability" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                  <input type="text" name="bgImageUrl" defaultValue={getFieldValue('hero', 'bgImageUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/hero-bg.jpg" />
                  <div className="mt-2">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bgImageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
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

        {/* Commitment Section */}
        {activeSection === 'commitment' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Commitment Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'commitment')}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('commitment', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Our Commitment" />
                </div>
                {[1, 2, 3].map((num) => {
                  const items = getFieldValue('commitment', 'items') || [];
                  const item = items[num - 1] || { title: '', description: '', image: '' };
                  return (
                    <div key={num} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Commitment {num}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input type="text" name={`commitment_${num}_title`} defaultValue={item.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Commitment title" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <textarea name={`commitment_${num}_description`} defaultValue={item.description} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="Commitment description" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                          <input type="text" name={`commitment_${num}_image`} defaultValue={item.image} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent text-sm" placeholder="https://example.com/image.jpg" />
                          <div className="mt-2">
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, `commitment_${num}_image`)} className="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                          </div>
                          {item.image && (
                            <div className="mt-2">
                              <img src={item.image} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                            </div>
                          )}
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

        {/* Future Goals Section */}
        {activeSection === 'future-goals' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Future Goals Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'future-goals')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('future-goals', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Future Goals" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" defaultValue={getFieldValue('future-goals', 'description')} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Scale up production to meet India's renewable targets and continue R&D investments for enhanced turbine efficiency." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                  <input type="text" name="bgImageUrl" defaultValue={getFieldValue('future-goals', 'bgImageUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/bg-image.jpg" />
                  <div className="mt-2">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bgImageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('future-goals', 'bgImageUrl') && (
                    <div className="mt-2">
                      <img src={getFieldValue('future-goals', 'bgImageUrl')} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
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
      </div>
    </AdminLayout>
  );
}

