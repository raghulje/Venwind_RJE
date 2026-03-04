import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageName: string;
  pagePath: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export default function AdminLayout({ children, pageName, pagePath }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [, setUploadingImage] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Check if investor user is trying to access non-investor pages
    const userType = localStorage.getItem('userType') || 'Admin';
    if (userType === 'Investors') {
      // Only allow access to investor relations page
      if (!pagePath.includes('investor-relations')) {
        navigate('/admin/investor-relations');
        return;
      }
    }
  }, [navigate, pagePath]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management System</h1>
              <p className="text-sm text-gray-600 mt-1">Edit {pageName} page content and images</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/admin" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap">
                <i className="ri-arrow-left-line mr-2"></i>Back to Admin
              </a>
              <a href={pagePath} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
                <i className="ri-eye-line mr-2"></i>View Page
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
        {children}
      </div>
    </div>
  );
}

// Helper function to delete uploaded file
export const deleteUploadedFile = async (fileUrl: string): Promise<boolean> => {
  try {
    console.log('Attempting to delete file:', fileUrl);
    
    // Extract category and filename from URL
    // URL format: /uploads/images/image-123.jpg or http://domain/uploads/images/image-123.jpg
    // Handle both relative and absolute URLs
    let urlToMatch = fileUrl;
    
    // If URL contains API_BASE_URL, remove it to get the relative path
    if (API_BASE_URL && fileUrl.includes(API_BASE_URL)) {
      // Remove API_BASE_URL, but be careful with trailing slashes
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      urlToMatch = fileUrl.replace(baseUrl, '');
      // If it doesn't start with /, add it
      if (!urlToMatch.startsWith('/')) {
        urlToMatch = '/' + urlToMatch;
      }
    }
    
    // Also handle URLs that might have protocol and domain (but not API_BASE_URL)
    if (urlToMatch.startsWith('http://') || urlToMatch.startsWith('https://')) {
      try {
        const urlObj = new URL(urlToMatch);
        urlToMatch = urlObj.pathname;
      } catch (e) {
        // If URL parsing fails, try to extract pathname manually
        const pathMatch = urlToMatch.match(/\/uploads\/.+/);
        if (pathMatch) {
          urlToMatch = pathMatch[0];
        }
      }
    }
    
    // Remove query parameters if any
    urlToMatch = urlToMatch.split('?')[0];
    
    const urlMatch = urlToMatch.match(/\/uploads\/(images|documents|resumes|photos)\/(.+)$/);
    if (!urlMatch) {
      console.error('Invalid file URL format:', fileUrl, 'Parsed as:', urlToMatch);
      alert('Invalid file URL format. Cannot delete this file.');
      return false;
    }

    const [, category, filename] = urlMatch;
    // Clean up the filename - remove any trailing slashes or query parameters
    let cleanFilename = filename.split('?')[0].split('#')[0].trim();
    
    // Decode the filename in case it's URL encoded
    let decodedFilename = cleanFilename;
    try {
      decodedFilename = decodeURIComponent(cleanFilename);
      // Try decoding again in case of double encoding
      decodedFilename = decodeURIComponent(decodedFilename);
    } catch (e) {
      // If decoding fails, use the original
      decodedFilename = cleanFilename;
    }
    
    // Remove any path components that might have been included
    decodedFilename = decodedFilename.split('/').pop() || decodedFilename;
    
    console.log('Extracted category:', category, 'original filename:', cleanFilename, 'decoded filename:', decodedFilename);
    
    const deleteUrl = API_BASE_URL 
      ? `${API_BASE_URL}/api/upload/${category}/${encodeURIComponent(decodedFilename)}`
      : `/api/upload/${category}/${encodeURIComponent(decodedFilename)}`;

    console.log('Delete URL:', deleteUrl);
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Delete response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Delete response:', result);
      if (result.success) {
        return true;
      } else {
        alert('Delete failed: ' + (result.error || 'Unknown error'));
        return false;
      }
    } else {
      const errorText = await response.text();
      console.error('Delete failed:', response.status, errorText);
      let errorMessage = 'Failed to delete file';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      alert(errorMessage);
      return false;
    }
  } catch (error: any) {
    console.error('Error deleting file:', error);
    alert('Error deleting file: ' + (error.message || 'Unknown error'));
    return false;
  }
};

// Export helper functions for use in child components
export { API_BASE_URL };

