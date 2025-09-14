import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  styled,
  IconButton,
  Tooltip,
  ButtonGroup,
  Stack,
  Paper
} from '@mui/material';
import {
  DataObject as ExtractIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetZoomIcon,
} from '@mui/icons-material';

// Container for the zoomed content
const ZoomContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '400px', // Increased from 300px for more space
  height: '100%', // Use full available height
  display: 'flex',
  overflow: 'auto',
  backgroundColor: '#f5f5f5',
  padding: '16px',
  borderRadius: '4px',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
    '&:hover': {
      background: '#666',
    },
  },
});

const ZoomWrapper = styled(Box)(({ theme, zoom }) => ({
  transform: `scale(${zoom})`,
  transformOrigin: 'top left',
  transition: 'transform 0.2s ease-in-out',
  display: 'inline-block',
  minWidth: '100%',
  willChange: 'transform',
}));

const PDFCanvas = styled('canvas')({
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled(Box)(({ theme, zoom }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px', // Increased from 300px for more space
  height: '100%', // Use full available height
  '& img': {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transform: `scale(${zoom})`,
    transformOrigin: 'center',
    transition: 'transform 0.2s ease-in-out',
  }
}));

const MiddlePanel = ({
  currentFile,
  isProcessing,
  error,
  pdf,
  numPages,
  currentPage,
  selectedFileIndex,
  files,
  handleDrop,
  handleFiles,
  handlePageChange,
  handleExtraction,
  isExtracting,
  HEADER_HEIGHT,
  FOOTER_HEIGHT
}) => {
  const [zoom, setZoom] = useState(1);
  const [renderError, setRenderError] = useState(null);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;
  
  const renderingRef = useRef(null);
  const canvasRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // Keep track of component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset zoom when currentFile changes
  useEffect(() => {
    setZoom(1);
    setRenderError(null);
  }, [currentFile]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const renderPage = async (pageNum) => {
    if (!pdf || !canvasRef.current) return;
    
    try {
      // Cancel any ongoing rendering
      if (renderingRef.current) {
        renderingRef.current.cancel();
        renderingRef.current = null;
      }

      // Clear the canvas before starting a new render
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ensure component is still mounted
      if (!isMountedRef.current) return;
      
      const page = await pdf.getPage(pageNum);
      
      // Double check the component is still mounted and the canvas ref is still valid
      if (!isMountedRef.current || !canvasRef.current) return;
      
      // Calculate scale based on screen size
      let scale = 1.5;
      
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Store the rendering task reference
      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport
      });
      
      renderingRef.current = renderTask;

      await renderTask.promise;
      
      // Clear the rendering ref if the component is still mounted
      if (isMountedRef.current) {
        renderingRef.current = null;
        setRenderError(null);
      }
    } catch (err) {
      // Only set error if it's not a cancelled render and the component is still mounted
      if (err.message !== 'Rendering cancelled' && isMountedRef.current) {
        console.error(`Error rendering page: ${err.message}`);
        setRenderError(`Error rendering page: ${err.message}`);
      }
    }
  };

  // Effect for page rendering - with cleanup and dependency array
  useEffect(() => {
    if (pdf && canvasRef.current) {
      renderPage(currentPage);
    }

    // Cleanup function to cancel rendering when component updates or unmounts
    return () => {
      if (renderingRef.current) {
        renderingRef.current.cancel();
        renderingRef.current = null;
      }
    };
  }, [currentPage, pdf]); // Don't include zoom as dependency, it's handled by the transform

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
        position: 'relative'
      }}
    >
      {currentFile && (
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {currentFile.name}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {renderError && !error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {renderError}
        </Alert>
      )}

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          height: 'calc(100% - 50px)' // Reduce height slightly to account for file name
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {isProcessing ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <CircularProgress />
          </Box>
        ) : !currentFile ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 4,
              bgcolor: 'grey.100',
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" align="center" gutterBottom>
              No File Selected
            </Typography>
            <Typography variant="body2" align="center">
              Select a file from the panel on the left to view it here
            </Typography>
          </Box>
        ) : currentFile.type === 'application/pdf' ? (
          // PDF viewer with zoom container
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Loading indicator */}
            {renderingRef.current && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.7)',
                  zIndex: 10
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}
            
            {/* Zoom container - Takes all available space */}
            <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
              <ZoomContainer>
                <ZoomWrapper zoom={zoom}>
                  <PDFCanvas ref={canvasRef} />
                </ZoomWrapper>
              </ZoomContainer>
            </Box>
            
            {/* Controls */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              <Pagination
                count={numPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
              
              <Stack direction="row" spacing={1} alignItems="center">
                <ButtonGroup variant="outlined" size="small">
                  <Tooltip title="Zoom Out">
                    <IconButton 
                      onClick={handleZoomOut}
                      disabled={zoom <= MIN_ZOOM}
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Reset Zoom">
                    <IconButton 
                      onClick={handleResetZoom}
                      disabled={zoom === 1}
                    >
                      <ResetZoomIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Zoom In">
                    <IconButton 
                      onClick={handleZoomIn}
                      disabled={zoom >= MAX_ZOOM}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ButtonGroup>

                <Typography variant="caption" sx={{ width: 40 }}>
                  {Math.round(zoom * 100)}%
                </Typography>
              </Stack>
            </Box>
          </Box>
        ) : (
          // Image viewer with zoom
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Image content with zoom - Takes all available space */}
            <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
              <ZoomContainer>
                <ZoomWrapper zoom={zoom}>
                  <img
                    src={URL.createObjectURL(currentFile)}
                    alt="Receipt"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </ZoomWrapper>
              </ZoomContainer>
            </Box>
            
            {/* Zoom controls for images */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                p: 1,
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ButtonGroup variant="outlined" size="small">
                  <Tooltip title="Zoom Out">
                    <IconButton 
                      onClick={handleZoomOut}
                      disabled={zoom <= MIN_ZOOM}
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Reset Zoom">
                    <IconButton 
                      onClick={handleResetZoom}
                      disabled={zoom === 1}
                    >
                      <ResetZoomIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Zoom In">
                    <IconButton 
                      onClick={handleZoomIn}
                      disabled={zoom >= MAX_ZOOM}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ButtonGroup>

                <Typography variant="caption" sx={{ width: 40 }}>
                  {Math.round(zoom * 100)}%
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Action button */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        {currentFile && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ExtractIcon />}
            onClick={handleExtraction}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Extracting...
              </>
            ) : (
              'Extract Data'
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default MiddlePanel;