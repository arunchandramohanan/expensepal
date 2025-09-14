import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  styled,
  CssBaseline,
  Snackbar,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Collapse,
  Tooltip
} from '@mui/material';
import * as pdfjs from 'pdfjs-dist';

// Import icons
import {
  UploadFile as UploadIcon,
  ChevronLeft as ChevronLeftIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  ReceiptLong as ReceiptIcon
} from '@mui/icons-material';

// Import components
import NavigationBar from './NavigationBar';
import ExpenseReports from './ExpenseReports';
import CreateReport from './CreateReport';
import MiddlePanel from './MiddlePanel';
import RightPanel from './RightPanel';
import ExpenseExtractorService from '../services/ExpenseExtractorService';
import PolicySettingsPage from './PolicySettingsPage';
import Home from './Home';
import CorporateCardIntegration from './CorporateCardIntegration';
import BudgetManagement from './BudgetManagement';
import { useData } from './DataContext';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

// Constants
const RESULTS_WIDTH = 600;
const FILES_PANEL_WIDTH = 250;
const FILES_PANEL_COLLAPSED_WIDTH = 60;
const HEADER_HEIGHT = 0;
const FOOTER_HEIGHT = 48;

const Footer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  width: '100%',
  height: FOOTER_HEIGHT,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: theme.zIndex.appBar - 1
}));

const ExpenseProcessor = () => {
  // Use React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from context
  const {
    reportItems, 
    addToReport,
    removeFromReport, 
    reports,
    addReport,
    updateDashboardData,
    transactions,
    addTransaction,
    unmatchedReceipts,
    addUnmatchedReceipt
  } = useData();
  
  // File and processing state
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [extractionResults, setExtractionResults] = useState(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [isFilesPanelOpen, setIsFilesPanelOpen] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // PDF rendering refs
  const renderTaskRef = useRef(null);
  
  // Handle file rendering
  const renderPage = async (pageNum) => {
    if (!pdf) return;

    try {
      // Cancel any existing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const page = await pdf.getPage(pageNum);
      const canvas = document.getElementById('pdf-canvas');
      if (!canvas) return;
      
      // Clear the canvas before rendering
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Create render task
      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport
      });
      
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      
      // Clear reference when complete
      if (renderTaskRef.current === renderTask) {
        renderTaskRef.current = null;
      }
    } catch (err) {
      // Only set error if it's not a cancellation
      if (err.message !== 'Rendering cancelled' && !err.message.includes('Rendering cancelled')) {
        setError(`Error rendering page: ${err.message}`);
      } else {
        // Clear any previous errors when cancellation happens
        setError(null);
      }
    }
  };

  // Clean up render task when component unmounts
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, []);

  // Render PDF when current page or PDF changes
  useEffect(() => {
    if (pdf) {
      renderPage(currentPage);
    }
    
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [currentPage, pdf]);

  // Process file
  const processFile = async (file) => {
    // Cancel any ongoing rendering
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
    
    setIsProcessing(true);
    setError(null);
    setExtractionResults(null);
    
    try {
      if (file.type === 'application/pdf') {
        // Clear existing PDF
        setPdf(null);
        
        const arrayBuffer = await file.arrayBuffer();
        const loadedPdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
      } else if (file.type.startsWith('image/')) {
        // For images, reset PDF-specific state
        setPdf(null);
        setNumPages(1);
      }
      
      setCurrentPage(1);
      setCurrentFile(file);
      const newIndex = files.findIndex(f => f === file);
      setSelectedFileIndex(newIndex >= 0 ? newIndex : files.length);
    } catch (err) {
      console.error('Process file error:', err);
      setError(`Error processing file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle dropped files
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Handle file selection
  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'image/jpeg' || 
                         file.type === 'image/jpg';
      if (!isValidType) {
        console.log('Invalid file type:', file.type);
      }
      return isValidType;
    });
  
    if (validFiles.length) {
      setFiles(prev => {
        const updatedFiles = [...prev, ...validFiles];
        const newFileIndex = prev.length;
        processFile(validFiles[0]);
        setSelectedFileIndex(newFileIndex);
        return updatedFiles;
      });
      // Open the files panel when files are added
      setIsFilesPanelOpen(true);
      
      // Navigate to upload page if not already there
      if (location.pathname !== '/upload') {
        navigate('/upload');
      }
    } else {
      setError('Please upload PDF or JPG files only');
    }
  };
  
  // Remove file
  const removeFile = (fileToRemove, e) => {
    if (e) e.stopPropagation();
    setFiles(files.filter(file => file !== fileToRemove));
    
    if (currentFile === fileToRemove) {
      const remainingFiles = files.filter(file => file !== fileToRemove);
      if (remainingFiles.length) {
        processFile(remainingFiles[0]);
      } else {
        setCurrentFile(null);
        setPdf(null);
        setNumPages(0);
        setExtractionResults(null);
      }
    }
  };

  // Handle PDF page change
  const handlePdfPageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Handle data extraction
  const handleExtraction = async () => {
    if (!currentFile) return;
    
    setIsExtracting(true);
    setError(null);
    
    try {
      // Validate file type before processing
      if (!currentFile.type.match(/^(application\/pdf|image\/(jpeg|jpg))$/)) {
        throw new Error('Unsupported file type. Please use PDF or JPG files only.');
      }
  
      // Add file type to extraction results for tracking
      const fileType = currentFile.type.startsWith('image/') ? 'image' : 'pdf';
      
      // Extract data using the service
      const extractedData = await ExpenseExtractorService.extractExpenseData(currentFile);
  
      // Clear processing message
      setError(null);
  
      // Update state with extracted data
      setExtractionResults({
        id: `EXP-${Date.now()}`, // Add unique ID for tracking
        fileType, // Add file type to results
        invoiceNumber: extractedData.invoiceNumber || '',
        date: extractedData.date || '',
        currency: extractedData.currency || '',
        vendor: extractedData.vendor || '',
        expenseType: extractedData.expenseType || '',
        expenseLocation: extractedData.expenseLocation || '',
        expenseCountry: extractedData.expenseCountry || '',
        numberOfPeople: extractedData.numberOfPeople  || '',
        items: extractedData.items || [
          { description: '', amount: '' }
        ],
        amount: extractedData.amount || '',
        taxes: extractedData.taxes || '',
        total: extractedData.total || ''
      });
  
    } catch (err) {
      console.error('Extraction error:', err);
      
      // Provide more specific error messages based on the error type
      if (err.message.includes('network')) {
        setError('Network error: Please check your connection and try again.');
      } else if (err.response?.status === 413) {
        setError('File is too large. Please try a smaller file.');
      } else if (err.response?.status === 415) {
        setError('Unsupported file type. Please use PDF or JPG files only.');
      } else if (err.response?.status === 500) {
        setError('Server error: The extraction service is currently unavailable. Please try again later.');
      } else {
        setError(`Error extracting data: ${err.message}`);
      }
    } finally {
      setIsExtracting(false);
    }
  };
  
  // Toggle files panel
  const toggleFilesPanel = () => {
    setIsFilesPanelOpen(!isFilesPanelOpen);
  };
  
  // Add extracted data to report using context function
  const handleAddToReport = (item) => {
    // Add item to report queue
    addToReport(item);
    
    // Show notification
    setNotification({
      open: true,
      message: 'Item added to report successfully',
      severity: 'success'
    });
    
    // Remove file from queue
    removeFile(currentFile);
    
    // Navigate to Create Report page if this is the first item
    if (reportItems.length === 0) {
      navigate('/create-report');
    }

    // Create a matching receipt to sync with card transactions
    const newReceipt = {
      id: `R-${Date.now()}`,
      date: item.date,
      vendor: item.vendor,
      amount: parseFloat(item.total),
      category: item.expenseType || 'Miscellaneous',
      status: 'Unmatched'
    };
    
    // Add to unmatched receipts
    addUnmatchedReceipt(newReceipt);
    
    // Update dashboard data
    updateDashboardData();
  };
  
  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle report submission using context function
  const handleSubmitReport = async (report) => {
    // Add to submitted reports
    addReport(report);

    // Update dashboard data
    updateDashboardData();
    
    // Navigate to reports page
    navigate('/reports');
    
    // Show notification
    setNotification({
      open: true,
      message: 'Expense report submitted successfully',
      severity: 'success'
    });
    
    return report;
  };
  
  // Files Panel Component
  const FilesPanel = () => (
    <Box
      sx={{
        width: isFilesPanelOpen ? FILES_PANEL_WIDTH : FILES_PANEL_COLLAPSED_WIDTH,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        height: '100%'
      }}
    >
      {/* Toggle Button */}
      <Box 
        sx={{ 
          width: FILES_PANEL_COLLAPSED_WIDTH, 
          borderRight: isFilesPanelOpen ? 1 : 0,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 2
        }}
      >
        <IconButton onClick={toggleFilesPanel}>
          {isFilesPanelOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
        
        {/* Only show file icons when panel is collapsed */}
        {!isFilesPanelOpen && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, overflow: 'auto', width: '100%', flexGrow: 1 }}>
            {files.map((file, index) => (
              <Tooltip key={index} title={file.name} placement="right">
                <IconButton
                  onClick={() => processFile(file)}
                  sx={{
                    bgcolor: selectedFileIndex === index ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {file.type === 'application/pdf' ? 
                    <PdfIcon color={selectedFileIndex === index ? "primary" : "error"} /> : 
                    <ImageIcon color={selectedFileIndex === index ? "primary" : "info"} />
                  }
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Expanded File List */}
      <Collapse in={isFilesPanelOpen} orientation="horizontal">
        <Box sx={{ width: FILES_PANEL_WIDTH - FILES_PANEL_COLLAPSED_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box 
            sx={{ 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Files ({files.length})
            </Typography>
            
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover'
                }
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
              onClick={() => document.getElementById('fileInputSidebar').click()}
            >
              <input
                type="file"
                hidden
                id="fileInputSidebar"
                multiple
                accept="application/pdf,image/jpeg,image/jpg"
                onChange={(e) => handleFiles(Array.from(e.target.files))}
              />
              <UploadIcon fontSize="small" color="primary" sx={{ mb: 1 }} />
              <Typography variant="body2" align="center" color="text.secondary">
                Drop files here or click to browse
              </Typography>
            </Box>
          </Box>
          
          {files.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                height: '200px',
                m: 2,
                flexGrow: 1
              }}
            >
              <Typography variant="body2" align="center">
                No files uploaded yet
              </Typography>
            </Box>
          ) : (
            <List 
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                pt: 0
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
            >
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" onClick={(e) => removeFile(file, e)} size="small">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    selected={selectedFileIndex === index}
                    onClick={() => processFile(file)}
                    dense
                  >
                    <ListItemIcon>
                      {file.type === 'application/pdf' ? (
                        <PdfIcon color={selectedFileIndex === index ? "primary" : "error"} />
                      ) : (
                        <ImageIcon color={selectedFileIndex === index ? "primary" : "info"} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.name} 
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      
      <CssBaseline />
      
      {/* Left Navigation Bar */}
      <NavigationBar reportItemsCount={reportItems.length} />
      
      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          height: '100vh',
          paddingBottom: `${FOOTER_HEIGHT}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Main content based on routes */}
        <Routes>
          {/* Add the Home route */}
          <Route 
            path="/home" 
            element={<Home />} 
          />
          <Route 
            path="/reports" 
            element={<ExpenseReports />} 
          />
          <Route 
            path="/create-report" 
            element={
              <CreateReport 
                reportItems={reportItems} 
                removeFromReport={removeFromReport}
                submitReport={handleSubmitReport}
              />
            } 
          />
          <Route 
            path="/policy-settings" 
            element={<PolicySettingsPage />} 
          />
          <Route 
            path="/corporate-card" 
            element={<CorporateCardIntegration />} 
          />
          <Route 
            path="/budgets" 
            element={<BudgetManagement />} 
          />
          <Route 
            path="/upload" 
            element={
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexGrow: 1,
                  height: `calc(100vh - ${FOOTER_HEIGHT}px)`,
                  overflow: 'hidden'
                }}
              >
                {/* Collapsible Files Panel */}
                <FilesPanel />
                
                {/* Upload Expenses Content */}
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    display: 'flex',
                    overflow: 'hidden'
                  }}
                >
                  {/* Middle Panel - File Viewer */}
                  <MiddlePanel
                    currentFile={currentFile}
                    isProcessing={isProcessing}
                    error={error}
                    pdf={pdf}
                    numPages={numPages}
                    currentPage={currentPage}
                    selectedFileIndex={selectedFileIndex}
                    files={files}
                    handleDrop={handleDrop}
                    handleFiles={handleFiles}
                    removeFile={removeFile}
                    handlePageChange={handlePdfPageChange}
                    handleExtraction={handleExtraction}
                    isExtracting={isExtracting}
                    HEADER_HEIGHT={HEADER_HEIGHT}
                    FOOTER_HEIGHT={FOOTER_HEIGHT}
                  />

                  {/* Right Panel - Extraction Results */}
                  <RightPanel
                    extractionResults={extractionResults}
                    setExtractionResults={setExtractionResults}
                    isExtracting={isExtracting}
                    addToReport={handleAddToReport}
                    RESULTS_WIDTH={RESULTS_WIDTH}
                    HEADER_HEIGHT={HEADER_HEIGHT}
                    FOOTER_HEIGHT={FOOTER_HEIGHT}
                  />
                </Box>
              </Box>
            } 
          />
          <Route 
            path="*" 
            element={<Navigate to="/home" replace />} 
          />
        </Routes>
        {/* Footer */}
        <Footer>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} . All rights reserved.
            </Typography>
          </Container>
        </Footer>
        
        {/* Notification Snackbar */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={4000}
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
    </Box>
  );
}
  export default ExpenseProcessor;