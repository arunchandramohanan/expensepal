import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig.js';

const API_URL = API_ENDPOINTS.EXPENSE_POLICY_CHECK;

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