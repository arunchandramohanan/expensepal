import axios from 'axios';

const API_URL = 'http://10.105.212.31:3042/expensepolicycheck';

const ExpensePolicyCheckService = {
  async checkPolicyCompliance(seniority,extractionResults, policyRules) {
    try {
      const requestData = {
        seniority,
        ...extractionResults,
        policyRules
      };
      
      const response = await axios.post(API_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to check policy compliance: ${error.message}`);
    }
  }
};

export default ExpensePolicyCheckService;