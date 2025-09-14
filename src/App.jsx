import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ExpenseProcessor from './components/ExpenseProcessor';
import OLBBHeader from './components/OLBBHeader';
import { DataProvider } from './components/DataContext';
import './App.css';

// Create a theme instance with BMO colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#0079c1', // BMO blue
      lightest: '#e6f3fa', // Light blue for backgrounds
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
    error: {
      main: '#e30000', // BMO red
      lightest: '#fee7e7', // Light red for backgrounds
    },
    warning: {
      main: '#ff9800',
      lightest: '#fff3e0',
    },
    info: {
      main: '#2196f3',
      lightest: '#e3f2fd',
    },
    success: {
      main: '#4caf50',
      lightest: '#e8f5e9',
    }
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Router>
          <div className="app">
            <OLBBHeader />
            <Routes>
              <Route path="/*" element={<ExpenseProcessor />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;