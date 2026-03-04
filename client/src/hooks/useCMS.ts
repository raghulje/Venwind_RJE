import { useState, useEffect, useCallback, useRef } from 'react';
import { getCMSData, saveCMSData, CMSContent } from '../utils/cms';

interface UseCMSOptions {
  defaultValue?: any;
  autoFetch?: boolean;
  onUpdate?: (data: any) => void;
}

interface UseCMSReturn<T = any> {
  data: T;
  loading: boolean;
  error: Error | null;
  save: (newData: Partial<T>) => Promise<void>;
  refresh: () => Promise<void>;
  updatedAt: string | undefined;
}

/**
 * React hook for managing CMS data with automatic caching and real-time updates
 * 
 * Features:
 * - Automatic fetching on mount
 * - Real-time updates via cmsUpdate events
 * - Prevents race conditions with request deduplication
 * - Proper loading and error states
 * - Type-safe data handling
 */
export function useCMS<T = any>(
  page: string,
  section: string,
  options: UseCMSOptions = {}
): UseCMSReturn<T> {
  const { defaultValue = null, autoFetch = true, onUpdate } = options;
  
  // Initialize with defaultValue so content shows immediately
  const [data, setData] = useState<T>(defaultValue as T);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);
  
  // Track ongoing requests to prevent race conditions
  const fetchPromiseRef = useRef<Promise<CMSContent> | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (skipCache = false) => {
    // If a request is already in progress, wait for it
    if (fetchPromiseRef.current) {
      try {
        const result = await fetchPromiseRef.current;
        if (isMountedRef.current) {
          // Merge with defaults to ensure all fields are present
          const mergedData = defaultValue 
            ? { ...defaultValue, ...result.data } 
            : result.data;
          setData(mergedData as T);
          setUpdatedAt(result.updatedAt);
          setLoading(false);
          setError(null);
        }
        return;
      } catch (err) {
        // Continue with new request if previous failed
      }
    }

    // Start new request
    fetchPromiseRef.current = getCMSData(page, section, { skipCache, defaultValue });
    
    try {
      const result = await fetchPromiseRef.current;
      
      if (isMountedRef.current) {
        // Merge with defaults to ensure all fields are present
        const mergedData = defaultValue 
          ? { ...defaultValue, ...result.data } 
          : result.data;
        setData(mergedData as T);
        setUpdatedAt(result.updatedAt);
        setLoading(false);
        setError(null);
        onUpdate?.(mergedData);
      }
    } catch (err) {
      if (isMountedRef.current) {
        // On error, use defaultValue if available
        if (defaultValue) {
          setData(defaultValue as T);
        }
        setError(err instanceof Error ? err : new Error('Failed to fetch CMS data'));
        setLoading(false);
      }
    } finally {
      fetchPromiseRef.current = null;
    }
  }, [page, section, defaultValue, onUpdate]);

  const save = useCallback(async (newData: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedData = { ...data, ...newData };
      const result = await saveCMSData(page, section, updatedData);
      
      if (isMountedRef.current) {
        setData(result.data as T);
        setUpdatedAt(result.updatedAt);
        setLoading(false);
        onUpdate?.(result.data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to save CMS data'));
        setLoading(false);
      }
      throw err;
    }
  }, [page, section, data, onUpdate]);

  const refresh = useCallback(() => {
    return fetchData(true); // Skip cache on manual refresh
  }, [fetchData]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    // Listen for real-time updates
    const handleCmsUpdate = (e: CustomEvent) => {
      if (e.detail.page === page && e.detail.section === section) {
        if (isMountedRef.current) {
          setData(e.detail.data as T);
          setUpdatedAt(e.detail.updatedAt);
          onUpdate?.(e.detail.data);
        }
      }
    };

    window.addEventListener('cmsUpdate', handleCmsUpdate as EventListener);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('cmsUpdate', handleCmsUpdate as EventListener);
    };
  }, [page, section, autoFetch, fetchData, onUpdate]);

  return {
    data,
    loading,
    error,
    save,
    refresh,
    updatedAt,
  };
}

