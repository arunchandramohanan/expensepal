import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Divider
} from '@mui/material';
import {
  NotificationsOutlined as NotificationsIcon,
  AccountCircleOutlined as AccountIcon,
  HelpOutlineOutlined as HelpIcon
} from '@mui/icons-material';

const OLBBHeader = () => {
  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: '#ffffff'
      }}
    >
      <Toolbar>
        {/* BMO Logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            marginRight: 3
          }}
        >
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: '#0079c1',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Travel and Expense Management
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Right side buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Help">
            <IconButton size="large" color="default">
              <HelpIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton size="large" color="default">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#0079c1',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              JS
            </Avatar>
            <Box sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                John Smith
              </Typography>
              <Typography variant="caption" color="text.secondary">
                
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default OLBBHeader;