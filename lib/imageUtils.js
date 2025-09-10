// Image handling utilities for camera capture and processing

/**
 * Checks if the device has camera capability
 */
export const hasCamera = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Captures image from camera or allows file upload
 */
export const captureImage = () => {
  return new Promise((resolve, reject) => {
    // Create file input for fallback
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    // Add camera capture attribute for mobile devices
    if (hasCamera()) {
      input.capture = 'environment'; // Use back camera
    }
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    
    input.click();
  });
};

/**
 * Opens camera with live preview and capture functionality
 */
export const openCameraModal = () => {
  return new Promise((resolve, reject) => {
    // Check if camera is available
    if (!hasCamera()) {
      // Fallback to file input
      captureImage().then(resolve).catch(reject);
      return;
    }
    
    // Create camera modal
    const modal = createCameraModal();
    document.body.appendChild(modal);
    
    let stream = null;
    let video = modal.querySelector('#camera-video');
    let canvas = modal.querySelector('#capture-canvas');
    let ctx = canvas.getContext('2d');
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', // Back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
    .then(mediaStream => {
      stream = mediaStream;
      video.srcObject = stream;
      video.play();
    })
    .catch(error => {
      console.error('Camera access failed:', error);
      // Fallback to file input
      modal.remove();
      captureImage().then(resolve).catch(reject);
    });
    
    // Capture button handler
    const captureBtn = modal.querySelector('#capture-btn');
    captureBtn.onclick = () => {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob
      canvas.toBlob(blob => {
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        modal.remove();
        
        if (blob) {
          // Convert blob to file
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        } else {
          reject(new Error('Failed to capture image'));
        }
      }, 'image/jpeg', 0.8);
    };
    
    // Cancel button handler
    const cancelBtn = modal.querySelector('#cancel-btn');
    cancelBtn.onclick = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      modal.remove();
      reject(new Error('Capture cancelled'));
    };
    
    // Upload from gallery button handler
    const uploadBtn = modal.querySelector('#upload-btn');
    uploadBtn.onclick = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      modal.remove();
      captureImage().then(resolve).catch(reject);
    };
  });
};

/**
 * Creates camera modal HTML structure
 */
const createCameraModal = () => {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black z-50 flex flex-col';
  
  modal.innerHTML = `
    <!-- Camera Header -->
    <div class="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between text-white">
      <h3 class="text-lg font-semibold">Take Photo</h3>
      <button id="cancel-btn" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <!-- Camera View -->
    <div class="flex-1 relative overflow-hidden">
      <video id="camera-video" class="w-full h-full object-cover" autoplay playsinline muted></video>
      <canvas id="capture-canvas" class="hidden"></canvas>
      
      <!-- Camera Overlay -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-lg"></div>
      </div>
    </div>
    
    <!-- Camera Controls -->
    <div class="bg-black/50 backdrop-blur-sm p-6 flex items-center justify-center space-x-8">
      <button id="upload-btn" class="flex flex-col items-center space-y-2 text-white hover:text-blue-400 transition-colors">
        <div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <span class="text-sm">Gallery</span>
      </button>
      
      <button id="capture-btn" class="w-16 h-16 bg-white rounded-full border-4 border-white/30 hover:scale-110 transition-transform shadow-lg">
        <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
      </button>
      
      <div class="w-12"></div> <!-- Spacer for symmetry -->
    </div>
  `;
  
  return modal;
};

/**
 * Compresses image file to reduce size
 */
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Converts file to base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Converts blob to file with proper name and type
 */
export const blobToFile = (blob, fileName = 'image.jpg') => {
  return new File([blob], fileName, { type: blob.type });
};

/**
 * Validates image file type and size
 */
export const validateImage = (file, maxSize = 5 * 1024 * 1024) => { // 5MB default
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please select a JPEG, PNG, or WebP image.');
  }
  
  if (file.size > maxSize) {
    throw new Error(`File too large. Please select an image smaller than ${maxSize / (1024 * 1024)}MB.`);
  }
  
  return true;
};

/**
 * Creates image preview element
 */
export const createImagePreview = (file, container) => {
  const preview = document.createElement('div');
  preview.className = 'relative inline-block';
  
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.className = 'w-20 h-20 object-cover rounded-lg border border-gray-200';
  
  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = '×';
  removeBtn.className = 'absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors';
  removeBtn.onclick = () => {
    preview.remove();
    URL.revokeObjectURL(img.src);
  };
  
  preview.appendChild(img);
  preview.appendChild(removeBtn);
  container.appendChild(preview);
  
  return preview;
};

/**
 * Simulates image upload to server (replace with actual upload logic)
 */
export const uploadImage = async (file, endpoint = '/api/upload') => {
  try {
    // Validate image first
    validateImage(file);
    
    // Compress image
    const compressedBlob = await compressImage(file);
    const compressedFile = blobToFile(compressedBlob, file.name);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', compressedFile);
    formData.append('timestamp', Date.now().toString());
    
    // Simulate upload (replace with actual API call)
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = URL.createObjectURL(compressedFile);
        resolve({
          success: true,
          url: mockUrl,
          filename: compressedFile.name,
          size: compressedFile.size
        });
      }, 1500);
    });
    
    // Uncomment for actual upload:
    /*
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Add authorization headers if needed
      }
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};
