import axios from 'axios';

const API_URL = 'http://10.105.212.31:3042/expenseextractor';

class ExpenseExtractorService {
  static async extractExpenseData(file) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      if (!file.type.match(/^(application\/pdf|image\/(jpeg|jpg))$/)) {
        throw new Error('Invalid file type. Only PDF and JPG files are supported.');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Determine and add file type
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
      formData.append('fileType', fileType);

      // Send request
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout and response type options
        timeout: 30000, // 30 second timeout
        responseType: 'json',
        // Add progress tracking
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      // Validate response
      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;

    } catch (error) {
      // Handle specific error types
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        switch (status) {
          case 400:
            throw new Error('Invalid request: ' + (error.response.data?.error || 'Bad Request'));
          case 413:
            throw new Error('File is too large');
          case 415:
            throw new Error('Unsupported file type');
          case 500:
            throw new Error('Server error: Please try again later');
          default:
            throw new Error(`Server error (${status}): ${error.response.data?.error || 'Unknown error'}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server: Please check your connection');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out: Please try again');
      } else {
        // Other errors
        throw new Error(`Failed to extract invoice data: ${error.message}`);
      }
    }
  }

  // Helper method to validate file size
  static validateFileSize(file, maxSizeMB = 10) {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }
    return true;
  }

  // Helper method to validate file type
  static validateFileType(file) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and JPG files are supported.');
    }
    return true;
  }
}

export default ExpenseExtractorService;