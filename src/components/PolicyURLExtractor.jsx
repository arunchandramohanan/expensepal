import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Link as LinkIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlaylistAddCheck as ApproveIcon
} from '@mui/icons-material';
import ExtractPolicyFromURL from '../services/ExtractPolicyFromURL';

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

const PolicyURLExtractor = ({ addPolicyRules }) => {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPolicies, setExtractedPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState(new Set());
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentEditPolicy, setCurrentEditPolicy] = useState(null);

  const handleExtractPolicies = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Validate URL format
    if (!ExtractPolicyFromURL.validateURL(ExtractPolicyFromURL.normalizeURL(url))) {
      setError('Please enter a valid URL format (e.g., https://example.com)');
      return;
    }

    setIsExtracting(true);
    setError('');
    setSuccessMessage('');
    setExtractedPolicies([]);
    setSelectedPolicies(new Set());
    setMetadata(null);

    try {
      const normalizedUrl = ExtractPolicyFromURL.normalizeURL(url);
      const result = await ExtractPolicyFromURL.extractPoliciesFromURL(normalizedUrl);

      console.log('Extraction result:', result);

      if (result.policies && result.policies.length > 0) {
        setExtractedPolicies(result.policies);
        setMetadata(result.metadata);
        setSuccessMessage(`Successfully extracted ${result.policies.length} policies from the URL`);

        // Select all policies by default
        const allIds = new Set(result.policies.map((_, index) => index));
        setSelectedPolicies(allIds);
        setSelectAllChecked(true);
      } else {
        setError('No policies found in the provided URL. The content may not contain expense policy information.');
      }
    } catch (err) {
      console.error('Policy extraction error:', err);
      setError(err.message || 'Failed to extract policies from URL');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePolicySelection = (index) => {
    const newSelected = new Set(selectedPolicies);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPolicies(newSelected);
    setSelectAllChecked(newSelected.size === extractedPolicies.length);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(extractedPolicies.map((_, index) => index));
      setSelectedPolicies(allIds);
    } else {
      setSelectedPolicies(new Set());
    }
    setSelectAllChecked(checked);
  };

  const handleEditPolicy = (index, policy) => {
    setCurrentEditPolicy({
      index,
      policy: { ...policy }
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!currentEditPolicy) return;

    const { index, policy } = currentEditPolicy;
    const updatedPolicies = [...extractedPolicies];
    updatedPolicies[index] = policy;
    setExtractedPolicies(updatedPolicies);

    setOpenEditDialog(false);
    setCurrentEditPolicy(null);
    setSuccessMessage('Policy updated successfully');
  };

  const handleDeletePolicy = (index) => {
    const updatedPolicies = extractedPolicies.filter((_, i) => i !== index);
    setExtractedPolicies(updatedPolicies);

    // Update selected policies
    const newSelected = new Set();
    selectedPolicies.forEach(selectedIndex => {
      if (selectedIndex < index) {
        newSelected.add(selectedIndex);
      } else if (selectedIndex > index) {
        newSelected.add(selectedIndex - 1);
      }
    });
    setSelectedPolicies(newSelected);
    setSelectAllChecked(newSelected.size === updatedPolicies.length);

    setSuccessMessage('Policy deleted successfully');
  };

  const handleApproveSelected = () => {
    if (selectedPolicies.size === 0) {
      setError('Please select at least one policy to approve.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Mark selected policies as approved
    const updatedPolicies = [...extractedPolicies];
    selectedPolicies.forEach(index => {
      if (updatedPolicies[index]) {
        updatedPolicies[index].approved = true;
      }
    });
    setExtractedPolicies(updatedPolicies);

    // Add approved policies to the main policy list
    const approvedRules = Array.from(selectedPolicies)
      .map(index => extractedPolicies[index])
      .filter(policy => policy)
      .map(policy => ({
        text: policy.text,
        country: policy.country || 'global',
        expenseType: policy.expenseType || 'other',
        seniority: policy.seniority || 'all'
      }));

    if (approvedRules.length > 0) {
      addPolicyRules(approvedRules);
      setSuccessMessage(`Successfully approved ${approvedRules.length} policies and added them to Policy Management`);

      // Clear selection
      setSelectedPolicies(new Set());
      setSelectAllChecked(false);
    }
  };


  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.8) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.8) return 'Medium';
    return 'Low';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Extract Policies from URL
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter a URL to extract expense policies from web pages, policy documents, or corporate websites.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/expense-policy"
            disabled={isExtracting}
            InputProps={{
              startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            helperText="Enter the URL of a webpage containing expense policy information"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleExtractPolicies}
              disabled={isExtracting || !url.trim()}
              startIcon={isExtracting ? <CircularProgress size={20} /> : <DownloadIcon />}
            >
              {isExtracting ? 'Extracting Policies...' : 'Extract Policies'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setUrl('');
                setError('');
                setSuccessMessage('');
                setExtractedPolicies([]);
                setSelectedPolicies(new Set());
                setMetadata(null);
                setSelectAllChecked(false);
              }}
              disabled={isExtracting}
            >
              Clear
            </Button>
          </Box>

          {error && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" icon={<ApproveIcon />}>
              {successMessage}
            </Alert>
          )}

          {metadata && (
            <Alert severity="info" icon={<InfoIcon />}>
              Processed {metadata.contentLength} characters from: {metadata.url}
            </Alert>
          )}
        </Stack>
      </Paper>

      {extractedPolicies.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Extracted Policies ({extractedPolicies.length})
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectAllChecked}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    size="small"
                  />
                }
                label="Select All"
              />

              <Button
                variant="contained"
                color="success"
                onClick={handleApproveSelected}
                disabled={selectedPolicies.size === 0}
                startIcon={<ApproveIcon />}
                size="small"
              >
                Approve Selected Policies ({selectedPolicies.size})
              </Button>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Review and select the policies you want to approve. Approved policies will be added to the Policy Management tab:
          </Typography>

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {extractedPolicies.map((policy, index) => (
              <ListItem
                key={index}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: selectedPolicies.has(index) ? 'action.selected' : 'background.paper',
                  opacity: policy.approved ? 0.7 : 1
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={selectedPolicies.has(index)}
                    onChange={() => handlePolicySelection(index)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ flex: 1, pr: 2 }}>
                        {policy.text}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit policy">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPolicy(index, policy);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete policy">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePolicy(index);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                          label={policy.country || 'Global'}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                        <Chip
                          label={policy.expenseType || 'Other'}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                        <Chip
                          label={policy.seniority || 'All'}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${getConfidenceLabel(policy.confidence)} Confidence`}
                          size="small"
                          color={getConfidenceColor(policy.confidence)}
                          variant="outlined"
                        />
                        {policy.approved && (
                          <Chip
                            label="Approved"
                            size="small"
                            color="success"
                            variant="filled"
                          />
                        )}
                      </Stack>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Edit Policy Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
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
                  <MenuItem value="mid-level">Mid-Level</MenuItem>
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
    </Box>
  );
};

export default PolicyURLExtractor;