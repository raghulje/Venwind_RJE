/**
 * CMS Data Management Utility
 * 
 * Production-ready CMS utilities with proper cache management:
 * - Primary: Database (via API) - source of truth
 * - Secondary: localStorage (cache with updatedAt comparison)
 * - Prevents stale cache issues
 * - Handles race conditions
 * - Type-safe with TypeScript
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface CMSContent {
  data: any;
  updatedAt: string;
}

export interface CMSResponse {
  success: boolean;
  data?: any;
  updatedAt?: string;
  message?: string;
}

export interface CMSStorageItem {
  data: any;
  updatedAt: string;
}

/**
 * Get CMS content for a specific page and section
 * 
 * Strategy:
 * 1. Try API first (source of truth)
 * 2. If API fails/404, check localStorage cache
 * 3. Compare updatedAt timestamps to ensure cache freshness
 * 4. Return defaultValue if no data exists
 * 
 * @param page - Page identifier (e.g., 'about', 'home')
 * @param section - Section identifier (e.g., 'hero', 'partnership')
 * @param options - Configuration options
 * @returns CMS content with data and updatedAt timestamp
 */
export async function getCMSData(
  page: string,
  section: string,
  options: {
    skipCache?: boolean;
    defaultValue?: any;
  } = {}
): Promise<CMSContent> {
  const { skipCache = false, defaultValue = null } = options;
  const storageKey = `cms_${page}_${section}`;

  // Try API first (source of truth)
  if (!skipCache) {
    try {
      // Use relative path if API_BASE_URL is empty (works with Vite proxy)
      const apiUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/admin/cms/page/${page}/section/${section}`
        : `/api/admin/cms/page/${page}/section/${section}`;
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const result: CMSResponse = await response.json();
        
        if (result.success && result.data && Object.keys(result.data).length > 0) {
          const apiContent: CMSContent = {
            data: result.data,
            updatedAt: result.updatedAt || new Date().toISOString(),
          };

          // Update localStorage cache with fresh data from API
          const storageItem: CMSStorageItem = {
            data: apiContent.data,
            updatedAt: apiContent.updatedAt,
          };
          localStorage.setItem(storageKey, JSON.stringify(storageItem));

          return apiContent;
        }
      } else if (response.status === 404) {
        // 404 means no data in DB, continue to localStorage check
        console.log(`No CMS data in database for ${page}/${section}`);
      }
    } catch (error) {
      console.error(`Error fetching CMS data from API for ${page}/${section}:`, error);
      // Fall through to localStorage fallback
    }
  }

  // Fallback to localStorage cache
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed: CMSStorageItem = JSON.parse(cached);
      if (parsed.data && Object.keys(parsed.data).length > 0) {
        return {
          data: parsed.data,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    console.error(`Error reading localStorage for ${page}/${section}:`, error);
  }

  // Return default value if provided, otherwise empty object
  return {
    data: defaultValue !== null && defaultValue !== undefined ? defaultValue : {},
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Save CMS content to backend and update localStorage cache
 * 
 * Strategy:
 * 1. POST to API (saves to database)
 * 2. API returns saved data with updatedAt
 * 3. Update localStorage cache with fresh data
 * 4. Dispatch cmsUpdate event for real-time updates
 * 
 * @param page - Page identifier
 * @param section - Section identifier
 * @param data - Data to save
 * @returns Saved content with updatedAt timestamp
 * @throws Error if save fails
 */
export async function saveCMSData(
  page: string,
  section: string,
  data: any
): Promise<CMSContent> {
  const storageKey = `cms_${page}_${section}`;

  try {
    // Use relative path if API_BASE_URL is empty (works with Vite proxy)
    const apiUrl = API_BASE_URL 
      ? `${API_BASE_URL}/api/admin/cms/page/${page}/section/${section}`
      : `/api/admin/cms/page/${page}/section/${section}`;

    console.log('Saving CMS data to:', apiUrl, 'Data:', data);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch((fetchError) => {
      // Handle network errors (CORS, connection refused, etc.)
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}. Please ensure the server is running and accessible.`);
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to save CMS data: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // Use default error message
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      }
      throw new Error(errorMessage);
    }

    const result: CMSResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to save CMS data');
    }

    const savedContent: CMSContent = {
      data: result.data || data,
      updatedAt: result.updatedAt || new Date().toISOString(),
    };

    // Update localStorage cache with fresh data from API
    const storageItem: CMSStorageItem = {
      data: savedContent.data,
      updatedAt: savedContent.updatedAt,
    };
    localStorage.setItem(storageKey, JSON.stringify(storageItem));

    // Dispatch event for real-time updates across components
    window.dispatchEvent(
      new CustomEvent('cmsUpdate', {
        detail: { 
          page, 
          section, 
          data: savedContent.data, 
          updatedAt: savedContent.updatedAt 
        },
      })
    );

    return savedContent;
  } catch (error: any) {
    console.error(`Error saving CMS data for ${page}/${section}:`, error);
    
    // Check if it's a network error
    const isNetworkError = error.message?.includes('Network error') || 
                          error.message?.includes('Failed to fetch') ||
                          error.message?.includes('fetch');
    
    // Fallback: Save to localStorage if API fails
    const fallbackContent: CMSContent = {
      data: data,
      updatedAt: new Date().toISOString(),
    };
    
    const storageItem: CMSStorageItem = {
      data: fallbackContent.data,
      updatedAt: fallbackContent.updatedAt,
    };
    localStorage.setItem(storageKey, JSON.stringify(storageItem));
    
    // Still dispatch event for local updates
    window.dispatchEvent(
      new CustomEvent('cmsUpdate', {
        detail: { 
          page, 
          section, 
          data: fallbackContent.data, 
          updatedAt: fallbackContent.updatedAt 
        },
      })
    );
    
    // Provide helpful error message
    if (isNetworkError) {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on port 8080. Your changes have been saved to local storage.');
    }
    
    // Re-throw the error so the UI can show it
    throw new Error(error.message || 'Failed to save CMS data. Saved to local storage as backup.');
  }
}

/**
 * Check if cached data is stale compared to API data
 * 
 * @param page - Page identifier
 * @param section - Section identifier
 * @param apiUpdatedAt - UpdatedAt timestamp from API
 * @returns true if cache is stale or missing
 */
export function isCacheStale(
  page: string,
  section: string,
  apiUpdatedAt: string
): boolean {
  const storageKey = `cms_${page}_${section}`;
  
  try {
    const cached = localStorage.getItem(storageKey);
    if (!cached) return true;

    const parsed: CMSStorageItem = JSON.parse(cached);
    if (!parsed.updatedAt) return true;

    // Compare timestamps - cache is stale if API is newer
    const cacheTime = new Date(parsed.updatedAt).getTime();
    const apiTime = new Date(apiUpdatedAt).getTime();

    return apiTime > cacheTime;
  } catch {
    return true;
  }
}

/**
 * Clear CMS cache for a specific page/section or all CMS data
 * 
 * @param page - Optional page identifier
 * @param section - Optional section identifier
 */
export function clearCMSCache(page?: string, section?: string): void {
  if (page && section) {
    localStorage.removeItem(`cms_${page}_${section}`);
  } else if (page) {
    // Clear all sections for a page
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(`cms_${page}_`)) {
        localStorage.removeItem(key);
      }
    });
  } else {
    // Clear all CMS data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('cms_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Normalize image URL to ensure it's a valid absolute URL
 * Handles both relative paths (starting with /) and absolute URLs
 * 
 * @param imageUrl - Image URL (can be relative or absolute)
 * @returns Normalized absolute URL
 */
export function normalizeImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return '';
  
  // If it's already an absolute URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path (starts with /), prepend API_BASE_URL
  if (imageUrl.startsWith('/')) {
    // Remove trailing slash from API_BASE_URL if present
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${imageUrl}`;
  }
  
  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // For any other case, try to construct a full URL
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/${imageUrl}`;
}