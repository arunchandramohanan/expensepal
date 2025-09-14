// DataContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Mock data for expenses - Updated to ensure consistency
const initialMockData = {
  currentMonthlyExpenses: 1950.25, // May expenses - matches monthlyData
  totalExpenses: 18427.86, // Keep for internal calculations
  pendingReports: 3,
  submittedReports: 12,
  approvedReports: 45,
  monthlyTrend: -53.6, // May is lower than April (4200.80 to 1950.25)
  categories: [
    // Initialize with zero values - will be calculated from transactions
    { name: 'Flights', value: 0, icon: 'flight', color: '#0079c1' },
    { name: 'Meals', value: 0, icon: 'restaurant', color: '#ffa500' },
    { name: 'Accommodations', value: 0, icon: 'hotel', color: '#7b1fa2' },
    { name: 'Transportation', value: 0, icon: 'taxi', color: '#2e7d32' },
    { name: 'Miscellaneous', value: 0, icon: 'payments', color: '#c62828' },
  ],
  recentExpenses: [
    { id: 'EXP001', date: '2025-05-20', vendor: 'Delta Airlines', amount: 842.50, category: 'Flights', status: 'Approved' },
    { id: 'EXP002', date: '2025-05-18', vendor: 'Marriott Hotel', amount: 645.80, category: 'Accommodations', status: 'Pending' },
    { id: 'EXP003', date: '2025-05-15', vendor: 'Uber', amount: 54.25, category: 'Transportation', status: 'Approved' },
    { id: 'EXP004', date: '2025-05-12', vendor: 'Ruth\'s Chris Steakhouse', amount: 187.45, category: 'Meals', status: 'Submitted' },
    { id: 'EXP005', date: '2025-05-10', vendor: 'Office Supplies Inc', amount: 85.32, category: 'Miscellaneous', status: 'Approved' },
  ],
  monthlyData: [
    { month: 'Jan', expenses: 2450.75, year: 2025 },
    { month: 'Feb', expenses: 3100.42, year: 2025 },
    { month: 'Mar', expenses: 2850.30, year: 2025 },
    { month: 'Apr', expenses: 4200.80, year: 2025 },
    { month: 'May', expenses: 1950.25, year: 2025 }, // This must match currentMonthlyExpenses
    // Last year's data for future months
    { month: 'Jun', expenses: 2750.60, year: 2024 },
    { month: 'Jul', expenses: 3250.80, year: 2024 },
    { month: 'Aug', expenses: 2950.45, year: 2024 },
    { month: 'Sep', expenses: 3450.20, year: 2024 },
    { month: 'Oct', expenses: 4100.35, year: 2024 },
    { month: 'Nov', expenses: 3800.90, year: 2024 },
    { month: 'Dec', expenses: 4500.75, year: 2024 },
  ],
  policyCompliance: 92.5,
  expensesByDepartment: [
    { department: 'Sales', amount: 5840.25 },
    { department: 'Marketing', amount: 4320.80 },
    { department: 'Engineering', amount: 3650.45 },
    { department: 'Finance', amount: 2750.30 },
    { department: 'Operations', amount: 1866.06 },
  ]
};

// Mock data for budgets
const initialBudgets = [
  {
    id: 'BUD-001',
    name: 'Q2 2025 Travel Budget',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    amount: 50000,
    spent: 18427.86,
    remaining: 31572.14,
    status: 'Active',
    categories: [
      { name: 'Flights', allocation: 20000, spent: 6840.42 },
      { name: 'Accommodations', allocation: 15000, spent: 5320.25 },
      { name: 'Meals', allocation: 8000, spent: 3245.68 },
      { name: 'Transportation', allocation: 5000, spent: 1840.80 },
      { name: 'Miscellaneous', allocation: 2000, spent: 1180.71 }
    ],
    departments: [
      { name: 'Sales', allocation: 20000, spent: 5840.25 },
      { name: 'Marketing', allocation: 15000, spent: 4320.80 },
      { name: 'Engineering', allocation: 10000, spent: 3650.45 },
      { name: 'Finance', allocation: 5000, spent: 2750.30 }
    ]
  },
  {
    id: 'BUD-002',
    name: 'Annual Office Supplies',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    amount: 15000,
    spent: 3845.72,
    remaining: 11154.28,
    status: 'Active',
    categories: [
      { name: 'Stationery', allocation: 5000, spent: 1245.36 },
      { name: 'IT Equipment', allocation: 7000, spent: 1850.21 },
      { name: 'Furniture', allocation: 3000, spent: 750.15 }
    ],
    departments: [
      { name: 'Operations', allocation: 15000, spent: 3845.72 }
    ]
  },
  {
    id: 'BUD-003',
    name: 'Q1 2025 Conference Budget',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    amount: 25000,
    spent: 24568.90,
    remaining: 431.10,
    status: 'Completed',
    categories: [
      { name: 'Registration', allocation: 5000, spent: 4980.00 },
      { name: 'Flights', allocation: 10000, spent: 9856.75 },
      { name: 'Accommodations', allocation: 7000, spent: 6845.30 },
      { name: 'Meals', allocation: 3000, spent: 2886.85 }
    ],
    departments: [
      { name: 'Sales', allocation: 15000, spent: 14741.34 },
      { name: 'Marketing', allocation: 10000, spent: 9827.56 }
    ]
  }
];

// Initial cards data
const initialCards = [
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

// Initial transactions data - Updated to ensure May transactions total exactly 1950.25
const initialTransactions = [
  // May transactions - Total: 1950.25
  // Travel: 683.58 (642.87 + 40.71)
  {
    id: 'TX-54321',
    date: '2025-05-25',
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
    id: 'TX-54331',
    date: '2025-05-15',
    merchantName: 'United Airlines',
    category: 'Travel',
    amount: 40.71,
    status: 'Unmatched',
    cardNumber: '****2345',
    cardType: 'Corporate Mastercard',
    accountName: 'David Rodriguez',
    receiptStatus: null
  },
  // Accommodations: 507.31 (389.54 + 117.77)
  {
    id: 'TX-54322',
    date: '2025-05-24',
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
    id: 'TX-54332',
    date: '2025-05-22',
    merchantName: 'Marriott Hotel',
    category: 'Lodging',
    amount: 117.77,
    status: 'Matched',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    accountName: 'Sarah Johnson',
    receiptStatus: 'Verified',
    receiptId: 'R-10052'
  },
  // Transportation: 350.46 (38.75 + 45.20 + 266.51)
  {
    id: 'TX-54323',
    date: '2025-05-24',
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
    id: 'TX-54327',
    date: '2025-05-20',
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
    id: 'TX-54333',
    date: '2025-05-19',
    merchantName: 'Corporate Car Service',
    category: 'Transportation',
    amount: 266.51,
    status: 'Unmatched',
    cardNumber: '****8901',
    cardType: 'Corporate Amex',
    accountName: 'Michael Chen',
    receiptStatus: null
  },
  // Meals: 214.28 (187.45 + 15.47 + 11.36)
  {
    id: 'TX-54324',
    date: '2025-05-23',
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
    id: 'TX-54326',
    date: '2025-05-21',
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
    id: 'TX-54334',
    date: '2025-05-18',
    merchantName: 'Business Lunch',
    category: 'Meals',
    amount: 11.36,
    status: 'Unmatched',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    accountName: 'Sarah Johnson',
    receiptStatus: null
  },
  // Miscellaneous: 194.62 (85.32 + 109.30)
  {
    id: 'TX-54325',
    date: '2025-05-22',
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
    id: 'TX-54329',
    date: '2025-05-19',
    merchantName: 'Amazon',
    category: 'Office Supplies',
    amount: 109.30,
    status: 'Unmatched',
    cardNumber: '****6789',
    cardType: 'Corporate Visa',
    accountName: 'Emily Wilson',
    receiptStatus: null
  },
  // Previous month transactions (April) for comparison
  {
    id: 'TX-54340',
    date: '2025-04-28',
    merchantName: 'Delta Airlines',
    category: 'Travel',
    amount: 1245.80,
    status: 'Matched',
    cardNumber: '****4567',
    cardType: 'Corporate Visa',
    accountName: 'Sarah Johnson',
    receiptStatus: 'Verified',
    receiptId: 'R-10020'
  },
  {
    id: 'TX-54341',
    date: '2025-04-25',
    merchantName: 'Four Seasons',
    category: 'Lodging',
    amount: 1850.50,
    status: 'Matched',
    cardNumber: '****8901',
    cardType: 'Corporate Amex',
    accountName: 'Michael Chen',
    receiptStatus: 'Verified',
    receiptId: 'R-10021'
  },
  {
    id: 'TX-54342',
    date: '2025-04-20',
    merchantName: 'Enterprise Car Rental',
    category: 'Transportation',
    amount: 550.25,
    status: 'Matched',
    cardNumber: '****2345',
    cardType: 'Corporate Mastercard',
    accountName: 'David Rodriguez',
    receiptStatus: 'Verified',
    receiptId: 'R-10022'
  },
  {
    id: 'TX-54343',
    date: '2025-04-15',
    merchantName: 'Business Dinner',
    category: 'Meals',
    amount: 554.25,
    status: 'Matched',
    cardNumber: '****6789',
    cardType: 'Corporate Visa',
    accountName: 'Emily Wilson',
    receiptStatus: 'Verified',
    receiptId: 'R-10023'
  }
];

// Initial unmatched receipts
const initialUnmatchedReceipts = [
  {
    id: 'R-10049',
    date: '2025-05-25',
    vendor: 'Delta Airlines',
    amount: 642.87,
    category: 'Travel',
    status: 'Unmatched'
  },
  {
    id: 'R-10050',
    date: '2025-05-22',
    vendor: 'Office Depot',
    amount: 85.32,
    category: 'Office Supplies',
    status: 'Unmatched'
  },
  {
    id: 'R-10051',
    date: '2025-05-21',
    vendor: 'Starbucks',
    amount: 15.47,
    category: 'Meals',
    status: 'Unmatched'
  }
];

// Initial reports
const initialReports = [];

// Create the context
const DataContext = createContext();

// Create the provider component
export const DataProvider = ({ children }) => {
  // State for all data
  const [dashboardData, setDashboardData] = useState(initialMockData);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [cards, setCards] = useState(initialCards);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [unmatchedReceipts, setUnmatchedReceipts] = useState(initialUnmatchedReceipts);
  const [reports, setReports] = useState(initialReports);
  const [reportItems, setReportItems] = useState([]);

  // Helper function to get current month from date
  const getCurrentMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    console.log('Current date:', now);
    console.log('Current month index:', now.getMonth());
    console.log('Current month name:', months[now.getMonth()]);
    return months[now.getMonth()];
  };

  // Helper function to update dashboard data based on other state changes
  const updateDashboardData = () => {
    // Get current month from the date
    const currentMonth = getCurrentMonth();
    console.log('=== UPDATE DASHBOARD DATA ===');
    console.log('Current month:', currentMonth);
    
    // Calculate category spending for current month only
    const categoryMap = {
      'Travel': 'Flights',
      'Lodging': 'Accommodations',
      'Transportation': 'Transportation',
      'Meals': 'Meals',
      'Office Supplies': 'Miscellaneous'
    };
    
    // Get current year and month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth(); // 0-based (0 = January, 4 = May)
    console.log('Current year:', currentYear, 'Current month number:', currentMonthNum);
    
    // Filter transactions for the current month
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonthNum && txDate.getFullYear() === currentYear;
    });
    
    console.log('Current month transactions count:', currentMonthTransactions.length);
    console.log('Current month transactions:', currentMonthTransactions.map(tx => ({ date: tx.date, amount: tx.amount, category: tx.category })));
    
    // Update categories based on current month transactions
    const updatedCategories = dashboardData.categories.map(cat => ({ ...cat, value: 0 }));
    
    currentMonthTransactions.forEach(tx => {
      const categoryName = categoryMap[tx.category] || 'Miscellaneous';
      const category = updatedCategories.find(c => c.name === categoryName);
      if (category) {
        category.value += tx.amount;
        console.log(`Added ${tx.amount} to ${categoryName} for transaction:`, tx.merchantName);
      } else {
        console.log('No category found for:', categoryName, 'Original category:', tx.category);
      }
    });
    
    // Calculate the total of current month transactions
    const categoriesTotal = updatedCategories.reduce((sum, cat) => sum + cat.value, 0);
    console.log('Categories total:', categoriesTotal);
    console.log('Updated categories:', updatedCategories);
    
    // This is the current month's expenses - should match bar chart and donut chart
    const currentMonthlyExpenses = categoriesTotal;
    
    // Calculate previous month expenses for trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = months.indexOf(currentMonth);
    const previousMonth = months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1];
    const previousMonthData = dashboardData.monthlyData.find(item => item.month === previousMonth);
    const previousMonthlyExpenses = previousMonthData ? previousMonthData.expenses : 0;
    console.log('Previous month:', previousMonth, 'Previous monthly expenses:', previousMonthlyExpenses);
    
    // Calculate trend percentage
    let monthlyTrend = 0;
    if (previousMonthlyExpenses > 0) {
      monthlyTrend = ((currentMonthlyExpenses - previousMonthlyExpenses) / previousMonthlyExpenses) * 100;
    }
    console.log('Monthly trend:', monthlyTrend + '%');
    
    // Update the monthlyData array to reflect the actual transaction total
    const updatedMonthlyData = dashboardData.monthlyData.map(item => 
      item.month === currentMonth 
        ? { ...item, expenses: currentMonthlyExpenses }
        : item
    );
    
    console.log('Updated monthly expenses for', currentMonth, ':', currentMonthlyExpenses);
    
    // Count reports by status
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const submittedReports = reports.filter(r => r.status === 'submitted').length;
    const approvedReports = reports.filter(r => r.status === 'approved').length;
    
    // Update recent expenses based on latest transactions (take the first 5)
    const recentExpenses = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(tx => ({
        id: tx.id,
        date: tx.date,
        vendor: tx.merchantName,
        amount: tx.amount,
        category: tx.category,
        status: tx.status === 'Matched' ? 'Approved' : 'Pending'
      }));
    
    // Calculate total expenses (all time)
    const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Update expenses by department
    const departmentSpending = {};
    transactions.forEach(tx => {
      const card = cards.find(c => c.cardNumber === tx.cardNumber);
      if (card) {
        const dept = card.department;
        departmentSpending[dept] = (departmentSpending[dept] || 0) + tx.amount;
      }
    });
    
    const expensesByDepartment = Object.entries(departmentSpending).map(([department, amount]) => ({
      department,
      amount
    }));
    
    // Always update dashboard data with current values
    setDashboardData(prev => ({
      ...prev,
      currentMonthlyExpenses, // This should be the sum of current month transactions
      totalExpenses,
      pendingReports,
      submittedReports,
      approvedReports,
      monthlyTrend: Number(monthlyTrend.toFixed(2)),
      monthlyData: updatedMonthlyData, // Updated monthly data with correct current month value
      categories: updatedCategories, // Categories calculated from current month transactions
      recentExpenses,
      expensesByDepartment
    }));
  };

  // Update dashboard data whenever relevant state changes
  useEffect(() => {
    console.log('=== useEffect TRIGGERED ===');
    console.log('Number of transactions:', transactions.length);
    console.log('Number of reports:', reports.length);
    console.log('Number of cards:', cards.length);
    updateDashboardData();
  }, [transactions, reports, cards]);

  // Update budget spending based on transactions
  useEffect(() => {
    const updateBudgets = () => {
      const updatedBudgets = budgets.map(budget => {
        // Calculate total spent amount
        const spent = transactions.reduce((sum, tx) => {
          // Check if transaction is within the budget's time period
          const txDate = new Date(tx.date);
          const startDate = new Date(budget.startDate);
          const endDate = new Date(budget.endDate);
          
          if (txDate >= startDate && txDate <= endDate) {
            return sum + tx.amount;
          }
          return sum;
        }, 0);
        
        // Calculate remaining amount
        const remaining = budget.amount - spent;
        
        // Update category spending
        const updatedCategories = budget.categories.map(category => {
          // Find transactions that match this category
          const categorySpent = transactions.reduce((sum, tx) => {
            const txDate = new Date(tx.date);
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            
            if (txDate >= startDate && txDate <= endDate && 
                (tx.category === category.name || 
                 (tx.category === 'Travel' && category.name === 'Flights') ||
                 (tx.category === 'Lodging' && category.name === 'Accommodations'))) {
              return sum + tx.amount;
            }
            return sum;
          }, 0);
          
          return {
            ...category,
            spent: categorySpent
          };
        });
        
        // Update department spending
        const updatedDepartments = budget.departments.map(department => {
          // Find transactions that match this department
          const departmentSpent = transactions.reduce((sum, tx) => {
            const txDate = new Date(tx.date);
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            
            // Find the card for this transaction to get the department
            const card = cards.find(c => c.cardNumber === tx.cardNumber);
            
            if (txDate >= startDate && txDate <= endDate && 
                card && card.department === department.name) {
              return sum + tx.amount;
            }
            return sum;
          }, 0);
          
          return {
            ...department,
            spent: departmentSpent
          };
        });
        
        return {
          ...budget,
          spent,
          remaining,
          categories: updatedCategories,
          departments: updatedDepartments
        };
      });
      
      setBudgets(updatedBudgets);
    };
    
    updateBudgets();
  }, [transactions, cards]);

  // Function to add a new expense report
  const addReport = (report) => {
    setReports(prev => [report, ...prev]);
    // Clear report items after submission
    setReportItems([]);
  };

  // Function to add an expense to the current report
  const addToReport = (item) => {
    setReportItems(prev => [...prev, item]);
  };

  // Function to remove an expense from the current report
  const removeFromReport = (itemId) => {
    setReportItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Function to add a new transaction
  const addTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  // Function to update a transaction's status
  const updateTransactionStatus = (transactionId, status, receiptId = null, receiptStatus = null) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { 
              ...tx, 
              status, 
              receiptId, 
              receiptStatus 
            } 
          : tx
      )
    );
  };

  // Function to add a new unmatched receipt
  const addUnmatchedReceipt = (receipt) => {
    setUnmatchedReceipts(prev => [receipt, ...prev]);
  };

  // Function to remove an unmatched receipt (when matched with transaction)
  const removeUnmatchedReceipt = (receiptId) => {
    setUnmatchedReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
  };

  // Function to update a card
  const updateCard = (updatedCard) => {
    setCards(prev => 
      prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    );
  };

  // Function to add a new card
  const addCard = (card) => {
    setCards(prev => [...prev, card]);
  };

  // Function to update a budget
  const updateBudget = (updatedBudget) => {
    setBudgets(prev => 
      prev.map(budget => 
        budget.id === updatedBudget.id ? updatedBudget : budget
      )
    );
  };

  // Function to add a new budget
  const addBudget = (budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  // Function to delete a budget
  const deleteBudget = (budgetId) => {
    setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
  };

  // Match a transaction with a receipt
  const matchTransactionWithReceipt = (transactionId, receiptId) => {
    // Update transaction status
    updateTransactionStatus(transactionId, 'Matched', receiptId, 'Verified');
    
    // Remove receipt from unmatched receipts
    removeUnmatchedReceipt(receiptId);
  };

  // Unmatch a transaction from a receipt
  const unmatchTransaction = (transactionId, receiptData) => {
    // Get transaction data before updating
    const transaction = transactions.find(tx => tx.id === transactionId);
    
    if (transaction && transaction.receiptId) {
      // Add the receipt back to unmatched receipts
      addUnmatchedReceipt({
        id: transaction.receiptId,
        date: transaction.date,
        vendor: transaction.merchantName,
        amount: transaction.amount,
        category: transaction.category,
        status: 'Unmatched'
      });
      
      // Update transaction status
      updateTransactionStatus(transactionId, 'Unmatched', null, null);
    }
  };

  // Update report status
  const updateReportStatus = (reportId, status, approvalDetails = null) => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status, 
              approvalDetails,
              updatedAt: new Date().toISOString()
            } 
          : report
      )
    );
  };

  return (
    <DataContext.Provider value={{
      // Dashboard data
      dashboardData,
      setDashboardData,
      
      // Budgets
      budgets,
      setBudgets,
      updateBudget,
      addBudget,
      deleteBudget,
      
      // Cards
      cards,
      setCards,
      updateCard,
      addCard,
      
      // Transactions
      transactions,
      setTransactions,
      addTransaction,
      updateTransactionStatus,
      
      // Unmatched receipts
      unmatchedReceipts,
      setUnmatchedReceipts,
      addUnmatchedReceipt,
      removeUnmatchedReceipt,
      
      // Reports
      reports,
      setReports,
      addReport,
      updateReportStatus,
      
      // Report items (current report being created)
      reportItems,
      setReportItems,
      addToReport,
      removeFromReport,
      
      // Combined functions
      matchTransactionWithReceipt,
      unmatchTransaction,
      
      // Utility function to update dashboard
      updateDashboardData
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Create a custom hook to use the data context
export const useData = () => useContext(DataContext);