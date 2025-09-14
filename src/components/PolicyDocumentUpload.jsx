import React, { useState,useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Container,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControlLabel,
  Checkbox,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  ListItemIcon
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  PlaylistAddCheck as ApproveIcon,
} from '@mui/icons-material';

const EXPENSE_TYPES = [
  'Meals', 
  'Transportation', 
  'Accommodation', 
  'Entertainment', 
  'Mobile',
  'Office Supplies', 
  'Software', 
  'Hardware', 
  'Conferences', 
  'Training',
  'Other'
];

const COUNTRIES = [
  'Global', 
  'United States', 
  'United Kingdom', 
  'Germany', 
  'France', 
  'Japan', 
  'Canada', 
  'Australia', 
  'Brazil', 
  'India', 
  'China',
  'Singapore',
  'South Korea',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
];

const SENIORITY_LEVELS = [
  'All Levels',
  'Junior',
  'Mid-Level',
  'Senior',
  'Executive'
];

// Mock function to simulate PDF processing
// First, import the ExtractPolicyDocument service at the top of your file
import ExtractPolicyDocument from '../services/ExtractPolicyDocument';

// Replace the mock extractPoliciesFromPdf function with this real implementation
const extractPoliciesFromPdf = async (file) => {
  try {
    // Call the API service to extract policies
    const extractionResult = await ExtractPolicyDocument.extractPoliciesFromDocument(file);
    
    // Format the response to match your expected structure
    // Assuming the API returns { policies: [...], metadata: {...} } or similar
    return {
      policies: extractionResult.policies || [],
      fileName: file.name,
      pageCount: extractionResult.pageCount || extractionResult.metadata?.pageCount || 0,
      processingDate: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error extracting policies:", error);
    throw error; // Re-throw to be handled by the calling function
  }
};

// Store state in memory to persist across tab changes
let storedFiles = [];
let storedExtractedDocuments = [];
let storedSelectedPolicies = {};

const PolicyDocumentUpload = ({ addPolicyRules }) => {
  const [files, setFiles] = useState(storedFiles);
  const [extractedDocuments, setExtractedDocuments] = useState(storedExtractedDocuments);
  const [currentProcessingFile, setCurrentProcessingFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState(storedSelectedPolicies);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentEditPolicy, setCurrentEditPolicy] = useState(null);
  
  // Update stored state when state changes
  useEffect(() => {
    storedFiles = files;
    storedExtractedDocuments = extractedDocuments;
    storedSelectedPolicies = selectedPolicies;
  }, [files, extractedDocuments, selectedPolicies]);
  
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (newFiles.length === 0) {
      setErrorMessage('Please select PDF files only.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    setErrorMessage('');
  };
  
  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  

  const handleProcessFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setErrorMessage(''); // Clear any previous error messages
    setSuccessMessage(''); // Clear any previous success messages
    
    let hasErrors = false; // Local variable to track errors
    let processedCount = 0; // Track successfully processed files
    
    // Process each file
    for (const file of files) {
      try {
        setCurrentProcessingFile(file.name);
        
        // Call the extraction function that now uses the API service
        const result = await extractPoliciesFromPdf(file);
        
        // Add the successful result to the state
        setExtractedDocuments(prev => [...prev, result]);
        processedCount++;
      } catch (error) {
        console.error('Error processing file:', error);
        // Show a more descriptive error that might come from the API
        const errorMsg = `Error processing ${file.name}: ${error.message}`;
        setErrorMessage(errorMsg);
        hasErrors = true; // Mark that we had errors
        
        // You might want to break the loop here if you want to stop on first error
        // break;
      }
    }
    
    setIsProcessing(false);
    setCurrentProcessingFile(null);
    setFiles([]);
    
    // Only show success message if no errors occurred
    if (!hasErrors) {
      setSuccessMessage('All documents processed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else if (processedCount > 0) {
      // If some files processed successfully despite errors
      setSuccessMessage(`Processed ${processedCount} out of ${files.length} documents successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      // Keep error message visible a bit longer
      setTimeout(() => setErrorMessage(''), 5000);
    } else {
      // Keep error message visible longer if no files processed
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  
  const handleTogglePolicy = (documentIndex, policyId) => {
    const key = `${documentIndex}-${policyId}`;
    setSelectedPolicies(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleEditPolicy = (documentIndex, policy) => {
    setCurrentEditPolicy({
      documentIndex,
      policy: { ...policy }
    });
    setOpenEditDialog(true);
  };
  
  const handleSaveEdit = () => {
    if (!currentEditPolicy) return;
    
    const { documentIndex, policy } = currentEditPolicy;
    const updatedDocuments = [...extractedDocuments];
    
    const policyIndex = updatedDocuments[documentIndex].policies.findIndex(
      p => p.id === policy.id
    );
    
    if (policyIndex !== -1) {
      updatedDocuments[documentIndex].policies[policyIndex] = policy;
      setExtractedDocuments(updatedDocuments);
    }
    
    setOpenEditDialog(false);
    setCurrentEditPolicy(null);
  };
  
  const handleApproveSelected = () => {
    const selectedIds = Object.entries(selectedPolicies)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key);
    
    if (selectedIds.length === 0) {
      setErrorMessage('Please select at least one policy to approve.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    // Mark selected policies as approved
    const updatedDocuments = [...extractedDocuments];
    
    selectedIds.forEach(id => {
      const [docIndex, policyId] = id.split('-');
      const documentIndex = parseInt(docIndex);
      const policyIndex = updatedDocuments[documentIndex].policies.findIndex(
        p => p.id === policyId
      );
      
      if (policyIndex !== -1) {
        updatedDocuments[documentIndex].policies[policyIndex].approved = true;
      }
    });
    
    setExtractedDocuments(updatedDocuments);
    
    // Create rules to add to main policy list
    const rulesToAdd = [];
    
    selectedIds.forEach(id => {
      const [docIndex, policyId] = id.split('-');
      const documentIndex = parseInt(docIndex);
      const policy = updatedDocuments[documentIndex].policies.find(
        p => p.id === policyId
      );
      
      if (policy) {
        rulesToAdd.push({
          text: policy.text,
          country: policy.country,
          expenseType: policy.expenseType,
          seniority: policy.seniority
        });
      }
    });
    
    // Call parent component function to add rules
    if (addPolicyRules && rulesToAdd.length > 0) {
      addPolicyRules(rulesToAdd);
      
      // Clear selected policies
      setSelectedPolicies({});
      
      setSuccessMessage(`${rulesToAdd.length} policies approved and added to main policy list.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };
  
  const handleRemoveDocument = (index) => {
    // Remove the document and any selected policies from it
    setExtractedDocuments(prev => prev.filter((_, i) => i !== index));
    
    // Remove selected policies for this document
    const updatedSelectedPolicies = { ...selectedPolicies };
    Object.keys(updatedSelectedPolicies).forEach(key => {
      if (key.startsWith(`${index}-`)) {
        delete updatedSelectedPolicies[key];
      }
    });
    
    // Update keys for documents after the deleted one
    const updatedKeys = {};
    Object.entries(updatedSelectedPolicies).forEach(([key, value]) => {
      const [docIndex, policyId] = key.split('-');
      const numericIndex = parseInt(docIndex);
      if (numericIndex > index) {
        // Decrement the document index for items after the deleted document
        updatedKeys[`${numericIndex - 1}-${policyId}`] = value;
        delete updatedSelectedPolicies[key];
      }
    });
    
    setSelectedPolicies({...updatedSelectedPolicies, ...updatedKeys});
  };
  
  const getSelectedCount = () => {
    return Object.values(selectedPolicies).filter(Boolean).length;
  };
  
  // Function to remove a specific policy from a document
  const handleRemovePolicy = (documentIndex, policyId) => {
    const updatedDocuments = [...extractedDocuments];
    
    // Find the document and filter out the policy
    if (updatedDocuments[documentIndex]) {
      updatedDocuments[documentIndex].policies = updatedDocuments[documentIndex].policies.filter(
        policy => policy.id !== policyId
      );
      
      // If no policies left in the document, remove the document
      if (updatedDocuments[documentIndex].policies.length === 0) {
        return handleRemoveDocument(documentIndex);
      }
      
      setExtractedDocuments(updatedDocuments);
      
      // Remove the policy from selected policies
      const key = `${documentIndex}-${policyId}`;
      if (selectedPolicies[key]) {
        const updatedSelectedPolicies = { ...selectedPolicies };
        delete updatedSelectedPolicies[key];
        setSelectedPolicies(updatedSelectedPolicies);
      }
    }
  };

  // Count total number of policies across all documents
  const getTotalPolicyCount = () => {
    return extractedDocuments.reduce((total, doc) => {
      return total + doc.policies.length;
    }, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', px: 0, pb: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Main Content */}
        <Box sx={{ overflow: 'visible' }}>
          {/* Upload area */}
          <Paper 
            elevation={0} 
            variant="outlined"
            sx={{ 
              p: 2, 
              mb: 2,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Upload Policy Documents
            </Typography>
            
            <Box sx={{ 
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              mb: 2
            }}>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="upload-policy-button"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="upload-policy-button">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Select PDF Files
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Drop PDF files here or click to browse
              </Typography>
            </Box>
            
            {files.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Selected Files ({files.length})
                </Typography>
                <List dense sx={{ bgcolor: 'background.paper' }}>
                  {files.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <PdfIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProcessFiles}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={20} /> : <UploadIcon />}
                  sx={{ mt: 1 }}
                >
                  {isProcessing ? 'Processing...' : 'Process Files'}
                </Button>
              </Box>
            )}
            
            {isProcessing && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Processing {currentProcessingFile}...
              </Alert>
            )}
            
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}
            
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </Paper>

          {/* Action Button */}
          {getSelectedCount() > 0 && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<ApproveIcon />}
                onClick={handleApproveSelected}
              >
                Approve Selected Policies ({getSelectedCount()})
              </Button>
            </Box>
          )}
          
          {/* Extracted Policies */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              Extracted Policy Rules
            </Typography>
            {extractedDocuments.length > 0 && (
              <Chip
                size="small"
                label={getTotalPolicyCount()}
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          {extractedDocuments.length === 0 ? (
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <Typography color="text.secondary">
                No documents processed yet. Upload and process PDF documents to extract policy rules.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ 
              mb: 4,
              paddingBottom: 4
            }}>
              {extractedDocuments.map((document, docIndex) => (
                <Paper
                  key={docIndex}
                  elevation={0}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'grey.50', 
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderBottomColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PdfIcon sx={{ mr: 1, color: 'error.main' }} />
                      <Typography variant="subtitle2">
                        {document.fileName}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${document.pageCount} pages`} 
                        sx={{ ml: 1 }} 
                        variant="outlined"
                      />
                    </Box>
                    
                    <IconButton 
                      size="small" 
                      sx={{ ml: 'auto' }}
                      onClick={() => handleRemoveDocument(docIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <List sx={{ p: 0 }}>
                    {document.policies.map((policy) => (
                      <ListItem
                        key={policy.id}
                        sx={{
                          borderBottom: '1px solid',
                          borderBottomColor: 'divider',
                          py: 1,
                          bgcolor: policy.approved ? 'success.50' : 'transparent',
                          '&:last-child': {
                            borderBottom: 'none'
                          }
                        }}
                        secondaryAction={
                          <Box>
                            {!policy.approved && (
                              <>
                                <Tooltip title="Delete policy">
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => handleRemovePolicy(docIndex, policy.id)}
                                    sx={{ mr: 1 }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Edit policy details">
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => handleEditPolicy(docIndex, policy)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={!!selectedPolicies[`${docIndex}-${policy.id}`]}
                                      onChange={() => handleTogglePolicy(docIndex, policy.id)}
                                      size="small"
                                    />
                                  }
                                  label=""
                                />
                              </>
                            )}
                            
                            {policy.approved && (
                              <Chip 
                                size="small" 
                                icon={<CheckIcon fontSize="small" />} 
                                label="Approved" 
                                color="success" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {policy.text}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              <Tooltip title="Country">
                                <Chip
                                  size="small"
                                  icon={<LanguageIcon fontSize="small" />}
                                  label={policy.country === 'global' ? 'Global' : policy.country}
                                  variant="outlined"
                                />
                              </Tooltip>
                              
                              <Tooltip title="Expense Type">
                                <Chip
                                  size="small"
                                  icon={<CategoryIcon fontSize="small" />}
                                  label={policy.expenseType}
                                  variant="outlined"
                                />
                              </Tooltip>
                              
                              <Tooltip title="Seniority Level">
                                <Chip
                                  size="small"
                                  icon={<PersonIcon fontSize="small" />}
                                  label={policy.seniority === 'all' ? 'All Levels' : policy.seniority}
                                  variant="outlined"
                                />
                              </Tooltip>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Edit Policy Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Policy</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="policy-text"
            label="Policy Text"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={currentEditPolicy?.policy?.text || ''}
            onChange={(e) => setCurrentEditPolicy(prev => ({
              ...prev,
              policy: { ...prev.policy, text: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-country-label">Country</InputLabel>
                <Select
                  labelId="edit-country-label"
                  value={currentEditPolicy?.policy?.country || 'global'}
                  onChange={(e) => setCurrentEditPolicy(prev => ({
                    ...prev,
                    policy: { ...prev.policy, country: e.target.value }
                  }))}
                  label="Country"
                >
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country.toLowerCase()} value={country.toLowerCase()}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-expense-type-label">Expense Type</InputLabel>
                <Select
                  labelId="edit-expense-type-label"
                  value={currentEditPolicy?.policy?.expenseType || 'other'}
                  onChange={(e) => setCurrentEditPolicy(prev => ({
                    ...prev,
                    policy: { ...prev.policy, expenseType: e.target.value }
                  }))}
                  label="Expense Type"
                >
                  {EXPENSE_TYPES.map((type) => (
                    <MenuItem key={type.toLowerCase().replace(/\s+/g, '_')} value={type.toLowerCase().replace(/\s+/g, '_')}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-seniority-label">Seniority</InputLabel>
                <Select
                  labelId="edit-seniority-label"
                  value={currentEditPolicy?.policy?.seniority || 'all'}
                  onChange={(e) => setCurrentEditPolicy(prev => ({
                    ...prev,
                    policy: { ...prev.policy, seniority: e.target.value }
                  }))}
                  label="Seniority"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                  <MenuItem value="mid">Mid-Level</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                  <MenuItem value="executive">Executive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PolicyDocumentUpload;