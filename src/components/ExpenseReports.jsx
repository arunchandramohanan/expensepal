import React, { useState, useEffect } from 'react';
import {
  Box, // Removed leading space
  Typography, // Removed leading space
  Paper, // Removed leading space
  Table, // Removed leading space
  TableBody, // Removed leading space
  TableCell, // Removed leading space
  TableContainer, // Removed leading space
  TableHead, // Removed leading space
  TableRow, // Removed leading space
  Chip, // Removed leading space
  Button, // Removed leading space
  IconButton, // Removed leading space
  Dialog, // Removed leading space
  DialogTitle, // Removed leading space
  DialogContent, // Removed leading space
  DialogActions, // Removed leading space
  Stack, // Removed leading space
  Divider, // Removed leading space
  List, // Removed leading space (Not used, but kept for potential future use)
  ListItem, // Removed leading space (Not used)
  ListItemText, // Removed leading space (Not used)
  TablePagination, // Removed leading space
  TextField, // Removed leading space
  FormControl, // Removed leading space
  InputLabel, // Removed leading space
  Select, // Removed leading space
  MenuItem, // Removed leading space
  Stepper, // Removed leading space
  Step, // Removed leading space
  StepLabel, // Removed leading space
  Alert, // Removed leading space
  Tooltip, // Removed leading space
  CircularProgress, // Removed leading space
  Grid // Removed leading space
} from '@mui/material';
import {
  Description as DescriptionIcon, // Removed leading space
  ArrowForward as ArrowForwardIcon, // Removed leading space (Not used)
  Visibility as VisibilityIcon, // Removed leading space
  Print as PrintIcon, // Removed leading space
  FileDownload as DownloadIcon, // Removed leading space
  Check as CheckIcon, // Removed leading space
  Close as CloseIcon, // Removed leading space
  AccountBalance as BankIcon, // Removed leading space (Not used)
  CreditCard as CreditCardIcon, // Removed leading space
  Person as PersonIcon, // Removed leading space
  Money as MoneyIcon, // Removed leading space (Not used)
  Launch as LaunchIcon, // Removed leading space (Not used)
  Payments as PaymentsIcon, // Removed leading space
  AccessTime as ClockIcon, // Removed leading space (Not used)
  Edit as EditIcon // Removed leading space (Not used)
} from '@mui/icons-material';

// Import data context
import { useData } from './DataContext';

const ExpenseReports = () => {
  // Get data from context
  const { reports, updateReportStatus } = useData(); // Removed leading space from reports

  // State variables
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reimbursementDialogOpen, setReimbursementDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [reimbursementStep, setReimbursementStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Reset pagination when reports change
  useEffect(() => {
    setPage(0);
  }, [reports]);

  // Get status color based on report status
  const getStatusColor = (status) => { // Removed leading space
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
      case 'submitted':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'reimbursed':
        return 'info';
      default:
        return 'default';
    }
  };

  // Handle dialog open
  const handleViewDetails = (report) => { // Removed leading space
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  // Handle dialog close
  const handleCloseDetails = () => { // Removed leading space
    setDetailsOpen(false);
    // Optionally reset selectedReport after dialog closes
    // setTimeout(() => setSelectedReport(null), 300); // Delay allows fade out
  };

  // Handle pagination changes
  const handleChangePage = (event, newPage) => { // Removed leading space
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => { // Removed leading space
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open reimbursement dialog
  const handleOpenReimbursement = (report) => { // Removed leading space
    setSelectedReport(report);
    setReimbursementDialogOpen(true);
    // Reset form state for new reimbursement process
    setReimbursementStep(0);
    setPaymentMethod('');
    setBankAccount('');
    setPaymentNote('');
    setProcessingPayment(false); // Ensure processing state is reset
    setPaymentComplete(false);
  };

  // Close reimbursement dialog
  const handleCloseReimbursement = () => { // Removed leading space
    setReimbursementDialogOpen(false);
    // In a real app, data might refresh automatically via context or state management
    // If not, you might trigger a manual refresh here if payment was completed
    // Optionally reset selectedReport after dialog closes
    // setTimeout(() => setSelectedReport(null), 300);
  };

  // Handle next step in reimbursement
  const handleNextReimbursementStep = () => { // Removed leading space
    if (reimbursementStep < 2) {
      setReimbursementStep(reimbursementStep + 1);
    } else {
      // Process payment (Step 2 -> Confirmation -> Process)
      setProcessingPayment(true);
      setPaymentComplete(false); // Ensure complete state is false while processing

      // Simulate payment processing API call
      setTimeout(() => {
        setProcessingPayment(false);
        setPaymentComplete(true); // Set complete after simulated success

        // Update report status via context
        if (selectedReport) {
          const reimbursementData = {
            date: new Date().toISOString(),
            method: paymentMethod,
            account: bankAccount, // May be empty depending on method
            note: paymentNote
          };
          updateReportStatus(selectedReport.id, 'reimbursed', reimbursementData);

          // Update the local state for the selected report (optional, context might handle this)
          // setSelectedReport(prev => prev ? {
          //   ...prev,
          //   status: 'reimbursed',
          //   reimbursementDetails: reimbursementData
          // } : null);
        }
      }, 2000); // Simulate 2 second delay
    }
  };

  // Handle back step in reimbursement
  const handleBackReimbursementStep = () => { // Removed leading space
    if (reimbursementStep > 0) {
      setReimbursementStep(reimbursementStep - 1);
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e) => { // Removed leading space
    setPaymentMethod(e.target.value);
    // Reset bank account if method changes away from one needing it
    if (e.target.value !== 'Direct Deposit' && e.target.value !== 'Wire Transfer') {
        setBankAccount('');
    }
  };

  // Handle bank account change
  const handleBankAccountChange = (e) => { // Removed leading space
    setBankAccount(e.target.value);
  };

  // Format date
  const formatDate = (dateString) => { // Removed leading space
    if (!dateString) return 'N/A'; // Handle null/undefined dates
    try {
        const date = new Date(dateString);
        // Check if date is valid before formatting
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString(undefined, { // Use user's locale
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
  };

  // Open approve dialog
  const handleOpenApprove = (report) => { // Removed leading space
    setSelectedReport(report);
    setApproveDialogOpen(true);
  };

  // Close approve dialog
  const handleCloseApprove = () => { // Removed leading space
    setApproveDialogOpen(false);
    // Optionally reset selectedReport after dialog closes
    // setTimeout(() => setSelectedReport(null), 300);
  };

  // Handle approve report
  const handleApproveReport = () => { // Removed leading space
    if (selectedReport) {
      const approvalData = {
        date: new Date().toISOString(),
        approver: 'Finance Manager' // Should ideally come from logged-in user context
      };
      updateReportStatus(selectedReport.id, 'approved', approvalData);

      // Update the local state for the selected report (optional)
      // setSelectedReport(prev => prev ? {
      //   ...prev,
      //   status: 'approved',
      //   approvalDetails: approvalData
      // } : null);
    }
    setApproveDialogOpen(false); // Close dialog after action
  };

  // Handle reject report
  const handleRejectReport = () => { // Removed leading space
    // In a real app, you'd likely have a reason field for rejection
    if (selectedReport) {
      const rejectionData = {
        date: new Date().toISOString(),
        approver: 'Finance Manager', // Should ideally come from logged-in user context
        reason: 'Rejected by manager' // Example reason
      };
      updateReportStatus(selectedReport.id, 'rejected', rejectionData);

      // Update the local state for the selected report (optional)
      // setSelectedReport(prev => prev ? {
      //   ...prev,
      //   status: 'rejected',
      //   approvalDetails: rejectionData // Store rejection details too
      // } : null);
    }
    setApproveDialogOpen(false); // Close dialog after action
  };


  // Get card icon based on card number (Placeholder)
  const getCardTypeIcon = (cardNumber) => { // Removed leading space
    if (!cardNumber) return null;
    // Simple placeholder logic
    // In a real app, use BIN ranges to determine Visa, Mastercard, Amex etc.
    return <CreditCardIcon fontSize="small" color="primary" />;
  };


  // If there are no reports yet
  if (!reports || reports.length === 0) { // Added check for null/undefined reports array
    return (
      <Box sx={{ p: 3, height: 'calc(100vh - 64px)', overflow: 'auto' }}> {/* Adjust height if needed */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="medium" gutterBottom>
            Expense Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage submitted expense reports
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 5,
            textAlign: 'center',
            minHeight: 300 // Ensure it takes some space
          }}
        >
          <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No expense reports found</Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't submitted any expense reports yet. Once you create and submit reports, they'll appear here.
          </Typography>
          {/* Optional: Add a button to navigate to create report page */}
          {/* <Button variant="contained" sx={{ mt: 3 }}>Create New Report</Button> */}
        </Paper>
      </Box>
    );
  }

  // Calculate pagination variables
  const count = reports.length;
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - count) : 0;
  const visibleReports = reports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, height: 'calc(100vh - 64px)', overflow: 'auto' }}> {/* Adjust height and add responsive padding */}
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography variant="h5" fontWeight="medium" gutterBottom>
          Expense Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage submitted expense reports ({count} total)
        </Typography>
      </Box>

      {/* Reports Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 900 }} aria-label="expense reports table"> {/* Increased minWidth */}
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}> {/* Use theme variable */}
              <TableCell><Typography variant="caption" fontWeight="bold">Report ID</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">Date</Typography></TableCell>
              <TableCell sx={{ width: '20%' }}><Typography variant="caption" fontWeight="bold">Title</Typography></TableCell> {/* Added width hint */}
              <TableCell><Typography variant="caption" fontWeight="bold">Cost Code</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">Card</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">Account</Typography></TableCell>
              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Amount</Typography></TableCell>
              <TableCell align="center"><Typography variant="caption" fontWeight="bold">Items</Typography></TableCell> {/* Centered */}
              <TableCell><Typography variant="caption" fontWeight="bold">Status</Typography></TableCell>
              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleReports.map((report) => (
              <TableRow key={report.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ py: 1 }}> {/* Reduced padding */}
                    <Tooltip title={report.id}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 80 }}>{report.id}</Typography>
                    </Tooltip>
                </TableCell>
                <TableCell sx={{ py: 1 }}>{formatDate(report.createdAt)}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Tooltip title={report.title}>
                    <Typography
                      variant="body2" // Use body2 for consistency
                      sx={{
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block' // Ensure it behaves like a block for ellipsis
                      }}
                    >
                      {report.title}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    label={report.costCode || 'N/A'}
                    size="small"
                    // color="primary" // Use default or specific color logic if needed
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  {report.cardInfo ? (
                    <Tooltip title={`Card: ${report.cardInfo.cardNumber}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getCardTypeIcon(report.cardInfo.cardNumber) || <CreditCardIcon fontSize="small" sx={{ mr: 0.5 }} />}
                            <Typography variant="body2" noWrap>
                                {report.cardInfo.cardNumber?.slice(-4) || '****'} {/* Show last 4 digits */}
                            </Typography>
                        </Box>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  {report.cardInfo ? (
                    <Tooltip title={`Account: ${report.cardInfo.accountName}`}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                          {report.cardInfo.accountName}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                        ${parseFloat(report.totalAmount || 0).toFixed(2)} {/* Added default 0 */}
                    </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}> {/* Centered */}
                  {report.items?.length || 0} {/* Added default 0 and optional chaining */}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    label={report.status}
                    size="small"
                    color={getStatusColor(report.status)}
                  />
                </TableCell>
                <TableCell align="right" sx={{ py: 1 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end"> {/* Reduced spacing */}
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(report)}
                        >
                            <VisibilityIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    {report.status === 'submitted' && (
                      <Tooltip title="Approve / Reject">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleOpenApprove(report)}
                        >
                          <CheckIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Allow reimbursement only if approved AND not paid via card */}
                    {report.status === 'approved' && !report.cardInfo && (
                      <Tooltip title="Process Reimbursement">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenReimbursement(report)}
                        >
                          <PaymentsIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    )}
                     {/* Add placeholder Print/Download buttons */}
                    <Tooltip title="Print Report">
                        <IconButton size="small" color="default" onClick={() => alert('Print functionality not implemented.')}>
                            <PrintIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Report">
                        <IconButton size="small" color="default" onClick={() => alert('Download functionality not implemented.')}>
                            <DownloadIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 41 * emptyRows }}> {/* Adjusted height */}
                <TableCell colSpan={10} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]} // Added 50
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          // Use smaller text for pagination controls if needed
          // sx={{ '.MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel': { fontSize: '0.8rem' }}}
        />
      </TableContainer>

      {/* Report Details Dialog */}
      {selectedReport && (
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          scroll="paper" // Allow content scroll
        >
          <DialogTitle sx={{ pb: 1 }}> {/* Reduced padding */}
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6">{selectedReport.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {formatDate(selectedReport.createdAt)} · ID: {selectedReport.id}
                    </Typography>
                </Box>
                 <Chip
                    label={selectedReport.status}
                    color={getStatusColor(selectedReport.status)}
                    size="small"
                />
             </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}> {/* Added top padding */}
             {/* Use Grid for layout */}
            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={5}>
                    <Typography variant="subtitle1" gutterBottom>Details</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                         <Typography variant="caption" color="text.secondary">Description</Typography>
                         <Typography variant="body2" paragraph>
                             {selectedReport.description || "No description provided."}
                         </Typography>

                         <Typography variant="caption" color="text.secondary">Cost Code</Typography>
                         <Chip
                            label={selectedReport.costCode || 'N/A'}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                        />
                    </Paper>

                    {selectedReport.cardInfo && (
                      <>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Card Used</Typography>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {getCardTypeIcon(selectedReport.cardInfo.cardNumber) || <CreditCardIcon fontSize="small" sx={{ mr: 1 }} />}
                                <Typography variant="body1" fontWeight="medium">
                                    {selectedReport.cardInfo.cardNumber}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body1">
                                    {selectedReport.cardInfo.accountName}
                                </Typography>
                            </Box>
                        </Paper>
                      </>
                    )}

                    {/* Show Approval/Rejection Details if present */}
                    {selectedReport.approvalDetails && (
                         <>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                {selectedReport.status === 'rejected' ? 'Rejection Details' : 'Approval Details'}
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Date:</Typography>
                                <Typography variant="body2" gutterBottom>{formatDate(selectedReport.approvalDetails.date)}</Typography>
                                <Typography variant="caption" color="text.secondary">By:</Typography>
                                <Typography variant="body2" gutterBottom>{selectedReport.approvalDetails.approver}</Typography>
                                {selectedReport.status === 'rejected' && selectedReport.approvalDetails.reason && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">Reason:</Typography>
                                        <Typography variant="body2">{selectedReport.approvalDetails.reason}</Typography>
                                    </>
                                )}
                            </Paper>
                         </>
                    )}

                    {/* Show Reimbursement Details if present */}
                    {selectedReport.reimbursementDetails && (
                        <>
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Reimbursement</Typography>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Date:</Typography>
                                <Typography variant="body2" gutterBottom>{formatDate(selectedReport.reimbursementDetails.date)}</Typography>
                                <Typography variant="caption" color="text.secondary">Method:</Typography>
                                <Typography variant="body2" gutterBottom>{selectedReport.reimbursementDetails.method}</Typography>
                                {selectedReport.reimbursementDetails.account && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">Account:</Typography>
                                        <Typography variant="body2" gutterBottom>{selectedReport.reimbursementDetails.account}</Typography>
                                    </>
                                )}
                                {selectedReport.reimbursementDetails.note && (
                                    <>
                                        <Typography variant="caption" color="text.secondary">Note:</Typography>
                                        <Typography variant="body2">{selectedReport.reimbursementDetails.note}</Typography>
                                    </>
                                )}
                            </Paper>
                        </>
                    )}
                </Grid>

                {/* Right Column */}
                 <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                        <Typography variant="subtitle1">Expense Items ({selectedReport.items?.length || 0})</Typography>
                        <Box>
                            <Typography variant="caption" display="block" textAlign="right">Total Amount</Typography>
                            <Typography variant="h6" fontWeight="bold">
                                ${parseFloat(selectedReport.totalAmount || 0).toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell><Typography variant="caption">Date</Typography></TableCell>
                            {/* <TableCell><Typography variant="caption">Invoice #</Typography></TableCell> */}
                            <TableCell><Typography variant="caption">Vendor</Typography></TableCell>
                            <TableCell><Typography variant="caption">Type</Typography></TableCell>
                            <TableCell align="right"><Typography variant="caption">Amount</Typography></TableCell>
                            <TableCell><Typography variant="caption">Card</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(selectedReport.items || []).map((item, index) => ( // Added default empty array
                            <TableRow key={item.id || index}> {/* Prefer item.id if available */}
                              <TableCell>{formatDate(item.date)}</TableCell> {/* Use formatDate */}
                              {/* <TableCell>{item.invoiceNumber || '—'}</TableCell> */}
                              <TableCell>{item.vendor || '—'}</TableCell>
                              <TableCell>{item.expenseType || '—'}</TableCell>
                              <TableCell align="right">
                                  {item.currency}{parseFloat(item.total || item.amount || 0).toFixed(2)} {/* Handle total or amount */}
                              </TableCell>
                              <TableCell>
                                {item.matchedTransactionId ? (
                                    <Tooltip title={`Matched: ${item.matchedTransactionId}`}>
                                        <CreditCardIcon fontSize="small" color="primary" />
                                    </Tooltip>
                                ) : selectedReport.cardInfo ? (
                                    <Tooltip title="Possible Match (Report uses Card)">
                                        <CreditCardIcon fontSize="small" color="disabled" />
                                    </Tooltip>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">—</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                 </Grid>
            </Grid>


          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => alert('Print functionality not implemented.')}>
              Print
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => alert('Download functionality not implemented.')}>
              Download PDF
            </Button>
            {/* Action buttons can be added here too if needed, e.g., Approve/Reject */}
          </DialogActions>
        </Dialog>
      )}

      {/* Approve/Reject Dialog */}
      {selectedReport && (
        <Dialog
          open={approveDialogOpen}
          onClose={handleCloseApprove}
          maxWidth="xs" // Made smaller
          fullWidth
        >
          <DialogTitle>Review Report</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
              Review details for report <strong>{selectedReport.id}</strong> ({selectedReport.title}) totaling <strong>${parseFloat(selectedReport.totalAmount || 0).toFixed(2)}</strong>.
            </Typography>
            {/* Add reason field for rejection */}
            {/* <TextField label="Reason for Rejection (if rejecting)" fullWidth multiline rows={3} sx={{ mt: 2 }} /> */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please approve or reject this expense report.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseApprove}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectReport}
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
            >
              Reject
            </Button>
            <Button
              onClick={handleApproveReport}
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Reimbursement Dialog */}
      {selectedReport && (
        <Dialog
          open={reimbursementDialogOpen}
          onClose={handleCloseReimbursement}
          maxWidth="sm" // Adjusted size
          fullWidth
        >
          <DialogTitle>
            {paymentComplete ? 'Reimbursement Complete' : 'Process Reimbursement'}
          </DialogTitle>
          <DialogContent dividers>
            {paymentComplete ? (
              // Payment Complete View
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Reimbursement Processed
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Payment of <strong>${parseFloat(selectedReport.totalAmount || 0).toFixed(2)}</strong> has been successfully processed.
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 1, textAlign: 'left' }}> {/* Left align text */}
                  <Typography variant="caption" color="text.secondary">Date:</Typography>
                  <Typography variant="body2" gutterBottom>{formatDate(new Date().toISOString())}</Typography>
                  <Typography variant="caption" color="text.secondary">Method:</Typography>
                  <Typography variant="body2" gutterBottom>{paymentMethod}</Typography>
                  {bankAccount && (
                    <>
                      <Typography variant="caption" color="text.secondary">Account:</Typography>
                      <Typography variant="body2" gutterBottom>{bankAccount}</Typography>
                    </>
                  )}
                  {paymentNote && (
                    <>
                      <Typography variant="caption" color="text.secondary">Note:</Typography>
                      <Typography variant="body2">{paymentNote}</Typography>
                    </>
                  )}
                </Paper>
              </Box>
            ) : (
              // Stepper View
              <Box>
                <Stepper activeStep={reimbursementStep} alternativeLabel sx={{ mb: 4 }}> {/* Use alternativeLabel */}
                  <Step key="details">
                    <StepLabel>Details</StepLabel>
                  </Step>
                  <Step key="method">
                    <StepLabel>Payment Method</StepLabel>
                  </Step>
                  <Step key="confirm">
                    <StepLabel>Confirm</StepLabel>
                  </Step>
                </Stepper>

                {/* Step Content */}
                {reimbursementStep === 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Report & Payee Info</Typography>
                     <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                       <Grid container spacing={1}>
                         <Grid item xs={6}><Typography variant="caption" color="text.secondary">Report ID:</Typography></Grid>
                         <Grid item xs={6}><Typography variant="body2">{selectedReport.id}</Typography></Grid>
                         <Grid item xs={6}><Typography variant="caption" color="text.secondary">Title:</Typography></Grid>
                         <Grid item xs={6}><Typography variant="body2">{selectedReport.title}</Typography></Grid>
                         <Grid item xs={6}><Typography variant="caption" color="text.secondary">Amount:</Typography></Grid>
                         <Grid item xs={6}><Typography variant="body2" fontWeight="medium">${parseFloat(selectedReport.totalAmount || 0).toFixed(2)}</Typography></Grid>
                       </Grid>
                     </Paper>
                     <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Employee:</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">John Doe (Hardcoded)</Typography></Grid> {/* Added note */}
                            <Grid item xs={6}><Typography variant="caption" color="text.secondary">Employee ID:</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">EMP-12345 (Hardcoded)</Typography></Grid>
                        </Grid>
                     </Paper>
                  </Box>
                )}

                {reimbursementStep === 1 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Select Payment Method</Typography>
                    <FormControl fullWidth required margin="normal">
                      <InputLabel id="payment-method-label">Payment Method</InputLabel>
                      <Select
                        labelId="payment-method-label"
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        label="Payment Method"
                      >
                        <MenuItem value="Direct Deposit">Direct Deposit</MenuItem>
                        <MenuItem value="Check">Check</MenuItem>
                        <MenuItem value="Wire Transfer">Wire Transfer</MenuItem>
                        <MenuItem value="PayPal">PayPal</MenuItem>
                      </Select>
                    </FormControl>

                    {(paymentMethod === 'Direct Deposit' || paymentMethod === 'Wire Transfer') && (
                        <FormControl fullWidth required margin="normal">
                          <InputLabel id="bank-account-label">Bank Account</InputLabel>
                          <Select
                            labelId="bank-account-label"
                            value={bankAccount}
                            onChange={handleBankAccountChange}
                            label="Bank Account"
                          >
                             {/* Ideally fetch accounts from employee profile */}
                            <MenuItem value="**** 1234 - Checking (Hardcoded)">**** 1234 - Checking (Hardcoded)</MenuItem>
                            <MenuItem value="**** 5678 - Savings (Hardcoded)">**** 5678 - Savings (Hardcoded)</MenuItem>
                            {/* <MenuItem value="Add New Account">+ Add New Account</MenuItem> */}
                          </Select>
                        </FormControl>
                    )}
                    {paymentMethod === 'PayPal' && (
                       <TextField
                         label="PayPal Email (from profile)"
                         value="john.doe@example.com (Hardcoded)" // Should come from employee profile
                         fullWidth
                         disabled
                         margin="normal"
                       />
                    )}
                    {paymentMethod === 'Check' && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        A check will be issued and mailed to the employee's address on file.
                      </Alert>
                    )}

                    <TextField
                      label="Payment Note (Optional)"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      margin="normal"
                    />
                  </Box>
                )}

                {reimbursementStep === 2 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Confirm Payment</Typography>
                     <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                       <Grid container spacing={1}>
                         <Grid item xs={6}><Typography variant="caption" color="text.secondary">Amount:</Typography></Grid>
                         <Grid item xs={6}><Typography variant="h6" color="primary">${parseFloat(selectedReport.totalAmount || 0).toFixed(2)}</Typography></Grid>
                         <Grid item xs={6}><Typography variant="caption" color="text.secondary">Method:</Typography></Grid>
                         <Grid item xs={6}><Typography variant="body2">{paymentMethod}</Typography></Grid>
                         {bankAccount && (
                            <>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Account:</Typography></Grid>
                                <Grid item xs={6}><Typography variant="body2">{bankAccount}</Typography></Grid>
                            </>
                         )}
                         <Grid item xs={6}><Typography variant="caption" color="text.secondary">Payee:</Typography></Grid>
                         <Grid item xs={6}><Typography variant="body2">John Doe (EMP-12345)</Typography></Grid>
                         {paymentNote && (
                           <>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Note:</Typography></Grid>
                                <Grid item xs={6}><Typography variant="body2">{paymentNote}</Typography></Grid>
                           </>
                         )}
                       </Grid>
                     </Paper>
                    <Alert severity="warning">
                      Review carefully. Once confirmed, the payment will be processed.
                    </Alert>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}> {/* Added padding */}
            {paymentComplete ? (
              <Button
                onClick={handleCloseReimbursement}
                variant="contained"
                fullWidth // Make Done button prominent
              >
                Done
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCloseReimbursement}
                >
                  Cancel
                </Button>
                <Box sx={{ flexGrow: 1 }} /> {/* Push buttons apart */}
                {reimbursementStep > 0 && (
                  <Button
                    onClick={handleBackReimbursementStep}
                    variant="outlined"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNextReimbursementStep}
                  variant="contained"
                  disabled={
                    (reimbursementStep === 1 && !paymentMethod) ||
                    (reimbursementStep === 1 && (paymentMethod === 'Direct Deposit' || paymentMethod === 'Wire Transfer') && !bankAccount) ||
                    processingPayment
                  }
                  startIcon={processingPayment ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {processingPayment ? 'Processing...' : (reimbursementStep === 2 ? 'Process Payment' : 'Next')}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ExpenseReports;