import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Badge
} from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  UploadFile as UploadIcon,
  Dashboard as DashboardIcon,
  Create as CreateReportIcon,
  Settings as SettingsIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Luggage as LuggageIcon,
  CurrencyExchange as CurrencyIcon,
  Receipt as ReceiptScannerIcon,
  Home as HomeIcon,
  CreditCard as CreditCardIcon,
 
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const NavigationBar = ({ reportItemsCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active page from URL path
  const activePage = location.pathname.replace('/', '') || 'home';

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      {/* BMO Header with Logo and User */}
  
      
      {/* Navigation Menu */}
      <List component="nav" sx={{ pt: 2 }}>
        {/* New Home navigation item */}
        <ListItem disablePadding>
          <ListItemButton 
            selected={activePage === 'home'}
            onClick={() => navigate('/home')}
          >
            <ListItemIcon>
              <HomeIcon color={activePage === 'home' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Home"
              primaryTypographyProps={{
                fontWeight: activePage === 'home' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={activePage === 'reports'}
            onClick={() => navigate('/reports')}
          >
            <ListItemIcon>
              <DashboardIcon color={activePage === 'reports' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="View Expense Reports"
              primaryTypographyProps={{
                fontWeight: activePage === 'reports' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={activePage === 'upload'}
            onClick={() => navigate('/upload')}
          >
            <ListItemIcon>
              <UploadIcon color={activePage === 'upload' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Upload Receipts"
              primaryTypographyProps={{
                fontWeight: activePage === 'upload' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={activePage === 'create-report'}
            onClick={() => navigate('/create-report')}
          >
            <ListItemIcon>
              <Badge 
                badgeContent={reportItemsCount}
                color="primary"
                invisible={reportItemsCount === 0}
              >
                <CreateReportIcon color={activePage === 'create-report' ? 'primary' : 'inherit'} />
              </Badge>
            </ListItemIcon>
            <ListItemText 
              primary="Create Report"
              primaryTypographyProps={{
                fontWeight: activePage === 'create-report' ? 'bold' : 'normal'
              }}
            />
            {reportItemsCount > 0 && (
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: '12px',
                  px: 1,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  ml: 1
                }}
              >
                {reportItemsCount}
              </Box>
            )}
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: 2 }} />
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={activePage === 'corporate-card'}
            onClick={() => navigate('/corporate-card')}
          >
            <ListItemIcon>
              <CreditCardIcon color={activePage === 'corporate-card' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Corporate Card"
              primaryTypographyProps={{
                fontWeight: activePage === 'corporate-card' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 2 }} />
        <ListItem disablePadding>
          <ListItemButton 
            selected={activePage === 'budgets'}
            onClick={() => navigate('/budgets')}
          >
            <ListItemIcon>
              <AccountBalanceIcon color={activePage === 'budgets' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Budget Management"
              primaryTypographyProps={{
                fontWeight: activePage === 'budgets' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Policy Settings Navigation Item */}
        <ListItem disablePadding>
          <ListItemButton 
            selected={activePage === 'policy-settings'}
            onClick={() => navigate('/policy-settings')}
          >
            <ListItemIcon>
              <SettingsIcon color={activePage === 'policy-settings' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Policy Settings"
              primaryTypographyProps={{
                fontWeight: activePage === 'policy-settings' ? 'bold' : 'normal'
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default NavigationBar;