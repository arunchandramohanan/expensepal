import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Container,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Badge,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  FilterList as FilterIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
  Public as GlobalIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  Article as ArticleIcon,
  FormatListBulleted as ListIcon,
  Upload as UploadIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PolicyDocumentUpload from './PolicyDocumentUpload';

// Default policy rules if none are saved
const DEFAULT_POLICY_RULES = [
  "Total amount should not exceed 200 in any currency",
  "Each individual item amount should not exceed 100 in any currency",
  "Quantity for each item should be greater than 0",
  "expense should not be more than 60 days in the past",
  "The expense date should not be in the future",
  "Invoice must have a valid invoice number",
  "Vendor name must be provided",
  "No alchohol items in the receipt"
];

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

const PolicySettingsPage = () => {
  const navigate = useNavigate();
  
  // Initialize policy rules from localStorage or use defaults
  const [originalRules, setOriginalRules] = useState({});
  const [activeTab, setActiveTab] = useState(0);

 // Handle tab change
const handleTabChange = (event, newValue) => {
  if (hasUnsavedChanges && activeTab === 0) {
    if (window.confirm('You have unsaved changes in your policy rules. Are you sure you want to switch tabs?')) {
      setActiveTab(newValue);
    }
  } else {
    setActiveTab(newValue);
  }
};
  
  // Initialize with a structure that supports country, seniority, and expense type
  const [organizedRules, setOrganizedRules] = useState({
    global: { 
      all: {
        all: []
      }
    }
  });
  const handleAddPolicyRules = (newRules) => {
    const updatedRules = { ...organizedRules };
    
    newRules.forEach(rule => {
      const { text, country, expenseType, seniority } = rule;
      
      // Initialize country if it doesn't exist
      if (!updatedRules[country]) {
        updatedRules[country] = {};
      }
      
      // Initialize seniority if it doesn't exist
      if (!updatedRules[country][seniority]) {
        updatedRules[country][seniority] = {};
      }
      
      // Initialize expense type if it doesn't exist
      if (!updatedRules[country][seniority][expenseType]) {
        updatedRules[country][seniority][expenseType] = [];
      }
      
      // Add new rule
      updatedRules[country][seniority][expenseType].push(text);
    });
    
    // Update state
    setOrganizedRules(updatedRules);
    
    // Switch to manual tab to see the added rules
    setActiveTab(0);
    
    // Select the appropriate filters to show the added rules
    if (newRules.length === 1) {
      setSelectedCountry(newRules[0].country);
      setSelectedExpenseType(newRules[0].expenseType);
      setSelectedSeniority(newRules[0].seniority);
    }
  };
  // State for handling drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  
  // Convert flat array to structured object on component mount
  useEffect(() => {
    let initialRules;
    
    try {
      const savedRules = localStorage.getItem('policyRules');
      if (savedRules) {
        const parsedRules = JSON.parse(savedRules);
        
        if (Array.isArray(parsedRules)) {
          // Handle legacy flat array format
          initialRules = {
            global: { 
              all: {
                all: [...parsedRules] 
              }
            }
          };
        } else {
          // Transform existing 2D structure to 3D structure if needed
          if (parsedRules.global && parsedRules.global.all && Array.isArray(parsedRules.global.all)) {
            // Old 2D structure detected, convert to 3D
            const transformedRules = {};
            
            Object.keys(parsedRules).forEach(country => {
              transformedRules[country] = { all: {} };
              
              Object.keys(parsedRules[country] || {}).forEach(expType => {
                transformedRules[country].all[expType] = parsedRules[country][expType];
              });
            });
            
            initialRules = transformedRules;
          } else {
            // Already in 3D format or other structure
            initialRules = parsedRules;
          }
        }
      } else {
        // Use defaults if nothing saved
        initialRules = {
          global: { 
            all: {
              all: [...DEFAULT_POLICY_RULES] 
            }
          }
        };
      }
    } catch (e) {
      console.error('Error loading policy rules:', e);
      initialRules = {
        global: { 
          all: {
            all: [...DEFAULT_POLICY_RULES] 
          }
        }
      };
    }
    
    // Store both the original and working copy
    setOriginalRules(JSON.parse(JSON.stringify(initialRules))); // Deep copy
    setOrganizedRules(initialRules);
  }, []);

  // UI State
  const [newRule, setNewRule] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('global');
  const [selectedExpenseType, setSelectedExpenseType] = useState('all');
  const [selectedSeniority, setSelectedSeniority] = useState('all');
  const [showFilterHelp, setShowFilterHelp] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Track changes
  useEffect(() => {
    const isChanged = JSON.stringify(organizedRules) !== JSON.stringify(originalRules);
    setHasUnsavedChanges(isChanged);
  }, [organizedRules, originalRules]);

  // Helper to get current rules based on selections
  const getCurrentRules = () => {
    // Make sure the organizedRules object structure exists
    if (!organizedRules[selectedCountry]) {
      return [];
    }
    
    // Handle seniority selection
    if (!organizedRules[selectedCountry][selectedSeniority]) {
      return [];
    }
    
    // Handle expense type selection
    if (!organizedRules[selectedCountry][selectedSeniority][selectedExpenseType]) {
      return [];
    }
    
    return organizedRules[selectedCountry][selectedSeniority][selectedExpenseType];
  };

  // Handle rule operations
  const handleAddRule = () => {
    if (newRule.trim()) {
      const updatedRules = { ...organizedRules };
      
      // Initialize country if it doesn't exist
      if (!updatedRules[selectedCountry]) {
        updatedRules[selectedCountry] = {};
      }
      
      // Initialize seniority if it doesn't exist
      if (!updatedRules[selectedCountry][selectedSeniority]) {
        updatedRules[selectedCountry][selectedSeniority] = {};
      }
      
      // Initialize expense type if it doesn't exist
      if (!updatedRules[selectedCountry][selectedSeniority][selectedExpenseType]) {
        updatedRules[selectedCountry][selectedSeniority][selectedExpenseType] = [];
      }
      
      // Add new rule
      updatedRules[selectedCountry][selectedSeniority][selectedExpenseType].push(newRule.trim());
      
      // Update state
      setOrganizedRules(updatedRules);
      setNewRule('');
    }
  };

  const handleDeleteRule = (index) => {
    const updatedRules = { ...organizedRules };
    
    if (updatedRules[selectedCountry] && 
        updatedRules[selectedCountry][selectedSeniority] && 
        updatedRules[selectedCountry][selectedSeniority][selectedExpenseType]) {
      updatedRules[selectedCountry][selectedSeniority][selectedExpenseType] = 
        updatedRules[selectedCountry][selectedSeniority][selectedExpenseType].filter((_, i) => i !== index);
      setOrganizedRules(updatedRules);
    }
  };

  const handleEditRule = (index, value) => {
    const updatedRules = { ...organizedRules };
    
    if (updatedRules[selectedCountry] && 
        updatedRules[selectedCountry][selectedSeniority] && 
        updatedRules[selectedCountry][selectedSeniority][selectedExpenseType]) {
      updatedRules[selectedCountry][selectedSeniority][selectedExpenseType][index] = value;
      setOrganizedRules(updatedRules);
    }
  };
  
  // Drag and drop handling
  const handleDragStart = (e, index) => {
    setIsDragging(true);
    setDraggedItemIndex(index);
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === index) return;
    
    // Get current rules
    const currentRules = [...getCurrentRules()];
    const draggedItem = currentRules[draggedItemIndex];
    
    // Remove dragged item
    currentRules.splice(draggedItemIndex, 1);
    // Insert at new position
    currentRules.splice(index, 0, draggedItem);
    
    // Update state
    const updatedRules = { ...organizedRules };
    updatedRules[selectedCountry][selectedSeniority][selectedExpenseType] = currentRules;
    setOrganizedRules(updatedRules);
    
    // Update dragged item index
    setDraggedItemIndex(index);
  };
  
  const handleDragEnd = (e) => {
    setIsDragging(false);
    setDraggedItemIndex(null);
    e.currentTarget.style.opacity = '1';
  };

  // Handle saving changes
  const handleSave = () => {
    localStorage.setItem('policyRules', JSON.stringify(organizedRules));
    setOriginalRules(JSON.parse(JSON.stringify(organizedRules))); // Deep copy
    setHasUnsavedChanges(false);
    setSaveMessage('Policy rules saved successfully');
    
    // Clear save message after a delay
    setTimeout(() => {
      setSaveMessage('');
    }, 3000);
  };
  
  // Handle cancel (discard changes)
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        // Revert to original rules
        setOrganizedRules(JSON.parse(JSON.stringify(originalRules))); // Deep copy
        setHasUnsavedChanges(false);
      }
    }
  };
  
  // Count total rules across all countries, expense types, and seniority levels
  const getTotalRuleCount = () => {
    let count = 0;
    Object.keys(organizedRules).forEach(country => {
      Object.keys(organizedRules[country] || {}).forEach(seniority => {
        Object.keys(organizedRules[country][seniority] || {}).forEach(expType => {
          count += (organizedRules[country][seniority][expType] || []).length;
        });
      });
    });
    return count;
  };

  // Get counts for the current filter
  const getFilterCounts = () => {
    if (selectedCountry === 'global' && 
        selectedSeniority === 'all' && 
        selectedExpenseType === 'all') {
      return { countryCount: getTotalRuleCount(), typeCount: getTotalRuleCount() };
    }
    
    let countryCount = 0;
    let typeCount = 0;
    let seniorityCount = 0;
    
    // Count by country
    if (organizedRules[selectedCountry]) {
      Object.keys(organizedRules[selectedCountry]).forEach(seniority => {
        Object.keys(organizedRules[selectedCountry][seniority] || {}).forEach(expType => {
          countryCount += organizedRules[selectedCountry][seniority][expType].length;
        });
      });
    }
    
    // Count by expense type across all countries
    Object.keys(organizedRules).forEach(country => {
      Object.keys(organizedRules[country] || {}).forEach(seniority => {
        if (organizedRules[country][seniority][selectedExpenseType]) {
          typeCount += organizedRules[country][seniority][selectedExpenseType].length;
        }
      });
    });
    
    // Count by seniority across all countries and expense types
    Object.keys(organizedRules).forEach(country => {
      if (organizedRules[country][selectedSeniority]) {
        Object.keys(organizedRules[country][selectedSeniority] || {}).forEach(expType => {
          seniorityCount += organizedRules[country][selectedSeniority][expType].length;
        });
      }
    });
    
    return { countryCount, typeCount, seniorityCount };
  };

  // Determine appropriate icon for rule view
  const getRuleViewIcon = () => {
    if (selectedCountry !== 'global' && selectedExpenseType !== 'all') {
      return null; // No icon needed when both are specific
    } else if (selectedCountry !== 'global') {
      return <LanguageIcon fontSize="small" sx={{ mr: 1 }} />;
    } else if (selectedExpenseType !== 'all') {
      return <CategoryIcon fontSize="small" sx={{ mr: 1 }} />;
    } else {
      return <GlobalIcon fontSize="small" sx={{ mr: 1 }} />;
    }
  };

  // Get rule view description
  const getRuleViewDescription = () => {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    
    if (selectedSeniority !== 'all') {
      let description = capitalize(selectedSeniority);
      
      if (selectedCountry !== 'global' && selectedExpenseType !== 'all') {
        return `${description} level - ${selectedCountry} - ${selectedExpenseType} policies`;
      } else if (selectedCountry !== 'global') {
        return `${description} level - ${selectedCountry} policies`;
      } else if (selectedExpenseType !== 'all') {
        return `${description} level - ${selectedExpenseType} policies`;
      } else {
        return `${description} level employee policies`;
      }
    } else if (selectedCountry === 'global' && selectedExpenseType === 'all') {
      return "Global policies (applies to all countries and expense types)";
    } else if (selectedCountry === 'global') {
      return `${selectedExpenseType} policies (applies to all countries)`;
    } else if (selectedExpenseType === 'all') {
      return `${selectedCountry} policies (applies to all expense types)`;
    } else {
      return `${selectedCountry} - ${selectedExpenseType} specific policies`;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 1, pb: 2, height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', px: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', height: '48px', px: 1 }}>
          <SettingsIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h1">
            Expense Policy Settings
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ mb: 2 }}
        >
          <Tab 
            icon={<ListIcon fontSize="small" />} 
            label=" Policy Management" 
            iconPosition="start"
          />
          <Tab 
            icon={<UploadIcon fontSize="small" />} 
            label="Upload Policy Documents" 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ display: activeTab === 0 ? 'flex' : 'none', gap: 2, flexGrow: 1, overflow: 'hidden' }}>
          {/* Filter controls (left side) */}
          <Paper 
            elevation={0} 
            variant="outlined"
            sx={{ 
              p: 2,
              borderRadius: 2,
              width: '25%',
              position: 'sticky',
              top: 0,
              alignSelf: 'flex-start',
              height: 'fit-content'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ fontSize: 18, mr: 0.5 }} />
              Filter Rules
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="country-select-label">Country</InputLabel>
                <Select
                  labelId="country-select-label"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  label="Country"
                  startAdornment={<LanguageIcon sx={{ ml: 1, mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />}
                >
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country.toLowerCase()} value={country.toLowerCase()}>
                      {country}
                      {country === 'Global' && (
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          (all)
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel id="expense-type-select-label">Expense Type</InputLabel>
                <Select
                  labelId="expense-type-select-label"
                  value={selectedExpenseType}
                  onChange={(e) => setSelectedExpenseType(e.target.value)}
                  label="Expense Type"
                  startAdornment={<CategoryIcon sx={{ ml: 1, mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />}
                >
                  <MenuItem value="all">
                    All Expense Types
                  </MenuItem>
                  {EXPENSE_TYPES.map((type) => (
                    <MenuItem key={type.toLowerCase().replace(/\s+/g, '_')} value={type.toLowerCase().replace(/\s+/g, '_')}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="seniority-select-label">Employee Seniority</InputLabel>
                <Select
                  labelId="seniority-select-label"
                  value={selectedSeniority || 'all'}
                  onChange={(e) => setSelectedSeniority(e.target.value)}
                  label="Employee Seniority"
                  startAdornment={<PersonIcon sx={{ ml: 1, mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />}
                  
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                  <MenuItem value="mid">Mid-Level</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                  <MenuItem value="executive">Executive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Rules in this selection:</span> 
                <Chip 
                  size="small" 
                  label={getFilterCounts().countryCount} 
                  color="primary" 
                  variant="outlined"
                />
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Total policies:</span> 
                <Chip 
                  size="small" 
                  label={getTotalRuleCount()} 
                  color="default" 
                  variant="outlined"
                />
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Button 
              size="small" 
              variant="text"
              fullWidth
              onClick={() => setShowFilterHelp(!showFilterHelp)}
              endIcon={showFilterHelp ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ justifyContent: 'space-between', mt: 1 }}
            >
              Rule Inheritance
            </Button>
            
            <Collapse in={showFilterHelp}>
              <Box sx={{ mt: 1, bgcolor: 'background.paper', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" fontSize="0.8rem" paragraph sx={{ mb: 1 }}>
                  Rules are applied in order of specificity:
                </Typography>
                <Stack spacing={0.75}>
                  <Typography variant="body2" fontSize="0.8rem">
                    1. <strong>Country + Type specific</strong>
                  </Typography>
                  <Typography variant="body2" fontSize="0.8rem">
                    2. <strong>Country specific</strong> rules
                  </Typography>
                  <Typography variant="body2" fontSize="0.8rem">
                    3. <strong>Expense Type specific</strong> rules
                  </Typography>
                  <Typography variant="body2" fontSize="0.8rem">
                    4. <strong>Global rules</strong> (applies to all)
                  </Typography>
                </Stack>
              </Box>
            </Collapse>
          </Paper>

          {/* Main content (right side) */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            height: 'calc(100vh - 180px)',
            overflow: 'hidden'
          }}>
            {/* Create a scrollable container for all content except the action buttons */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              pb: '70px', 
              height: '100%'
            }}>
              {/* Current view indicator */}
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 2,
                  bgcolor: 'primary.50',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getRuleViewIcon()}
                <Typography variant="body2" color="primary.main" fontWeight="500">
                  {getRuleViewDescription()}
                </Typography>
                
                <Tooltip title="Define specific policies for different countries and expense types">
                  <IconButton size="small" sx={{ ml: 'auto' }}>
                    <InfoIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Paper>

              {/* Add new rule */}
              <Paper 
  elevation={0} 
  variant="outlined"
  sx={{ 
    p: 2, 
    mb: 2,
    borderRadius: 2
  }}
>
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'stretch',
    gap: 2,
    flexWrap: { xs: 'wrap', md: 'nowrap' }
  }}>
    {/* Text field */}
    <TextField
      fullWidth
      size="small"
      value={newRule}
      onChange={(e) => setNewRule(e.target.value)}
      placeholder="Add new policy rule..."
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          handleAddRule();
        }
      }}
    />
    
    {/* All action buttons in the same row */}
    <Box sx={{ 
      display: 'flex', 
      gap: 1,
      flexShrink: 0
    }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddRule}
        disabled={!newRule.trim()}
        size="small"
      >
        Add Rule
      </Button>
      
      <Button 
        onClick={handleCancel}
        variant="outlined"
        disabled={!hasUnsavedChanges}
        size="small"
      >
        Discard
      </Button>
      
      <Button 
        onClick={handleSave}
        variant="contained"
        color="success"
        disabled={!hasUnsavedChanges}
        size="small"
      >
        Save
      </Button>
    </Box>
  </Box>
  
  {/* Status message row */}
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    mt: 1
  }}>
    <Badge 
      color="primary" 
      variant="dot" 
      invisible={!hasUnsavedChanges}
      sx={{ '& .MuiBadge-badge': { right: -3, top: 5 } }}
    >
      <Typography variant="body2" color="text.secondary">
        Total policies: {getTotalRuleCount()}
      </Typography>
    </Badge>
    
    {saveMessage && (
      <Typography 
        variant="body2" 
        color="success.main" 
        sx={{ ml: 2, display: 'inline-flex', alignItems: 'center' }}
      >
        {saveMessage}
      </Typography>
    )}
  </Box>
</Paper>
              {/* Rules list header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Rules ({getCurrentRules().length})
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getCurrentRules().length > 0 && (
                    <Tooltip title="Drag to reorder rules">
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <DragIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} /> Drag to reorder
                      </Typography>
                    </Tooltip>
                  )}
                </Box>
              </Box>
              
              {/* Rules list - No bottom margin needed anymore */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  borderRadius: 2,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <List sx={{ 
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 0,
                  '& > :not(:last-child)': {
                    borderBottom: 1,
                    borderColor: 'divider'
                  }
                }}>
                  {getCurrentRules().map((rule, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 2,
                        py: 1.5,
                        transition: 'all 0.2s',
                        bgcolor: hoveredIndex === index ? 'action.hover' : 'transparent',
                        borderLeft: draggedItemIndex === index ? '3px solid' : 'none',
                        borderLeftColor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center'
                        }}
                      >
                        <DragIcon 
                          sx={{ 
                            color: 'action.active',
                            opacity: hoveredIndex === index || isDragging ? 1 : 0.3,
                            transition: 'opacity 0.2s',
                            mr: 1,
                            cursor: 'grab',
                            fontSize: '1.1rem'
                          }} 
                        />
                        <TextField
                          fullWidth
                          variant="standard"
                          value={rule}
                          onChange={(e) => handleEditRule(index, e.target.value)}
                          multiline
                          InputProps={{
                            sx: { 
                              fontSize: '0.875rem',
                              '&:before': { display: 'none' },
                              '&:after': { display: 'none' }
                            }
                          }}
                        />
                        <Tooltip title="Delete rule">
                          <IconButton
                            onClick={() => handleDeleteRule(index)}
                            size="small"
                            sx={{ 
                              opacity: hoveredIndex === index ? 1 : 0,
                              transition: 'opacity 0.2s',
                              ml: 1
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                  ))}
                  {getCurrentRules().length === 0 && (
                    <ListItem sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ width: '100%' }}>
                        No policy rules defined for this selection. Add your first rule above.
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Box>
            
      
           
          </Box>
        </Box>      
      
        <Box sx={{ display: activeTab === 1 ? 'block' : 'none', flexGrow: 1, overflow: 'auto' }}>
          <PolicyDocumentUpload addPolicyRules={handleAddPolicyRules} />
        </Box>
      </Box>
    </Container>
  );
};

export default PolicySettingsPage;