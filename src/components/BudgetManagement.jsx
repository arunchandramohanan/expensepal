import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';

// Import data context
import { useData } from './DataContext';

// Mock departments for dropdown
const departments = [
  'Sales', 'Marketing', 'Engineering', 'Finance', 'Operations', 'Customer Support', 'Human Resources', 'Legal'
];

// Mock expense categories for dropdown
const expenseCategories = [
  'Flights', 'Accommodations', 'Meals', 'Transportation', 'Office Supplies', 'IT Equipment', 
  'Registration', 'Training', 'Furniture', 'Miscellaneous'
];

const BudgetManagement = () => {
  // Get budgets data from context
  const { budgets, setBudgets, updateBudget, addBudget: addBudgetToContext, deleteBudget: deleteBudgetFromContext } = useData();
  
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    amount: '',
    categories: [],
    departments: []
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newCategory, setNewCategory] = useState({ name: '', allocation: '' });
  const [newDepartment, setNewDepartment] = useState({ name: '', allocation: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle dialog open for creating new budget
  const handleCreateBudget = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      amount: '',
      categories: [],
      departments: []
    });
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  // Handle dialog open for editing budget
  const handleEditBudget = (budget) => {
    setFormData({
      id: budget.id,
      name: budget.name,
      startDate: budget.startDate,
      endDate: budget.endDate,
      amount: budget.amount,
      categories: [...budget.categories],
      departments: [...budget.departments]
    });
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };
  
  // Handle new category changes
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: name === 'allocation' ? parseFloat(value) || '' : value
    });
  };
  
  // Add new category to form
  const handleAddCategory = () => {
    if (newCategory.name && newCategory.allocation) {
      setFormData({
        ...formData,
        categories: [
          ...formData.categories,
          { ...newCategory, spent: 0 }
        ]
      });
      setNewCategory({ name: '', allocation: '' });
    }
  };
  
  // Remove category from form
  const handleRemoveCategory = (index) => {
    const updatedCategories = [...formData.categories];
    updatedCategories.splice(index, 1);
    setFormData({
      ...formData,
      categories: updatedCategories
    });
  };
  
  // Handle new department changes
  const handleDepartmentChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment({
      ...newDepartment,
      [name]: name === 'allocation' ? parseFloat(value) || '' : value
    });
  };
  
  // Add new department to form
  const handleAddDepartment = () => {
    if (newDepartment.name && newDepartment.allocation) {
      setFormData({
        ...formData,
        departments: [
          ...formData.departments,
          { ...newDepartment, spent: 0 }
        ]
      });
      setNewDepartment({ name: '', allocation: '' });
    }
  };
  
  // Remove department from form
  const handleRemoveDepartment = (index) => {
    const updatedDepartments = [...formData.departments];
    updatedDepartments.splice(index, 1);
    setFormData({
      ...formData,
      departments: updatedDepartments
    });
  };
  
  // Handle budget submission
  const handleSubmitBudget = () => {
    setLoading(true);
    
    // Validate total allocations match budget amount
    const totalCategoryAllocation = formData.categories.reduce((sum, cat) => sum + cat.allocation, 0);
    const totalDepartmentAllocation = formData.departments.reduce((sum, dept) => sum + dept.allocation, 0);
    
    if (totalCategoryAllocation !== parseFloat(formData.amount)) {
      setNotification({
        open: true,
        message: `Category allocations (${totalCategoryAllocation}) must equal total budget amount (${formData.amount})`,
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    if (totalDepartmentAllocation !== parseFloat(formData.amount)) {
      setNotification({
        open: true,
        message: `Department allocations (${totalDepartmentAllocation}) must equal total budget amount (${formData.amount})`,
        severity: 'error'
      });
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      if (isEditing) {
        // Update existing budget
        const updatedBudget = {
          ...formData,
          spent: findBudget(formData.id)?.spent || 0,
          remaining: parseFloat(formData.amount) - (findBudget(formData.id)?.spent || 0),
          status: findBudget(formData.id)?.status || 'Active'
        };
        
        // Update budget in context
        updateBudget(updatedBudget);
        
        setNotification({
          open: true,
          message: 'Budget updated successfully',
          severity: 'success'
        });
      } else {
        // Create new budget
        const newBudget = {
          ...formData,
          id: `BUD-${(budgets.length + 1).toString().padStart(3, '0')}`,
          spent: 0,
          remaining: parseFloat(formData.amount),
          status: 'Active'
        };
        
        // Add budget to context
        addBudgetToContext(newBudget);
        
        setNotification({
          open: true,
          message: 'Budget created successfully',
          severity: 'success'
        });
      }
      
      setLoading(false);
      setDialogOpen(false);
    }, 1500);
  };
  
  // Helper function to find budget by ID
  const findBudget = (budgetId) => {
    return budgets.find(budget => budget.id === budgetId);
  };
  
  // Handle budget deletion
  const handleDeleteBudget = (budgetId) => {
    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Delete budget from context
        deleteBudgetFromContext(budgetId);
        
        setNotification({
          open: true,
          message: 'Budget deleted successfully',
          severity: 'info'
        });
        
        setLoading(false);
      }, 1000);
    }
  };
  
  // Handle budget selection for details
  const handleSelectBudget = (budget) => {
    setSelectedBudget(budget === selectedBudget ? null : budget);
  };
  
  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate budget utilization percentage
  const calculateUtilization = (spent, total) => {
    return (spent / total) * 100;
  };
  
  // Determine progress color based on utilization
  const getProgressColor = (percent, isInverse = false) => {
    if (isInverse) {
      if (percent >= 80) return 'success';
      if (percent >= 50) return 'warning';
      return 'error';
    } else {
      if (percent <= 60) return 'success';
      if (percent <= 80) return 'warning';
      return 'error';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', height: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="medium" gutterBottom>
          Budget Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage, allocate, and track expense budgets across your organization
        </Typography>
      </Box>
      
      {/* Budget Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Budget</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                ${budgets.reduce((sum, budget) => sum + budget.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {budgets.length} active budget{budgets.length !== 1 ? 's' : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOnIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Remaining</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                ${budgets.reduce((sum, budget) => sum + budget.remaining, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(budgets.reduce((sum, budget) => sum + budget.remaining, 0) / budgets.reduce((sum, budget) => sum + budget.amount, 0) * 100).toFixed(1)}% of total budget available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Current Utilization</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {(budgets.reduce((sum, budget) => sum + budget.spent, 0) / budgets.reduce((sum, budget) => sum + budget.amount, 0) * 100).toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(budgets.reduce((sum, budget) => sum + budget.spent, 0) / budgets.reduce((sum, budget) => sum + budget.amount, 0) * 100)} 
                    color={getProgressColor((budgets.reduce((sum, budget) => sum + budget.spent, 0) / budgets.reduce((sum, budget) => sum + budget.amount, 0) * 100))}
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ${budgets.reduce((sum, budget) => sum + budget.spent, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Budgets Table with Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Budget List</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreateBudget}
        >
          Create Budget
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.subtle' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Period</TableCell>
              <TableCell align="right">Total Budget</TableCell>
              <TableCell align="right">Spent</TableCell>
              <TableCell align="right">Remaining</TableCell>
              <TableCell>Utilization</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.map((budget) => {
              const utilization = calculateUtilization(budget.spent, budget.amount);
              const progressColor = getProgressColor(utilization);
              
              return (
                <React.Fragment key={budget.id}>
                  <TableRow 
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&.Mui-selected, &.Mui-selected:hover': {
                        bgcolor: 'primary.lighter',
                      },
                    }}
                    selected={selectedBudget && selectedBudget.id === budget.id}
                    onClick={() => handleSelectBudget(budget)}
                  >
                    <TableCell>{budget.id}</TableCell>
                    <TableCell>{budget.name}</TableCell>
                    <TableCell>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</TableCell>
                    <TableCell align="right">${budget.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">${budget.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">${budget.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={utilization} 
                            color={progressColor}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">{utilization.toFixed(1)}%</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={budget.status} 
                        size="small" 
                        color={budget.status === 'Active' ? 'success' : 'default'} 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBudget(budget);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBudget(budget.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Budget Details Expanded Row */}
                  {selectedBudget && selectedBudget.id === budget.id && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ p: 0, borderBottom: 'none' }}>
                        <Box sx={{ p: 3, bgcolor: 'background.subtle', borderTop: '1px solid', borderColor: 'divider' }}>
                          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                            <Tab label="Category Breakdown" />
                            <Tab label="Department Breakdown" />
                          </Tabs>
                          
                          {activeTab === 0 ? (
                            <Grid container spacing={2}>
                              {budget.categories.map((category, index) => {
                                const catUtilization = calculateUtilization(category.spent, category.allocation);
                                const catProgressColor = getProgressColor(catUtilization);
                                
                                return (
                                  <Grid item xs={12} md={6} lg={4} key={`cat-${index}`}>
                                    <Paper sx={{ p: 2, height: '100%' }}>
                                      <Typography variant="subtitle1" gutterBottom>
                                        {category.name}
                                      </Typography>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Budget: ${category.allocation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Spent: ${category.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={catUtilization} 
                                            color={catProgressColor}
                                            sx={{ height: 6, borderRadius: 3 }}
                                          />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                          <Typography variant="body2" color="text.secondary">{catUtilization.toFixed(1)}%</Typography>
                                        </Box>
                                      </Box>
                                      
                                      {catUtilization > 80 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'warning.main' }}>
                                          <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                                          <Typography variant="caption">
                                            {catUtilization >= 100 ? 'Budget exceeded' : 'Approaching limit'}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          ) : (
                            <Grid container spacing={2}>
                              {budget.departments.map((department, index) => {
                                const deptUtilization = calculateUtilization(department.spent, department.allocation);
                                const deptProgressColor = getProgressColor(deptUtilization);
                                
                                return (
                                  <Grid item xs={12} md={6} lg={4} key={`dept-${index}`}>
                                    <Paper sx={{ p: 2, height: '100%' }}>
                                      <Typography variant="subtitle1" gutterBottom>
                                        {department.name}
                                      </Typography>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Budget: ${department.allocation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Spent: ${department.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={deptUtilization} 
                                            color={deptProgressColor}
                                            sx={{ height: 6, borderRadius: 3 }}
                                          />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                          <Typography variant="body2" color="text.secondary">{deptUtilization.toFixed(1)}%</Typography>
                                        </Box>
                                      </Box>
                                      
                                      {deptUtilization > 80 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'warning.main' }}>
                                          <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                                          <Typography variant="caption">
                                            {deptUtilization >= 100 ? 'Budget exceeded' : 'Approaching limit'}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Budget Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => !loading && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Budget' : 'Create New Budget'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Budget Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Total Budget Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleFormChange}
                required
                fullWidth
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleFormChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleFormChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            {/* Category Allocations */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Category Allocations
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allocate your budget across expense categories
              </Typography>
              
              {formData.categories.map((category, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ width: '30%' }}>
                    {category.name}
                  </Typography>
                  <Typography sx={{ width: '30%', pl: 2 }}>
                    ${category.allocation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveCategory(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 2 }}>
                <FormControl sx={{ width: '40%' }}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="name"
                    value={newCategory.name}
                    onChange={handleCategoryChange}
                    label="Category"
                  >
                    {expenseCategories.map((cat) => (
                      <MenuItem 
                        key={cat} 
                        value={cat}
                        disabled={formData.categories.some(c => c.name === cat)}
                      >
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Allocation"
                  name="allocation"
                  type="number"
                  value={newCategory.allocation}
                  onChange={handleCategoryChange}
                  sx={{ width: '40%' }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
                
                <Button 
                  variant="outlined" 
                  onClick={handleAddCategory}
                  disabled={!newCategory.name || !newCategory.allocation}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Allocated: ${formData.categories.reduce((sum, cat) => sum + cat.allocation, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color={
                    formData.amount && formData.categories.reduce((sum, cat) => sum + cat.allocation, 0) !== parseFloat(formData.amount) 
                      ? 'error.main' 
                      : 'success.main'
                  }
                >
                  {formData.amount && formData.categories.reduce((sum, cat) => sum + cat.allocation, 0) !== parseFloat(formData.amount) 
                    ? 'Allocation does not match total budget' 
                    : formData.categories.length > 0 ? 'Allocation matches budget' : ''}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            {/* Department Allocations */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Department Allocations
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allocate your budget across departments
              </Typography>
              
              {formData.departments.map((department, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ width: '30%' }}>
                    {department.name}
                  </Typography>
                  <Typography sx={{ width: '30%', pl: 2 }}>
                    ${department.allocation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveDepartment(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 2 }}>
                <FormControl sx={{ width: '40%' }}>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    name="name"
                    value={newDepartment.name}
                    onChange={handleDepartmentChange}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem 
                        key={dept} 
                        value={dept}
                        disabled={formData.departments.some(d => d.name === dept)}
                      >
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Allocation"
                  name="allocation"
                  type="number"
                  value={newDepartment.allocation}
                  onChange={handleDepartmentChange}
                  sx={{ width: '40%' }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
                
                <Button 
                  variant="outlined" 
                  onClick={handleAddDepartment}
                  disabled={!newDepartment.name || !newDepartment.allocation}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Allocated: ${formData.departments.reduce((sum, dept) => sum + dept.allocation, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color={
                    formData.amount && formData.departments.reduce((sum, dept) => sum + dept.allocation, 0) !== parseFloat(formData.amount) 
                      ? 'error.main' 
                      : 'success.main'
                  }
                >
                  {formData.amount && formData.departments.reduce((sum, dept) => sum + dept.allocation, 0) !== parseFloat(formData.amount) 
                    ? 'Allocation does not match total budget' 
                    : formData.departments.length > 0 ? 'Allocation matches budget' : ''}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitBudget} 
            variant="contained" 
            disabled={
              loading || 
              !formData.name || 
              !formData.startDate || 
              !formData.endDate || 
              !formData.amount || 
              formData.categories.length === 0 ||
              formData.departments.length === 0 ||
              formData.categories.reduce((sum, cat) => sum + cat.allocation, 0) !== parseFloat(formData.amount) ||
              formData.departments.reduce((sum, dept) => sum + dept.allocation, 0) !== parseFloat(formData.amount)
            }
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Budget' : 'Create Budget'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetManagement;