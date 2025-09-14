import axios from 'axios';

const API_URL = 'http://10.105.212.31:3042/policyextractionfromurl';

const ExtractPolicyFromURL = {
  async extractPoliciesFromURL(url) {
    try {
      const requestData = {
        url: url
      };

      const response = await axios.post(API_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for URL processing
      });

      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        // Server responded with an error status
        const errorMessage = error.response.data?.error || error.message;
        throw new Error(`Failed to extract policies from URL: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check your connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        // Request timeout
        throw new Error('Request timed out. The URL may be taking too long to respond.');
      } else {
        // Other errors
        throw new Error(`Failed to extract policies from URL: ${error.message}`);
      }
    }
  },

  // Helper method to validate URL format
  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Helper method to normalize URL
  normalizeURL(url) {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }
};

export default ExtractPolicyFromURL;