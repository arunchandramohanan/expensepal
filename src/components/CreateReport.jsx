import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  Alert,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  LinkOff as UnlinkIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Import data context
import { useData } from './DataContext';

// Sample exchange rates - in a real implementation, you would fetch these from an API
const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 1.09,
  GBP: 1.28,
  CAD: 0.74,
  AUD: 0.67,
  JPY: 0.0068,
  CNY: 0.14,
  INR: 0.012,
  // Add more currencies as needed
};

// Available cost codes
const COST_CODES = ["BUD-001", "BUD-002", "BUD-003"];

const CreateReport = () => {
  const navigate = useNavigate();
  
  // Get data from context
  const { 
    reportItems, 
    removeFromReport, 
    addReport, 
    transactions,
    unmatchedReceipts, 
    matchTransactionWithReceipt,
    unmatchTransaction,
    updateDashboardData
  } = useData();
  
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(EXCHANGE_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [costCode, setCostCode] = useState(''); // State for cost code
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [availableTransactions, setAvailableTransactions] = useState([]);
  const [matchedTransactions, setMatchedTransactions] = useState({});
  
  // Populate available transactions with unmatched ones from context
  useEffect(() => {
    setAvailableTransactions(transactions.filter(tx => tx.status === 'Unmatched'));
  }, [transactions]);
  
  // Initialize matched transactions from existing matchedTransactionId properties
  useEffect(() => {
    const initialMatches = {};
    reportItems.forEach(item => {
      if (item.matchedTransactionId) {
        initialMatches[item.id] = item.matchedTransactionId;
      }
    });
    setMatchedTransactions(initialMatches);
  }, [reportItems]);
  
  // Calculate match score between an expense and transaction (0-100)
  const calculateMatchScore = (transaction, expense, expenseAmountUSD) => {
    let score = 0;
    
    // Amount matching (up to 50 points)
    const amountDiff = Math.abs(transaction.amount - expenseAmountUSD);
    if (amountDiff < 0.01) {
      score += 50; // Exact match
    } else if (amountDiff < 1) {
      score += 40; // Off by less than $1
    } else if (amountDiff < 5) {
      score += 30; // Off by less than $5
    } else if (amountDiff < 10) {
      score += 20; // Off by less than $10
    } else if (amountDiff / expenseAmountUSD < 0.1) {
      score += 10; // Off by less than 10%
    }
    
    // Vendor name matching (up to 30 points)
    const vendorName = expense.vendor.toLowerCase();
    const merchantName = transaction.merchantName.toLowerCase();
    
    if (vendorName === merchantName) {
      score += 30; // Exact match
    } else if (vendorName.includes(merchantName) || merchantName.includes(vendorName)) {
      score += 25; // One contains the other
    } else {
      // Check for word overlap
      const vendorWords = vendorName.split(/\s+/);
      const merchantWords = merchantName.split(/\s+/);
      
      const commonWords = vendorWords.filter(word => 
        word.length > 2 && merchantWords.some(mWord => mWord.includes(word))
      );
      
      if (commonWords.length > 0) {
        score += Math.min(20, commonWords.length * 5); // 5 points per common word, up to 20
      }
    }
    
    // Date matching (up to 20 points)
    const expenseDate = new Date(expense.date);
    const transactionDate = new Date(transaction.date);
    
    const daysDiff = Math.abs((expenseDate - transactionDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1) {
      score += 20; // Same day
    } else if (daysDiff < 2) {
      score += 15; // Within 1 day
    } else if (daysDiff < 4) {
      score += 10; // Within 3 days
    } else if (daysDiff < 8) {
      score += 5; // Within a week
    }
    
    return score;
  };
  
  // Find the best matching transaction for an expense
  const findBestMatchTransaction = (expense, transactions, currentMatches) => {
    if (!expense) return null;
    
    const expenseAmountUSD = convertToUSD(expense.total, expense.currency);
    let bestScore = 0;
    let bestTransactionId = null;
    
    // Get all transactions that aren't already matched
    const availableTxs = transactions.filter(tx => 
      !Object.values(currentMatches).includes(tx.id)
    );
    
    // Find the transaction with the highest match score
    availableTxs.forEach(transaction => {
      const score = calculateMatchScore(transaction, expense, expenseAmountUSD);
      if (score > bestScore) {
        bestScore = score;
        bestTransactionId = transaction.id;
      }
    });
    
    // Only return as best match if score is above threshold
    return bestScore >= 60 ? bestTransactionId : null;
  };

  // Fetch exchange rates on component mount
  useEffect(() => {
    // In a real application, you would fetch real-time exchange rates from an API
    // Example:
    // const fetchExchangeRates = async () => {
    //   setIsLoadingRates(true);
    //   try {
    //     const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    //     const data = await response.json();
    //     setExchangeRates(data.rates);
    //   } catch (err) {
    //     console.error('Error fetching exchange rates:', err);
    //     setError('Failed to load exchange rates. Using default values.');
    //   } finally {
    //     setIsLoadingRates(false);
    //   }
    // };
    // fetchExchangeRates();
    
    // For demo purposes, just use the predefined rates
    setExchangeRates(EXCHANGE_RATES);
  }, []);

  // Convert amount to USD
  const convertToUSD = (amount, currency) => {
    if (!amount) return 0;
    if (!currency || currency === 'USD') return parseFloat(amount);
    
    const rate = exchangeRates[currency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${currency}, using 1.0`);
      return parseFloat(amount);
    }
    
    return parseFloat(amount) * rate; // Multiply instead of divide
  };
  
  // Calculate totals in USD
  const totalAmountUSD = reportItems
    .reduce((sum, item) => {
      const amountInUSD = convertToUSD(item.total || 0, item.currency);
      return sum + amountInUSD;
    }, 0)
    .toFixed(2);

  // Handle checkbox selection
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItems(reportItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle remove selected items
  const handleRemoveSelected = () => {
    selectedItems.forEach(id => removeFromReport(id));
    setSelectedItems([]);
  };

  // Handle cost code change
  const handleCostCodeChange = (event) => {
    setCostCode(event.target.value);
  };

  // Find transaction details for a given transaction ID
  const getTransactionDetails = (transactionId) => {
    return transactions.find(tx => tx.id === transactionId);
  };
  
  // Check if an expense item can be added to the current report
  const canAddToCurrentReport = (item) => {
    // If no items in report yet, any item can be added
    if (reportItems.length === 0) return true;
    
    // If item is already matched to a transaction
    if (matchedTransactions[item.id]) {
      const itemTransaction = getTransactionDetails(matchedTransactions[item.id]);
      if (!itemTransaction) return true; // If no transaction details, allow it
      
      // Check if any existing items are matched to transactions
      for (const existingItem of reportItems) {
        if (matchedTransactions[existingItem.id]) {
          const existingTransaction = getTransactionDetails(matchedTransactions[existingItem.id]);
          if (existingTransaction && existingTransaction.cardNumber !== itemTransaction.cardNumber) {
            // Different card number, can't add
            return false;
          }
        }
      }
    }
    
    return true;
  };

  // Open match dialog for an expense
  const handleOpenMatchDialog = (expense) => {
    setSelectedExpense(expense);
    
    // Filter available transactions to only show those that are compatible
    // with the current report (same card number as existing matched transactions)
    const filteredTransactions = [...availableTransactions].filter(transaction => {
      // If we already have matched transactions in this report
      if (reportItems.length > 0 && Object.keys(matchedTransactions).length > 0) {
        // Find the first matched transaction in the report
        for (const item of reportItems) {
          if (matchedTransactions[item.id]) {
            const existingTransaction = getTransactionDetails(matchedTransactions[item.id]);
            if (existingTransaction) {
              // Only show transactions with the same card number
              return transaction.cardNumber === existingTransaction.cardNumber;
            }
          }
        }
      }
      
      // If no transactions are matched yet, show all available transactions
      return true;
    });
    
    setAvailableTransactions(filteredTransactions);
    setMatchDialogOpen(true);
    
    // Show warning if transactions were filtered
    if (filteredTransactions.length < transactions.filter(tx => tx.status === 'Unmatched').length) {
      setSuccessMessage("Only showing transactions from the same card as your existing matches");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
    
    // Find best match automatically when dialog opens
    const bestMatchId = findBestMatchTransaction(expense, filteredTransactions, matchedTransactions);
    if (bestMatchId) {
      setSuccessMessage(`Best match found: ${bestMatchId}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Close match dialog
  const handleCloseMatchDialog = () => {
    setMatchDialogOpen(false);
    setSelectedExpense(null);
  };

  // Match expense with transaction
  const handleMatchTransaction = (transactionId) => {
    if (!selectedExpense) return;
    
    // Update matched transactions state
    setMatchedTransactions(prev => ({
      ...prev,
      [selectedExpense.id]: transactionId
    }));
    
    // Match transaction with receipt in global state
    const newReceiptId = `R-${Date.now()}`;
    const newReceipt = {
      id: newReceiptId,
      date: selectedExpense.date,
      vendor: selectedExpense.vendor,
      amount: parseFloat(selectedExpense.total),
      category: selectedExpense.expenseType || 'Miscellaneous',
      status: 'Matched'
    };
    
    // Match the transaction with this receipt
    matchTransactionWithReceipt(transactionId, newReceiptId);
    
    // Close dialog
    setMatchDialogOpen(false);
    setSelectedExpense(null);
    
    // Show success message
    setSuccessMessage(`Expense matched with transaction ${transactionId}`);
    
    // Update dashboard data
    updateDashboardData();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Unmatch expense from transaction
  const handleUnmatchTransaction = (expenseId) => {
    // Get the transaction ID before we remove it
    const transactionId = matchedTransactions[expenseId];
    
    // Create a copy of the current matchedTransactions
    const updatedMatches = { ...matchedTransactions };
    
    // Remove the matching for this expense
    delete updatedMatches[expenseId];
    
    // Update state
    setMatchedTransactions(updatedMatches);
    
    // Unmatch the transaction in global state
    if (transactionId) {
      unmatchTransaction(transactionId);
    }
    
    // Show success message
    setSuccessMessage("Expense unmatched from transaction");
    
    // Update dashboard data
    updateDashboardData();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle form submission
  const handleSubmitReport = async () => {
    if (!reportTitle.trim()) {
      setError('Please enter a report title');
      return;
    }

    if (reportItems.length === 0) {
      setError('Your report needs at least one expense item');
      return;
    }

    if (!costCode) {
      setError('Please select a cost code');
      return;
    }

    // Validate that all transactions are from the same card if matched
    const cardNumbers = new Set();
    const accountNames = new Set();
    
    reportItems.forEach(item => {
      if (matchedTransactions[item.id]) {
        const transaction = getTransactionDetails(matchedTransactions[item.id]);
        if (transaction) {
          cardNumbers.add(transaction.cardNumber);
          accountNames.add(transaction.accountName);
        }
      }
    });
    
    if (cardNumbers.size > 1) {
      setError('This report contains expenses from multiple cards. Please create separate reports for each card.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get card information if applicable
      let cardInfo = null;
      if (cardNumbers.size === 1) {
        const cardNumber = [...cardNumbers][0];
        const accountName = [...accountNames][0];
        cardInfo = { cardNumber, accountName };
      }
      
      // Create report object with USD totals and transaction matches
      const report = {
        id: `REP-${Date.now().toString().substring(5)}`,
        title: reportTitle,
        description: reportDescription,
        costCode: costCode, // Include cost code in the report
        cardInfo: cardInfo, // Include card information if available
        items: reportItems.map(item => {
          const matchedTxId = matchedTransactions[item.id] || null;
          const matchedTx = matchedTxId ? getTransactionDetails(matchedTxId) : null;
          
          return {
            ...item,
            amountUSD: convertToUSD(item.total, item.currency).toFixed(2),
            matchedTransactionId: matchedTxId, // Include matched transaction ID
            cardNumber: matchedTx ? matchedTx.cardNumber : null, // Include card number if matched
            accountName: matchedTx ? matchedTx.accountName : null // Include account name if matched
          };
        }),
        totalAmount: totalAmountUSD,
        currency: 'USD',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Submit report
      await addReport(report);
      
      // Update dashboard data
      updateDashboardData();
      
      // Navigate to reports page
      navigate('/reports');
      
      // Reset form
      setReportTitle('');
      setReportDescription('');
      setSelectedItems([]);
      setCostCode('');
      setMatchedTransactions({});
      
      // Show success message
      setSuccessMessage('Report submitted successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(`Error submitting report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Create Expense Report
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Report Form */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          <TextField
            label="Report Title"
            fullWidth
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            variant="outlined"
            required
          />
          
          <TextField
            label="Description"
            fullWidth
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={2}
          />
          
          {/* Cost Code Selection */}
          <FormControl fullWidth required>
            <InputLabel id="cost-code-label">Cost Code</InputLabel>
            <Select
              labelId="cost-code-label"
              id="cost-code"
              value={costCode}
              label="Cost Code"
              onChange={handleCostCodeChange}
            >
              {COST_CODES.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">
                Total Amount: ${totalAmountUSD} USD
              </Typography>
              <Tooltip title="All expenses are converted to USD using current exchange rates">
                <InfoIcon fontSize="small" color="primary" />
              </Tooltip>
            </Stack>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSubmitReport}
              disabled={isSubmitting || reportItems.length === 0 || isLoadingRates || !costCode}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Expenses List */}
      <Paper elevation={0} variant="outlined" sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Expense Items ({reportItems.length})
          </Typography>

          {selectedItems.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveSelected}
              size="small"
            >
              Remove Selected ({selectedItems.length})
            </Button>
          )}
        </Box>

        {reportItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body1" gutterBottom>
              No expenses added to this report yet
            </Typography>
            <Typography variant="body2">
              Process receipts and click "Add to Report" to include them here
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedItems.length > 0 && selectedItems.length < reportItems.length}
                      checked={selectedItems.length === reportItems.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell align="right">Original Amount</TableCell>
                  <TableCell align="right">Amount (USD)</TableCell>
                  <TableCell>Card Number</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportItems.map((item) => {
                  const amountInUSD = convertToUSD(item.total || 0, item.currency);
                  const isMatched = matchedTransactions[item.id];
                  const matchedTransaction = isMatched ? getTransactionDetails(isMatched) : null;
                  
                  return (
                    <TableRow 
                      key={item.id}
                      hover
                      selected={selectedItems.includes(item.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.invoiceNumber}</TableCell>
                      <TableCell>{item.vendor}</TableCell>
                      <TableCell>{item.expenseType}</TableCell>
                      <TableCell>{item.currency}</TableCell>
                      <TableCell align="right">
                        {item.currency} {parseFloat(item.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${amountInUSD.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {matchedTransaction ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CreditCardIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                            <Typography variant="body2">
                              {matchedTransaction.cardNumber}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {matchedTransaction ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                            <Typography variant="body2">
                              {matchedTransaction.accountName}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {isMatched ? (
                            <Tooltip title="Unmatch from transaction">
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleUnmatchTransaction(item.id)}
                              >
                                <UnlinkIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<CreditCardIcon />}
                              onClick={() => handleOpenMatchDialog(item)}
                            >
                              Match
                            </Button>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => removeFromReport(item.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Transaction Match Dialog */}
      <Dialog
        open={matchDialogOpen}
        onClose={handleCloseMatchDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Match Expense with Card Transaction
        </DialogTitle>
        <DialogContent dividers>
          {selectedExpense && (
            <>
              {/* Expense Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Expense Details:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Vendor:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedExpense.vendor}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body1">{selectedExpense.date}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Amount:</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedExpense.currency} {parseFloat(selectedExpense.total || 0).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">USD Amount:</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        ${convertToUSD(selectedExpense.total, selectedExpense.currency).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Available Transactions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Available Card Transactions:
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    const bestMatch = findBestMatchTransaction(selectedExpense, availableTransactions, matchedTransactions);
                    if (bestMatch) {
                      handleMatchTransaction(bestMatch);
                    } else {
                      setSuccessMessage("No strong matches found automatically");
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }
                  }}
                  startIcon={<CheckCircleIcon />}
                  color="success"
                >
                  Auto-Match Best
                </Button>
              </Box>
              
              {availableTransactions.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No unmatched card transactions available.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Merchant</TableCell>
                        <TableCell>Card</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Match Score</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableTransactions.map((transaction) => {
                        const expenseAmountUSD = convertToUSD(selectedExpense.total, selectedExpense.currency);
                        const amountMatches = Math.abs(transaction.amount - expenseAmountUSD) < 0.01;
                        const vendorMatches = transaction.merchantName.toLowerCase().includes(selectedExpense.vendor.toLowerCase()) || 
                                            selectedExpense.vendor.toLowerCase().includes(transaction.merchantName.toLowerCase());
                        
                        // Check if this transaction is already matched with another expense
                        const isAlreadyMatched = Object.values(matchedTransactions).includes(transaction.id);
                        
                        // Determine if this is the best match
                        const isBestMatch = !isAlreadyMatched && 
                          transaction.id === findBestMatchTransaction(selectedExpense, availableTransactions, matchedTransactions);
                        
                        if (isAlreadyMatched) return null; // Skip already matched transactions
                        
                        // Calculate and display match score
                        const matchScore = calculateMatchScore(transaction, selectedExpense, expenseAmountUSD);
                        
                        return (
                          <TableRow 
                            key={transaction.id} 
                            hover
                            sx={isBestMatch ? { 
                              backgroundColor: 'success.lightest',
                              '&:hover': {
                                backgroundColor: 'success.lighter',
                              }
                            } : {}}
                          >
                            <TableCell>{transaction.id}</TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>
                              {transaction.merchantName}
                              {vendorMatches && (
                                <Tooltip title="Vendor name matches">
                                  <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 0.5 }} />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CreditCardIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                                <Box>
                                  <Typography variant="body2">{transaction.cardNumber}</Typography>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {transaction.accountName}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              ${transaction.amount.toFixed(2)}
                              {amountMatches && (
                                <Tooltip title="Amount matches">
                                  <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 0.5 }} />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={`Match score: ${matchScore}/100`}>
                                <Chip 
                                  label={`${matchScore}%`} 
                                  size="small"
                                  color={
                                    matchScore >= 80 ? "success" :
                                    matchScore >= 60 ? "primary" :
                                    matchScore >= 40 ? "secondary" : "default"
                                  }
                                  variant={isBestMatch ? "filled" : "outlined"}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleMatchTransaction(transaction.id)}
                                color={isBestMatch ? "success" : (amountMatches && vendorMatches ? "secondary" : "primary")}
                                startIcon={isBestMatch ? <CheckCircleIcon /> : null}
                              >
                                {isBestMatch ? "Best Match" : "Match"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }).filter(Boolean)} {/* Filter out null values (already matched transactions) */}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMatchDialog}>
            Cancel
          </Button>
          <Button 
            onClick={() => navigate('/corporate-card')}
            startIcon={<CreditCardIcon />}
          >
            Go to Card Transactions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateReport;