import axios from 'axios';

const API_URL = 'http://10.105.212.31:3042/policyextractionfromdocument';

const ExtractPolicyDocument = {
  async extractPoliciesFromDocument(file) {
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 30 second timeout
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to extract policies from document: ${error.message}`);
    }
  }
};

export default ExtractPolicyDocument;