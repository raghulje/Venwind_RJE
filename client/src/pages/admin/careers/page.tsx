import { useState } from 'react';
import AdminLayout, { API_BASE_URL } from '../components/AdminLayout';
import { useCMSData } from '../hooks/useCMSData';

export default function AdminCareersPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const { getFieldValue, loading } = useCMSData('careers');

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
    
    if (section === 'application') {
      dataObj.title = (formData.get('title') as string)?.trim() || '';
      dataObj.subtitle = (formData.get('subtitle') as string)?.trim() || '';
      dataObj.imageUrl = (formData.get('imageUrl') as string)?.trim() || '';
      dataObj.formTitle = (formData.get('formTitle') as string)?.trim() || '';
    } else if (section === 'map') {
      dataObj.title = (formData.get('title') as string)?.trim() || '';
      dataObj.description = (formData.get('description') as string)?.trim() || '';
      dataObj.mapUrl = (formData.get('mapUrl') as string)?.trim() || '';
      dataObj.address = (formData.get('address') as string)?.trim() || '';
      dataObj.phone = (formData.get('phone') as string)?.trim() || '';
      dataObj.email = (formData.get('email') as string)?.trim() || '';
    } else if (section === 'email-config') {
      dataObj.senderEmail = (formData.get('senderEmail') as string)?.trim() || '';
      dataObj.receiverEmail = (formData.get('receiverEmail') as string)?.trim() || '';
    } else {
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
      await saveCMSData('careers', section, dataObj);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageName="Careers" pagePath="/careers">
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#8DC63F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  const sections = ['hero', 'application', 'map', 'email-config'];

  return (
    <AdminLayout pageName="Careers" pagePath="/careers">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('hero', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Careers" />
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

        {/* Application Section */}
        {activeSection === 'application' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'application')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Side Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('application', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Make a Difference" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Side Subtitle</label>
                  <input type="text" name="subtitle" defaultValue={getFieldValue('application', 'subtitle')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Shape your future with Venwind Refex" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Side Background Image URL</label>
                  <input type="text" name="imageUrl" defaultValue={getFieldValue('application', 'imageUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://example.com/image.jpg" />
                  <div className="mt-2">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC63F] file:text-white hover:file:bg-[#7AB62F] file:cursor-pointer" />
                  </div>
                  {getFieldValue('application', 'imageUrl') && (
                    <div className="mt-2">
                      <img src={getFieldValue('application', 'imageUrl')} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
                  <input type="text" name="formTitle" defaultValue={getFieldValue('application', 'formTitle')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Apply Now" />
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Map Section */}
        {activeSection === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Map Section</h2>
            <form onSubmit={(e) => handleSubmit(e, 'map')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input type="text" name="title" defaultValue={getFieldValue('map', 'title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="Visit Our Office" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" defaultValue={getFieldValue('map', 'description')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="6th Floor, Refex Towers, Sterling Road Signal..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Embed URL</label>
                  <input type="text" name="mapUrl" defaultValue={getFieldValue('map', 'mapUrl')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="https://www.google.com/maps/embed?pb=..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea name="address" defaultValue={getFieldValue('map', 'address')} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="6th Floor, Refex Towers, Nungambakkam, Chennai – 600034" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" name="phone" defaultValue={getFieldValue('map', 'phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="+91 44 - 6990 8410" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" name="email" defaultValue={getFieldValue('map', 'email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" placeholder="contact@venwindrefex.com" />
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors">
                  <i className="ri-save-line mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Email Configuration Section */}
        {activeSection === 'email-config' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Email Configuration</h2>
            <form onSubmit={(e) => handleSubmit(e, 'email-config')}>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Configure where career application emails should be sent. 
                    The "Receiver Email (To)" field is required - applications will be sent to this email address.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Email (From) <span className="text-gray-500 text-xs">(Optional - for display name/reply-to)</span>
                  </label>
                  <input 
                    type="email" 
                    name="senderEmail" 
                    defaultValue={getFieldValue('email-config', 'senderEmail') || ''} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" 
                    placeholder="crm@refex.co.in" 
                  />
                  <p className="text-xs text-gray-500 mt-1">This email will be used as the reply-to address. The actual sender will be your SMTP_USER from server configuration.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receiver Email (To) <span className="text-red-500">*</span> <span className="text-gray-500 text-xs">(Required)</span>
                  </label>
                  <input 
                    type="email" 
                    name="receiverEmail" 
                    defaultValue={getFieldValue('email-config', 'receiverEmail') || ''} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent" 
                    placeholder="hr@venwindrefex.com" 
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">All career application emails will be sent to this email address. This field is required.</p>
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#8DC63F] text-white rounded-lg hover:bg-[#7AB62F] transition-colors whitespace-nowrap">
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
