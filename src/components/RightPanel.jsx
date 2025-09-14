import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Rule as RuleIcon,
  Send as SendIcon,
  DescriptionOutlined as DocumentIcon
} from '@mui/icons-material';
import ExpensePolicyCheckService from '../services/ExpensePolicyCheckService';

// Default policy rules if none are saved
const DEFAULT_POLICY_RULES = [
  "Total amount should not exceed 200 in any currency",
  "Each individual item amount should not exceed 100 in any currency",
  "Quantity for each item should be greater than 0",
  "Maximum number of items allowed is 10",
  "The expense date should not be in the future",
  "Invoice must have a valid invoice number",
  "Vendor name must be provided",
  "No alchohol items in the receipt"
];

// Get policy rules from localStorage or use defaults
const getPolicyRules = () => {
  const savedRules = localStorage.getItem('policyRules');
  if (savedRules) {
    try {
      const parsedRules = JSON.parse(savedRules);
      
      // Create a flat array with metadata
      let flattenedRules = [];
      
      if (Array.isArray(parsedRules)) {
        // Convert legacy flat array format to the new format with metadata
        flattenedRules = parsedRules.map(rule => ({
          rule,
          country: 'global',
          seniority: 'all',
          expenseType: 'all'
        }));
      } else if (typeof parsedRules === 'object') {
        // Handle 3D structure (country -> seniority -> expType -> rules)
        Object.keys(parsedRules).forEach(country => {
          Object.keys(parsedRules[country] || {}).forEach(seniority => {
            Object.keys(parsedRules[country][seniority] || {}).forEach(expType => {
              const rules = parsedRules[country][seniority][expType] || [];
              rules.forEach(rule => {
                flattenedRules.push({
                  rule,
                  country,
                  seniority,
                  expenseType: expType
                });
              });
            });
          });
        });
        
        // If no rules found in 3D structure, try 2D structure (for backwards compatibility)
        if (flattenedRules.length === 0) {
          Object.keys(parsedRules).forEach(country => {
            Object.keys(parsedRules[country] || {}).forEach(expType => {
              if (Array.isArray(parsedRules[country][expType])) {
                parsedRules[country][expType].forEach(rule => {
                  flattenedRules.push({
                    rule,
                    country,
                    seniority: 'all',
                    expenseType: expType
                  });
                });
              }
            });
          });
        }
      }
      
      return flattenedRules.length > 0 ? flattenedRules : DEFAULT_POLICY_RULES.map(rule => ({
        rule,
        country: 'global',
        seniority: 'all',
        expenseType: 'all'
      }));
    } catch (e) {
      console.error('Error parsing policy rules from localStorage:', e);
      return DEFAULT_POLICY_RULES.map(rule => ({
        rule,
        country: 'global',
        seniority: 'all',
        expenseType: 'all'
      }));
    }
  } else {
    return DEFAULT_POLICY_RULES.map(rule => ({
      rule,
      country: 'global',
      seniority: 'all',
      expenseType: 'all'
    }));
  }
};

const RightPanel = ({
  extractionResults,
  setExtractionResults,
  isExtracting,
  addToReport,
  RESULTS_WIDTH,
  HEADER_HEIGHT,
  FOOTER_HEIGHT
}) => {
  
  const [isChecking, setIsChecking] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [policyResults, setPolicyResults] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Clear policy results when new extraction results come in
  useEffect(() => {
    setPolicyResults(null);
  }, [extractionResults]);

  const handlePolicyCheck = async () => {
    setIsChecking(true);
    setPolicyResults(null);
    
    try {
      // Get the latest policy rules from localStorage
      const currentPolicyRules = getPolicyRules();
      const seniority = 'Senior'; // Assume all users have the same policy rules
      const results = await ExpensePolicyCheckService.checkPolicyCompliance(seniority,extractionResults, currentPolicyRules);
      setPolicyResults(results);
    } catch (error) {
      setPolicyResults({
        isCompliant: false,
        violations: [{
          message: `Error checking policy: ${error.message}`
        }]
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddToReport = async () => {
    setIsAdding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      addToReport(extractionResults);
    } catch (error) {
      console.error('Error adding to report:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const EmptyState = () => (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.secondary',
        p: 3
      }}
    >
      <DocumentIcon sx={{ fontSize: 64, mb: 2, color: 'grey.400' }} />
      <Typography variant="body2" color="text.secondary" align="center">
        Select a receipt and click on 'Extract Data' to see the output here.
      </Typography>
    </Box>
  );

  const LoadingState = () => (
    <Box sx={{ p: 3 }}>
      <Stack spacing={4}>
        <Skeleton variant="text" width="200px" height={32} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={40} />
          ))}
        </Box>
        <Divider />
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" width={60} /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width={100} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        width: RESULTS_WIDTH,
        flexShrink: 0,
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'auto',
        height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
        position: 'relative',
      }}
    >
      {isExtracting ? (
        <LoadingState />
      ) : !extractionResults ? (
        <EmptyState />
      ) : (
        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            <Typography variant="h5" gutterBottom>
              Extracted Data
            </Typography>
            
            {/* Header Information */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Invoice Number"
                variant="outlined"
                size="small"
                value={extractionResults.invoiceNumber || ''}
                onChange={(e) => setExtractionResults(prev => ({
                  ...prev,
                  invoiceNumber: e.target.value
                }))}
              />

              <TextField
                label="Issue Date"
                variant="outlined"
                size="small"
                value={extractionResults.date || ''}
                onChange={(e) => setExtractionResults(prev => ({
                  ...prev,
                  date: e.target.value
                }))}
              />

              <TextField
                label="Vendor"
                variant="outlined"
                size="small"
                value={extractionResults.vendor || ''}
                onChange={(e) => setExtractionResults(prev => ({
                  ...prev,
                  vendor: e.target.value
                }))}
              />

              <TextField
                label="Currency"
                variant="outlined"
                size="small"
                value={extractionResults.currency || ''}
                onChange={(e) => setExtractionResults(prev => ({
                  ...prev,
                  currency: e.target.value
                }))}
              />

              <TextField
                label="Expense Type"
                variant="outlined"
                size="small"
                value={extractionResults.expenseType || ''}
                onChange={(e) => setExtractionResults(prev => ({
                  ...prev,
                  expenseType: e.target.value
                }))}
              />

              <TextField
                label="Expense Location"
                variant="outlined"
                size="small"
                value={extractionResults.expenseLocation || ''}
                onChange={(e) => setExtractionResults(prev => ({
                  ...prev,
                  expenseLocation: e.target.value
                }))}
              />
                <TextField
                label="Expense Country"
                variant="outlined"
                size="small"
                value={extractionResults.expenseCountry || ''}
                onChange={(e) => setExtractionResults(prev => ({
                  ...prev,
                  expenseCountry: e.target.value
                }))}
              />
              
             
            </Box>

            <Divider />
            
            {/* Line Items Table */}
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extractionResults.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          variant="standard"
                          value={item.description || ''}
                          onChange={(e) => {
                            const newItems = [...(extractionResults.items || [])];
                            newItems[index] = {
                              ...newItems[index],
                              description: e.target.value
                            };
                            setExtractionResults(prev => ({
                              ...prev,
                              items: newItems
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard"
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const newItems = [...(extractionResults.items || [])];
                            newItems[index] = {
                              ...newItems[index],
                              quantity: e.target.value
                            };
                            setExtractionResults(prev => ({
                              ...prev,
                              items: newItems
                            }));
                          }}
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          variant="standard"
                          value={item.amount || ''}
                          onChange={(e) => {
                            const newItems = [...(extractionResults.items || [])];
                            newItems[index] = {
                              ...newItems[index],
                              amount: e.target.value
                            };
                            setExtractionResults(prev => ({
                              ...prev,
                              items: newItems
                            }));
                          }}
                          sx={{ input: { textAlign: 'right' } }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!extractionResults.items || extractionResults.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No line items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Table */}
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                    <TableCell align="right">
                      <TextField
                        variant="standard"
                        value={extractionResults.amount || ''}
                        onChange={(e) => setExtractionResults(prev => ({
                          ...prev,
                          amount: e.target.value
                        }))}
                        sx={{ input: { textAlign: 'right' } }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Taxes</TableCell>
                    <TableCell align="right">
                      <TextField
                        variant="standard"
                        value={extractionResults.taxes || ''}
                        onChange={(e) => setExtractionResults(prev => ({
                          ...prev,
                          taxes: e.target.value
                        }))}
                        sx={{ input: { textAlign: 'right' } }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell align="right">
                      <TextField
                        variant="standard"
                        value={extractionResults.total || ''}
                        onChange={(e) => setExtractionResults(prev => ({
                          ...prev,
                          total: e.target.value
                        }))}
                        sx={{ input: { textAlign: 'right' } }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Policy Check Results */}
            {policyResults && (
              <Box sx={{ mt: 2 }}>
                {policyResults.violations && policyResults.violations.length > 0 ? (
                  policyResults.violations.map((violation, index) => (
                    <Alert 
                      key={index} 
                      severity="error" 
                      sx={{ mb: 1 }}
                    >
                      {violation.message}
                    </Alert>
                  ))
                ) : (
                  <Alert severity="success">
                    No policy violations found. All items are compliant.
                  </Alert>
                )}
              </Box>
            )}

            {/* Buttons Stack */}
            <Stack spacing={2}>
              <LoadingButton
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<RuleIcon />}
                loading={isChecking}
                onClick={handlePolicyCheck}
              >
                Check Policy Compliance
              </LoadingButton>

              {policyResults && policyResults.isCompliant && (
                <LoadingButton
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<SendIcon />}
                  loading={isAdding}
                  onClick={handleAddToReport}
                >
                  Add to Report
                </LoadingButton>
              )}
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default RightPanel;