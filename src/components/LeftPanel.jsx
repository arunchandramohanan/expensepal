import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  styled,
  Tooltip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}));

const LeftPanel = ({
  isLeftPanelOpen,
  files,
  currentFile,
  selectedFileIndex,
  isProcessing,
  handleDrop,
  handleFiles,
  processFile,
  removeFile,
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
  HEADER_HEIGHT,
  FOOTER_HEIGHT
}) => {
  return (
    <Box
      sx={{
        width: isLeftPanelOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}
    >
      <Collapse in={isLeftPanelOpen} orientation="horizontal">
        <Box sx={{ 
          width: DRAWER_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Upload Section */}
          <Box sx={{ 
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minHeight: '180px',
            flexShrink: 0
          }}>
            <DropZone
              component="div"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Drag and drop receipts (PDF or JPG) here or
              </Typography>
              <input
                type="file"
                hidden
                id="fileInput"
                multiple
                accept="application/pdf,image/jpeg,image/jpg"
                onChange={(e) => handleFiles(Array.from(e.target.files))}
              />
              <Button
                variant="contained"
                onClick={() => document.getElementById('fileInput').click()}
                disabled={isProcessing}
                sx={{ mt: 2 }}
              >
                Select Receipts
              </Button>
            </DropZone>
          </Box>

          {/* Files Counter */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flexShrink: 0
          }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              Files
              <Box 
                component="span" 
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {files.length}
              </Box>
            </Typography>
          </Box>

          {/* File List */}
          <Box sx={{ 
            flexGrow: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.300',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'grey.400',
              },
            },
          }}>
            <List sx={{ py: 1 }}>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  component="div"
                  selected={selectedFileIndex === index}
                  onClick={() => processFile(file)}
                  sx={{
                    mb: 1,
                    mx: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    ...(currentFile === file && {
                      backgroundColor: '#fff3e0',
                      '&:hover': {
                        backgroundColor: '#ffe0b2',
                      }
                    })
                  }}
                >
                  <ListItemIcon>
                    {file.type === 'application/pdf' ? (
                      <PdfIcon 
                        sx={{ 
                          color: currentFile === file 
                            ? 'warning.main'
                            : selectedFileIndex === index 
                              ? 'primary.main' 
                              : 'error.main'
                        }} 
                      />
                    ) : (
                      <ImageIcon 
                        sx={{ 
                          color: currentFile === file 
                            ? 'warning.main'
                            : selectedFileIndex === index 
                              ? 'primary.main' 
                              : 'info.main'
                        }} 
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography
                        noWrap
                        sx={{ 
                          color: currentFile === file 
                            ? 'warning.dark'
                            : selectedFileIndex === index 
                              ? 'primary.dark' 
                              : 'text.primary'
                        }}
                      >
                        {file.name}
                      </Typography>
                    }
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => removeFile(file, e)}
                      size="small"
                      sx={{
                        color: currentFile === file 
                          ? 'warning.dark'
                          : selectedFileIndex === index 
                            ? 'primary.dark' 
                            : 'inherit'
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Collapse>

      {/* Collapsed View */}
      {!isLeftPanelOpen && (
        <Box sx={{ 
          p: 1, 
          overflow: 'auto',
          width: DRAWER_WIDTH_COLLAPSED,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'grey.300',
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: 'grey.400',
            },
          },
        }}>
          {files.map((file, index) => (
            <Tooltip 
              key={index}
              title={file.name}
              placement="right"
            >
              <IconButton
                size="small"
                onClick={() => processFile(file)}
                sx={{ 
                  mb: 1,
                  display: 'block',
                  position: 'relative',
                }}
              >
                {file.type === 'application/pdf' ? (
                  <PdfIcon 
                    color={currentFile === file 
                      ? "warning" 
                      : selectedFileIndex === index 
                        ? "primary" 
                        : "error"
                    } 
                  />
                ) : (
                  <ImageIcon 
                    color={currentFile === file 
                      ? "warning" 
                      : selectedFileIndex === index 
                        ? "primary" 
                        : "info"
                    } 
                  />
                )}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default LeftPanel;