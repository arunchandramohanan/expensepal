const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3042';

export const API_ENDPOINTS = {
  EXPENSE_EXTRACTOR: `${API_BASE_URL}/expenseextractor`,
  POLICY_EXTRACTION_FROM_URL: `${API_BASE_URL}/policyextractionfromurl`,
  POLICY_EXTRACTION_FROM_DOCUMENT: `${API_BASE_URL}/policyextractionfromdocument`,
  EXPENSE_POLICY_CHECK: `${API_BASE_URL}/expensepolicycheck`
};

export default API_ENDPOINTS;