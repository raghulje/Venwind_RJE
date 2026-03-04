/**
 * Utility to handle file uploads before form submission
 * Ensures all file inputs are uploaded and replaced with URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Upload a single file and return the URL
 */
async function uploadFile(file: File, isImage: boolean = true): Promise<string> {
  const formData = new FormData();
  const fieldName = isImage ? 'image' : 'file';
  const endpoint = isImage ? '/api/upload/image' : '/api/upload/file';
  
  formData.append(fieldName, file);
  
  const uploadUrl = API_BASE_URL 
    ? `${API_BASE_URL}${endpoint}` 
    : endpoint;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }
  
  const fileUrl = isImage ? result.imageUrl : result.fileUrl;
  const fullUrl = API_BASE_URL 
    ? `${API_BASE_URL}${fileUrl}` 
    : fileUrl;
  
  return fullUrl;
}

/**
 * Process form data and upload any file inputs
 * Returns a data object with file URLs instead of File objects
 * 
 * Handles the pattern where file inputs (often without names) trigger uploads
 * that set URLs in corresponding text inputs with field names
 */
export async function processFormDataWithUploads(
  form: HTMLFormElement,
  options: {
    imageFields?: string[]; // Field names that should be treated as images
    fileFields?: string[];  // Field names that should be treated as files
  } = {}
): Promise<Record<string, any>> {
  const formData = new FormData(form);
  const dataObj: Record<string, any> = {};
  const { imageFields = [], fileFields = [] } = options;
  
  // First, collect all file inputs that need uploading
  const fileInputs = form.querySelectorAll('input[type="file"]');
  const uploadPromises: Array<Promise<void>> = [];
  
  for (const input of fileInputs) {
    const fileInput = input as HTMLInputElement;
    
    // Check if file input has a file selected
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      // Try to determine the target field name
      // Pattern 1: File input has a name attribute
      let targetFieldName = fileInput.name;
      
      // Pattern 2: File input is near a text input - check previous/next sibling or parent's children
      if (!targetFieldName) {
        // Look for nearby text/url inputs that might be the target
        const parent = fileInput.parentElement;
        if (parent) {
          // Check for input with type text/url before or after this file input
          const textInput = parent.querySelector('input[type="text"], input[type="url"]') as HTMLInputElement;
          if (textInput && textInput.name) {
            targetFieldName = textInput.name;
          }
        }
        
        // If still not found, check the onChange handler's parameter (we can't access it directly,
        // but we can look for common patterns like fieldName in data attributes)
        if (!targetFieldName && fileInput.getAttribute('data-field-name')) {
          targetFieldName = fileInput.getAttribute('data-field-name') || '';
        }
      }
      
      // If we still don't have a field name, try to infer from common patterns
      if (!targetFieldName) {
        // Look for any text input in the form that might be related
        // This is a fallback - ideally file inputs should have data attributes or be near their target inputs
        console.warn('File input without clear target field name, attempting to find related input');
      }
      
      // Determine if it's an image or file based on field name, file type, or accept attribute
      const acceptAttr = fileInput.getAttribute('accept') || '';
      const isImageByAccept = acceptAttr.includes('image') || acceptAttr === 'image/*';
      const isImage = targetFieldName && imageFields.includes(targetFieldName) ||
                     (!targetFieldName || !fileFields.includes(targetFieldName)) && 
                     (file.type.startsWith('image/') || isImageByAccept);
      const isFile = targetFieldName && fileFields.includes(targetFieldName) || 
                    (!isImage && !file.type.startsWith('image/') && !isImageByAccept);
      
      // Upload the file
      const uploadPromise = uploadFile(file, isImage && !isFile)
        .then(url => {
          // If we have a target field name, set it in the data object and update the text input
          if (targetFieldName) {
            dataObj[targetFieldName] = url;
            // Also update the text input if it exists
            const textInput = form.querySelector(`input[name="${targetFieldName}"][type="text"], input[name="${targetFieldName}"][type="url"], input[name="${targetFieldName}"][type="hidden"]`) as HTMLInputElement;
            if (textInput) {
              textInput.value = url;
            }
          } else {
            // If no target field name, try to find a text input near this file input
            const parent = fileInput.parentElement;
            if (parent) {
              const textInput = parent.querySelector('input[type="text"], input[type="url"]') as HTMLInputElement;
              if (textInput && textInput.name) {
                dataObj[textInput.name] = url;
                textInput.value = url;
              }
            }
          }
        })
        .catch(error => {
          console.error(`Failed to upload file:`, error);
          // If upload fails, we'll use the existing value from the text input (if any)
        });
      
      uploadPromises.push(uploadPromise);
    }
  }
  
  // Wait for all uploads to complete
  await Promise.all(uploadPromises);
  
  // Now process all form fields from FormData
  formData.forEach((value, key) => {
    // Skip File objects (should be handled above, but just in case)
    if (value instanceof File) {
      console.warn(`Found File object for field ${key} in FormData, this should have been uploaded already`);
      return;
    }
    
    // If we already have a value from upload, use it (it's the uploaded URL)
    if (dataObj.hasOwnProperty(key)) {
      return;
    }
    
    // Handle string values
    if (typeof value === 'string') {
      dataObj[key] = value.trim();
    } else {
      dataObj[key] = value;
    }
  });
  
  return dataObj;
}

