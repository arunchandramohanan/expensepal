import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab
} from '@mui/material';

import {
  Search as SearchIcon,
  Sync as SyncIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  FileUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  MoreVert as MoreVertIcon,
  Filter as FilterIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Mock data for cards
const mockCards = [
  {
    id: 'card-1',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    expiryDate: '12/26',
    cardHolder: 'Sarah Johnson',
    department: 'Marketing',
    isActive: true
  },
  {
    id: 'card-2',
    cardNumber: '****8901',
    cardType: 'Corporate Amex',
    expiryDate: '05/27',
    cardHolder: 'Michael Chen',
    department: 'Sales',
    isActive: true
  },
  {
    id: 'card-3',
    cardNumber: '****2345',
    cardType: 'Corporate Mastercard',
    expiryDate: '09/25',
    cardHolder: 'David Rodriguez',
    department: 'Engineering',
    isActive: true
  },
  {
    id: 'card-4',
    cardNumber: '****6789',
    cardType: 'Corporate Visa',
    expiryDate: '03/26',
    cardHolder: 'Emily Wilson',
    department: 'Finance',
    isActive: true
  }
];

// Mock data for transactions
export const mockTransactions = [
  {
    id: 'TX-54321',
    date: '2025-04-25',
    merchantName: 'Delta Airlines',
    category: 'Travel',
    amount: 642.87,
    status: 'Unmatched',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    accountName: 'Sarah Johnson',
    receiptStatus: null
  },
  {
    id: 'TX-54322',
    date: '2025-04-24',
    merchantName: 'Hilton Hotels',
    category: 'Lodging',
    amount: 389.54,
    status: 'Matched',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    accountName: 'Sarah Johnson',
    receiptStatus: 'Verified',
    receiptId: 'R-10045'
  },
  {
    id: 'TX-54323',
    date: '2025-04-24',
    merchantName: 'Uber',
    category: 'Transportation',
    amount: 38.75,
    status: 'Matched',
    cardNumber: '****8901',
    cardType: 'Corporate Amex',
    accountName: 'Michael Chen',
    receiptStatus: 'Verified',
    receiptId: 'R-10046'
  },
  {
    id: 'TX-54324',
    date: '2025-04-23',
    merchantName: 'Ruth\'s Chris Steakhouse',
    category: 'Meals',
    amount: 187.45,
    status: 'Matched',
    cardNumber: '****8901',
    cardType: 'Corporate Amex',
    accountName: 'Michael Chen',
    receiptStatus: 'Pending Review',
    receiptId: 'R-10047',
    issue: 'Amount mismatch'
  },
  {
    id: 'TX-54325',
    date: '2025-04-22',
    merchantName: 'Office Depot',
    category: 'Office Supplies',
    amount: 85.32,
    status: 'Unmatched',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    accountName: 'Sarah Johnson',
    receiptStatus: null
  },
  {
    id: 'TX-54326',
    date: '2025-04-21',
    merchantName: 'Starbucks',
    category: 'Meals',
    amount: 15.47,
    status: 'Unmatched',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    accountName: 'Sarah Johnson',
    receiptStatus: null
  },
  {
    id: 'TX-54327',
    date: '2025-04-20',
    merchantName: 'Yellow Cab',
    category: 'Transportation',
    amount: 45.20,
    status: 'Matched',
    cardNumber: '****2345',
    cardType: 'Corporate Mastercard',
    accountName: 'David Rodriguez',
    receiptStatus: 'Verified',
    receiptId: 'R-10048'
  },
  {
    id: 'TX-54329',
    date: '2025-04-19',
    merchantName: 'Amazon',
    category: 'Office Supplies',
    amount: 129.99,
    status: 'Unmatched',
    cardNumber: '****6789',
    cardType: 'Corporate Visa',
    accountName: 'Emily Wilson',
    receiptStatus: null
  },
  {
    id: 'TX-54330',
    date: '2025-04-18',
    merchantName: 'United Airlines',
    category: 'Travel',
    amount: 578.50,
    status: 'Unmatched',
    cardNumber: '****2345',
    cardType: 'Corporate Mastercard',
    accountName: 'David Rodriguez',
    receiptStatus: null
  }
];

// Mock data for receipts that can be matched
const mockUnmatchedReceipts = [
  {
    id: 'R-10049',
    date: '2025-04-25',
    vendor: 'Delta Airlines',
    amount: 642.87,
    category: 'Travel',
    status: 'Unmatched'
  },
  {
    id: 'R-10050',
    date: '2025-04-22',
    vendor: 'Office Depot',
    amount: 85.32,
    category: 'Office Supplies',
    status: 'Unmatched'
  },
  {
    id: 'R-10051',
    date: '2025-04-21',
    vendor: 'Starbucks',
    amount: 15.47,
    category: 'Meals',
    status: 'Unmatched'
  }
];

const CorporateCardIntegration = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(mockTransactions);
  const [unmatchedReceipts, setUnmatchedReceipts] = useState(mockUnmatchedReceipts);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateSort, setDateSort] = useState('desc');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [receiptMatchDialogOpen, setReceiptMatchDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [cards, setCards] = useState(mockCards);
  const [selectedCardFilter, setSelectedCardFilter] = useState('all');
  const [cardTabValue, setCardTabValue] = useState(0);

  // Simulate loading transactions on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle syncing with corporate card systems
  const handleSync = () => {
    setSyncing(true);
    // Simulate API call delay
    setTimeout(() => {
      // Simulate finding a new transaction
      const newTransaction = {
        id: 'TX-54328',
        date: '2025-04-26',
        merchantName: 'American Airlines',
        category: 'Travel',
        amount: 532.67,
        status: 'Unmatched',
        cardNumber: '****4567',
        cardType: 'Corporate Visa',
        accountName: 'Sarah Johnson',
        receiptStatus: null
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setSyncing(false);
      
      setNotification({
        open: true,
        message: 'Successfully synced with corporate card system. Found 1 new transaction.',
        severity: 'success'
      });
    }, 2000);
  };

  // Handle auto-matching receipts to transactions
  const handleAutoMatch = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Simulate matching logic
      const updatedTransactions = [...transactions];
      const updatedUnmatchedReceipts = [...unmatchedReceipts];
      
      let matchCount = 0;
      
      // For each unmatched transaction, look for a matching receipt
      updatedTransactions.forEach((transaction, index) => {
        if (transaction.status === 'Unmatched') {
          // Find a matching receipt based on amount and vendor/merchant name
          const matchingReceiptIndex = updatedUnmatchedReceipts.findIndex(
            receipt => receipt.amount === transaction.amount && 
                      receipt.vendor.toLowerCase().includes(transaction.merchantName.toLowerCase())
          );
          
          if (matchingReceiptIndex !== -1) {
            // Update transaction with matched receipt info
            updatedTransactions[index] = {
              ...transaction,
              status: 'Matched',
              receiptStatus: 'Verified',
              receiptId: updatedUnmatchedReceipts[matchingReceiptIndex].id
            };
            
            // Remove the matched receipt from unmatchedReceipts
            updatedUnmatchedReceipts.splice(matchingReceiptIndex, 1);
            
            matchCount++;
          }
        }
      });
      
      setTransactions(updatedTransactions);
      setUnmatchedReceipts(updatedUnmatchedReceipts);
      setLoading(false);
      
      setNotification({
        open: true,
        message: `Successfully matched ${matchCount} transactions with receipts.`,
        severity: 'success'
      });
    }, 2000);
  };

  // Handle manual matching for a specific transaction
  const handleManualMatch = (transaction) => {
    setSelectedTransaction(transaction);
    setReceiptMatchDialogOpen(true);
  };

  // Handle confirming a manual match
  const handleConfirmMatch = (receiptId) => {
    setReceiptMatchDialogOpen(false);
    
    // Find the receipt we're matching
    const matchedReceipt = unmatchedReceipts.find(receipt => receipt.id === receiptId);
    
    if (matchedReceipt && selectedTransaction) {
      // Update the transaction with the matched receipt info
      const updatedTransactions = transactions.map(tx => {
        if (tx.id === selectedTransaction.id) {
          return {
            ...tx,
            status: 'Matched',
            receiptStatus: 'Verified',
            receiptId: receiptId
          };
        }
        return tx;
      });
      
      // Remove the matched receipt from unmatchedReceipts
      const updatedUnmatchedReceipts = unmatchedReceipts.filter(receipt => receipt.id !== receiptId);
      
      setTransactions(updatedTransactions);
      setUnmatchedReceipts(updatedUnmatchedReceipts);
      
      setNotification({
        open: true,
        message: `Successfully matched transaction ${selectedTransaction.id} with receipt ${receiptId}.`,
        severity: 'success'
      });
    }
  };

  // Handle unlinking a transaction from its receipt
  const handleUnlink = (transaction) => {
    // Find the transaction and unlink it
    const updatedTransactions = transactions.map(tx => {
      if (tx.id === transaction.id) {
        // Add the receipt back to unmatchedReceipts
        if (tx.receiptId) {
          setUnmatchedReceipts(prev => [
            ...prev,
            {
              id: tx.receiptId,
              date: tx.date,
              vendor: tx.merchantName,
              amount: tx.amount,
              category: tx.category,
              status: 'Unmatched'
            }
          ]);
        }
        
        return {
          ...tx,
          status: 'Unmatched',
          receiptStatus: null,
          receiptId: undefined
        };
      }
      return tx;
    });
    
    setTransactions(updatedTransactions);
    
    setNotification({
      open: true,
      message: `Transaction ${transaction.id} has been unlinked from its receipt.`,
      severity: 'info'
    });
  };

  // Handle card tab change
  const handleCardTabChange = (event, newValue) => {
    setCardTabValue(newValue);
    
    // Update selected card filter based on tab index
    if (newValue === 0) {
      setSelectedCardFilter('all');
    } else {
      const selectedCard = cards[newValue - 1];
      setSelectedCardFilter(selectedCard.cardNumber);
    }
  };

  // Filter transactions based on search term, status filter, and card filter
  const filteredTransactions = transactions.filter(transaction => {
    // Apply search filter
    const matchesSearch = 
      transaction.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.receiptId && transaction.receiptId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'matched' && transaction.status === 'Matched') ||
      (statusFilter === 'unmatched' && transaction.status === 'Unmatched');
    
    // Apply card filter
    const matchesCard =
      selectedCardFilter === 'all' || transaction.cardNumber === selectedCardFilter;
    
    return matchesSearch && matchesStatus && matchesCard;
  });

  // Sort transactions by date
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Toggle date sort order
  const handleToggleSort = () => {
    setDateSort(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Get card stats
  const getCardStats = (cardNumber) => {
    const cardTxs = transactions.filter(tx => 
      cardNumber === 'all' ? true : tx.cardNumber === cardNumber
    );
    
    const total = cardTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const matched = cardTxs.filter(tx => tx.status === 'Matched').length;
    const unmatched = cardTxs.filter(tx => tx.status === 'Unmatched').length;
    
    return { total, count: cardTxs.length, matched, unmatched };
  };

  // Get card holder name from card number
  const getCardHolderName = (cardNumber) => {
    const card = cards.find(card => card.cardNumber === cardNumber);
    return card ? card.cardHolder : 'Unknown';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', height: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="medium" gutterBottom>
          Corporate Card Integration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and match corporate card transactions with receipts
        </Typography>
      </Box>
      
      {/* Card Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={cardTabValue}
          onChange={handleCardTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<CreditCardIcon fontSize="small" />} 
            iconPosition="start" 
            label="All Cards" 
          />
          {cards.map((card, index) => (
            <Tab 
              key={card.id}
              icon={<CreditCardIcon fontSize="small" />}
              iconPosition="start"
              label={`${card.cardNumber} (${card.cardHolder})`}
            />
          ))}
        </Tabs>
        
        {/* Card Details Panel */}
        <Box sx={{ p: 3 }}>
          {cardTabValue === 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>All Corporate Cards</Typography>
              <Grid container spacing={2}>
                {cards.map(card => {
                  const stats = getCardStats(card.cardNumber);
                  return (
                    <Grid item xs={12} md={6} lg={3} key={card.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CreditCardIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" fontWeight="medium">
                              {card.cardNumber}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            {card.cardHolder}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {card.cardType} • Exp: {card.expiryDate}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Transactions: {stats.count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total: ${stats.total.toFixed(2)}
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                              <Chip 
                                size="small" 
                                color="success" 
                                variant="outlined" 
                                label={`${stats.matched} Matched`} 
                              />
                              <Chip 
                                size="small" 
                                color="warning" 
                                variant="outlined" 
                                label={`${stats.unmatched} Unmatched`} 
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Box>
              {cards[cardTabValue - 1] && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {cards[cardTabValue - 1].cardHolder}'s Card
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CreditCardIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {cards[cardTabValue - 1].cardNumber} • {cards[cardTabValue - 1].cardType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Department: {cards[cardTabValue - 1].department} • Expires: {cards[cardTabValue - 1].expiryDate}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Button 
                        variant="contained" 
                        startIcon={<SyncIcon />}
                        onClick={handleSync}
                        disabled={syncing}
                      >
                        {syncing ? 'Syncing...' : 'Sync Transactions'}
                        {syncing && <CircularProgress size={20} sx={{ ml: 1 }} />}
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    {(() => {
                      const stats = getCardStats(cards[cardTabValue - 1].cardNumber);
                      return (
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'primary.lightest', 
                            borderRadius: 2,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4
                          }}
                        >
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              Transactions
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {stats.count}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              Matched
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {stats.matched}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              Unmatched
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="warning.main">
                              {stats.unmatched}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              Total Amount
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                              ${stats.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })()}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Action Cards - Only show on All Cards view */}
      {cardTabValue === 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WalletIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Corporate Cards</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Sync your latest transactions from all corporate card accounts.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<SyncIcon />}
                  onClick={handleSync}
                  disabled={syncing}
                  fullWidth
                >
                  {syncing ? 'Syncing...' : 'Sync All Transactions'}
                  {syncing && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Auto-Match</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Automatically match your uploaded receipts with card transactions.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<LinkIcon />}
                  onClick={handleAutoMatch}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Matching...' : 'Auto-Match Receipts'}
                  {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UploadIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Upload Receipts</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload digital receipts or photos of physical receipts for matching.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<UploadIcon />}
                  fullWidth
                  onClick={() => navigate('/upload')}
                >
                  Upload Receipts
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Transaction Stats - Show overall only on All Cards view, otherwise show selected card stats */}
      {cardTabValue === 0 && (
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: 'primary.lightest', 
            borderRadius: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Total Transactions
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {transactions.length}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="overline" color="text.secondary">
              Matched
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {transactions.filter(tx => tx.status === 'Matched').length}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="overline" color="text.secondary">
              Unmatched
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              {transactions.filter(tx => tx.status === 'Unmatched').length}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="overline" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              ${transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>
      )}
      
      {/* Transactions Table with Filters */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="h6" sx={{ mr: 'auto' }}>
            Transactions
          </Typography>
          
          <TextField
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 250 } }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="matched">Matched</MenuItem>
              <MenuItem value="unmatched">Unmatched</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title={`Sort by date (${dateSort === 'desc' ? 'newest first' : 'oldest first'})`}>
            <Button 
              size="small" 
              onClick={handleToggleSort}
              startIcon={dateSort === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            >
              Date
            </Button>
          </Tooltip>
        </Box>
        
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Card</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Receipt</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress size={40} sx={{ my: 3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Loading transactions...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transactions found matching your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
                        {transaction.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.merchantName}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={transaction.cardType}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCardIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                          <Typography variant="body2">{transaction.cardNumber}</Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                        <Typography variant="body2">{transaction.accountName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        size="small" 
                        color={transaction.status === 'Matched' ? 'success' : 'warning'} 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.status === 'Matched' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={transaction.receiptStatus}>
                            {transaction.receiptStatus === 'Verified' ? (
                              <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                            ) : (
                              <WarningIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                            )}
                          </Tooltip>
                          <Typography variant="body2" fontFamily="monospace">
                            {transaction.receiptId}
                          </Typography>
                          {transaction.issue && (
                            <Tooltip title={transaction.issue}>
                              <InfoIcon fontSize="small" color="warning" sx={{ ml: 0.5 }} />
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No receipt
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {transaction.status === 'Matched' ? (
                        <Tooltip title="Unlink receipt">
                          <IconButton 
                            size="small" 
                            onClick={() => handleUnlink(transaction)}
                            color="warning"
                          >
                            <UnlinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Match with receipt">
                          <IconButton 
                            size="small" 
                            onClick={() => handleManualMatch(transaction)}
                            color="primary"
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Manual Match Dialog */}
      <Dialog 
        open={receiptMatchDialogOpen} 
        onClose={() => setReceiptMatchDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>
          Match Transaction with Receipt
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Transaction Details:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedTransaction.id}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                    <Typography variant="body1">{selectedTransaction.date}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Merchant:</Typography>
                    <Typography variant="body1">{selectedTransaction.merchantName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Amount:</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${selectedTransaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Card:</Typography>
                    <Typography variant="body1">{selectedTransaction.cardNumber} ({selectedTransaction.cardType})</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Account Name:</Typography>
                    <Typography variant="body1">{selectedTransaction.accountName}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Typography variant="subtitle1" gutterBottom>
                Available Receipts for Matching:
              </Typography>
              
              {unmatchedReceipts.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No unmatched receipts available. Please upload receipts first.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Receipt ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unmatchedReceipts.map((receipt) => {
                        const amountMatches = receipt.amount === selectedTransaction.amount;
                        const vendorMatches = receipt.vendor.toLowerCase().includes(selectedTransaction.merchantName.toLowerCase()) || 
                                            selectedTransaction.merchantName.toLowerCase().includes(receipt.vendor.toLowerCase());
                        
                        return (
                          <TableRow key={receipt.id} hover>
                            <TableCell>{receipt.id}</TableCell>
                            <TableCell>{receipt.date}</TableCell>
                            <TableCell>
                              {receipt.vendor}
                              {vendorMatches && (
                                <Tooltip title="Vendor name matches">
                                  <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 0.5 }} />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell>{receipt.category}</TableCell>
                            <TableCell align="right">
                              ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {amountMatches && (
                                <Tooltip title="Amount matches exactly">
                                  <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 0.5 }} />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleConfirmMatch(receipt.id)}
                                color={amountMatches && vendorMatches ? "success" : "primary"}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptMatchDialogOpen(false)}>
            Cancel
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

export default CorporateCardIntegration;