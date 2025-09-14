import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  LinearProgress,
  IconButton,
  Button,
  Tooltip,
  Paper
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Flight as FlightIcon,
  Restaurant as RestaurantIcon,
  Hotel as HotelIcon,
  LocalTaxi as TaxiIcon,
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Import data context
import { useData } from './DataContext';

// Enhanced BarChart component with animations
const BarChart = ({ data }) => {
  const [animatedValues, setAnimatedValues] = useState(data.map(() => 0));
  const [hoveredBar, setHoveredBar] = useState(null);
  const maxValue = Math.max(...data.map(item => item.expenses));
  
  // Get current month
  const getCurrentMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return months[now.getMonth()];
  };
  
  const currentMonth = getCurrentMonth();
  const currentMonthIndex = data.findIndex(item => item.month === currentMonth);
  
  useEffect(() => {
    // Animate bars on mount
    const timer = setTimeout(() => {
      setAnimatedValues(data.map(item => item.expenses));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [data]);
  
  // Helper function to format Y-axis values
  const formatYAxisValue = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };
  
  // Calculate appropriate Y-axis values in multiples of 1000
  const getYAxisValues = (maxValue) => {
    const roundedMax = Math.ceil(maxValue / 1000) * 1000;
    const intervals = 4;
    const step = roundedMax / intervals;
    
    const values = [];
    for (let i = intervals; i >= 0; i--) {
      values.push(step * i);
    }
    return values;
  };
  
  const yAxisValues = getYAxisValues(maxValue);
  const chartMax = yAxisValues[0];
  
  return (
    <Box sx={{ height: '300px', position: 'relative', overflow: 'visible' }}>
      {/* Y-axis labels - positioned inside the chart area */}
      <Box sx={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: '70px',
        height: '275px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        pr: 1
      }}>
        {yAxisValues.map((value, index) => (
          <Typography key={index} variant="caption" color="text.secondary">
            {formatYAxisValue(value)}
          </Typography>
        ))}
      </Box>
      
      {/* Grid lines */}
      <Box sx={{ 
        position: 'absolute', 
        left: '70px',
        width: 'calc(100% - 70px)', 
        height: '100%', 
        opacity: 0.1,
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {yAxisValues.slice(1, -1).map((value, index) => (
          <Box 
            key={value}
            sx={{ 
              position: 'absolute', 
              top: `${((yAxisValues.length - 2 - index) / (yAxisValues.length - 1)) * 275}px`, 
              width: '100%', 
              borderTop: '1px dashed #e0e0e0'
            }} 
          />
        ))}
      </Box>
      
      {/* Bars */}
      <Box sx={{ 
        height: '275px', 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: 1, 
        pt: 2, 
        pb: 3,
        ml: 9, // Add left margin to make room for Y-axis labels
      }}>
        {data.map((item, index) => {
          // Use the original data values for checking future months, not animated values
          const isFuture = index > currentMonthIndex || item.year === 2024;
          const isCurrentYear = item.year === new Date().getFullYear();
          
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flexGrow: 1,
                position: 'relative'
              }}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Animated bar with gradient */}
              <Box 
                sx={{ 
                  // Use chartMax for height calculation
                  height: `${(animatedValues[index] / chartMax) * 230}px`, 
                  width: '100%', 
                  background: hoveredBar === index 
                    ? (isFuture 
                        ? 'linear-gradient(180deg, #c0c0c0 0%, #808080 100%)'
                        : 'linear-gradient(180deg, #00a0e9 0%, #0079c1 100%)')
                    : (isFuture 
                        ? 'linear-gradient(180deg, #d3d3d3 0%, #a9a9a9 100%)'
                        : 'linear-gradient(180deg, #0099e0 0%, #0079c1 100%)'),
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  boxShadow: hoveredBar === index ? '0 4px 15px rgba(0, 121, 193, 0.3)' : 'none',
                  opacity: isFuture ? 0.7 : 1,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
                    borderRadius: '4px 4px 0 0',
                  }
                }} 
              />
              
              {/* Hover tooltip */}
              {hoveredBar === index && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: `${230 - (animatedValues[index] / chartMax) * 230}px`,
                    transform: 'translateY(-100%)',
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '4px solid rgba(0, 0, 0, 0.8)',
                    }
                  }}
                >
                  ${item.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {isFuture && <span style={{ display: 'block', fontSize: '10px', opacity: 0.7 }}>{item.year} Data</span>}
                </Box>
              )}
              
              <Typography variant="caption" sx={{ pt: 1, fontWeight: hoveredBar === index ? 'medium' : 'normal' }}>
                {item.month}
              </Typography>
            </Box>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{ position: 'absolute', bottom: -40, left: 74, display: 'flex', gap: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, background: 'linear-gradient(180deg, #0099e0 0%, #0079c1 100%)', borderRadius: 0.5 }} />
          <Typography variant="caption" color="text.secondary">2025</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, background: 'linear-gradient(180deg, #d3d3d3 0%, #a9a9a9 100%)', borderRadius: 0.5, opacity: 0.7 }} />
          <Typography variant="caption" color="text.secondary">2024</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Enhanced Donut Chart with animations and interactions
const DonutChart = ({ data }) => {
  const [animatedValues, setAnimatedValues] = useState(data.map(() => 0));
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  useEffect(() => {
    // Animate chart segments
    const timer = setTimeout(() => {
      setAnimatedValues(data.map(item => item.value));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [data]);
  
  let cumulativePercent = 0;
  // Use the original total value, not the animated one
  const displayTotal = total;
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, position: 'relative' }}>
      <svg width="200" height="200" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="transparent" 
          stroke="#f0f0f0" 
          strokeWidth="20" 
        />
        
        {/* Animated segments */}
        {data.map((item, index) => {
          const value = animatedValues[index];
          const percent = total > 0 ? (value / total) * 100 : 0;
          const startPercent = cumulativePercent;
          cumulativePercent += percent;
          
          const isHovered = hoveredSegment === index;
          const strokeWidth = isHovered ? 22 : 20;
          
          return (
            <g key={index}>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${percent * 2.51} ${100 * 2.51}`}
                strokeDashoffset={`${-startPercent * 2.51}`}
                transform="rotate(-90 50 50)"
                style={{ 
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: isHovered ? 'brightness(1.1)' : 'none'
                }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              
              {/* Segment label on hover */}
              {isHovered && (
                <text 
                  x="50" 
                  y="30" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fill={item.color}
                  fontSize="8"
                  fontWeight="bold"
                >
                  {item.name}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Center total */}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="#333" fontSize="10" fontWeight="bold">
          ${displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </text>
        <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="6">
          Current Month
        </text>
      </svg>
    </Box>
  );
};

// Enhanced Budget Progress with animations
const AnimatedBudgetProgress = ({ budget }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const actualProgress = (budget.spent / budget.amount) * 100;
  
  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => {
      setAnimatedProgress(actualProgress);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [actualProgress]);
  
  const getProgressColor = (percent) => {
    if (percent <= 60) return 'success';
    if (percent <= 85) return 'warning';
    return 'error';
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">
          {budget.name}
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          ${budget.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${budget.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={animatedProgress} 
            color={getProgressColor(actualProgress)}
            sx={{ 
              height: 10, 
              borderRadius: 1,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }
            }}
          />
        </Box>
        <Box sx={{ minWidth: 50 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {actualProgress.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Remaining: ${budget.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        {actualProgress > 85 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            animation: actualProgress >= 95 ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.6 },
              '100%': { opacity: 1 },
            }
          }}>
            <WarningIcon fontSize="inherit" sx={{ mr: 0.5, color: actualProgress >= 95 ? 'error.main' : 'warning.main' }} />
            <Typography variant="caption" color={actualProgress >= 95 ? 'error.main' : 'warning.main'}>
              {actualProgress >= 95 ? 'Critical' : 'Near limit'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Enhanced Summary Card with animation
const AnimatedSummaryCard = ({ title, value, icon, trendValue, isCurrency = false }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    // Animate value
    const steps = 30;
    const stepValue = value / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedValue(stepValue * currentStep);
      } else {
        setAnimatedValue(value);
        clearInterval(timer);
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 2, 
        border: '1px solid', 
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
          {icon}
          <Typography variant="h4" fontWeight="bold" sx={{ ml: 1 }}>
            {isCurrency && '$'}
            {isCurrency 
              ? animatedValue.toFixed(2).toLocaleString('en-US') 
              : animatedValue.toFixed(0).toLocaleString('en-US')}
          </Typography>
        </Box>
        {trendValue !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trendValue > 0 ? (
              <TrendingUpIcon color="error" fontSize="small" />
            ) : (
              <TrendingDownIcon color="success" fontSize="small" />
            )}
            <Typography variant="body2" color={trendValue > 0 ? 'error.main' : 'success.main'}>
              {Math.abs(trendValue)}% from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Function to determine progress color based on utilization
const getProgressColor = (percent) => {
  if (percent <= 60) return 'success';
  if (percent <= 85) return 'warning';
  return 'error';
};

// Home component
const Home = () => {
  const navigate = useNavigate();
  
  // Get data from context
  const { dashboardData, budgets, transactions } = useData();
  
  // Map category icon components
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'flight':
        return <FlightIcon />;
      case 'restaurant':
        return <RestaurantIcon />;
      case 'hotel':
        return <HotelIcon />;
      case 'taxi':
        return <TaxiIcon />;
      case 'payments':
        return <PaymentsIcon />;
      default:
        return <PaymentsIcon />;
    }
  };
  
  // Add icon components to category data
  const categoriesWithIcons = dashboardData.categories.map(category => ({
    ...category,
    iconComponent: getCategoryIcon(category.icon)
  }));
  
  return (
    <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="medium" gutterBottom>
          Expense Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your expense analytics and reports
        </Typography>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedSummaryCard
            title="Current Monthly Expenses"
            value={dashboardData.currentMonthlyExpenses}
            icon={<AttachMoneyIcon color="primary" />}
            trendValue={dashboardData.monthlyTrend}
            isCurrency={true}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedSummaryCard
            title="Pending Reports"
            value={dashboardData.pendingReports}
            icon={<AccountBalanceIcon color="warning" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedSummaryCard
            title="Submitted Reports"
            value={dashboardData.submittedReports}
            icon={<TrendingUpIcon color="info" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedSummaryCard
            title="Approved Reports"
            value={dashboardData.approvedReports}
            icon={<TrendingDownIcon color="success" />}
          />
        </Grid>
      </Grid>
      
      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Monthly Expenses Chart */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <CardHeader 
              title="Monthly Expense Trend" 
              action={
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ pb: 5 }}>
              <BarChart data={dashboardData.monthlyData} />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Expense Categories */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <CardHeader 
              title="Expense Categories" 
              action={
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
              <DonutChart data={categoriesWithIcons} />
              
              <Box sx={{ mt: 2 }}>
                {categoriesWithIcons.map((category, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        px: 1,
                        mx: -1,
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 30, 
                        height: 30, 
                        bgcolor: category.color,
                        mr: 1,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      {category.iconComponent}
                    </Avatar>
                    <Typography variant="body2" sx={{ mr: 'auto' }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${category.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Budget Tracking */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <CardHeader 
              title="Budget Tracking" 
              action={
                <Button 
                  variant="text" 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/budgets')}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                    }
                  }}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {budgets.map((budget) => (
                <AnimatedBudgetProgress key={budget.id} budget={budget} />
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Expenses */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <CardHeader 
              title="Recent Expenses" 
              action={
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <List sx={{ py: 0 }}>
              {dashboardData.recentExpenses.map((expense, index) => (
                <React.Fragment key={expense.id}>
                  <ListItem
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                    secondaryAction={
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        sx={{
                          transition: 'color 0.3s ease',
                          '&:hover': {
                            color: 'primary.main',
                          }
                        }}
                      >
                        ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    }
                  >
                    <ListItemText
                      primary={expense.vendor}
                      secondary={
                        <React.Fragment>
                          <Typography variant="caption" display="block">
                            {expense.date} · {expense.category}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: 
                                expense.status === 'Approved' ? 'success.lighter' :
                                expense.status === 'Pending' ? 'warning.lighter' : 'info.lighter',
                              color:
                                expense.status === 'Approved' ? 'success.main' :
                                expense.status === 'Pending' ? 'warning.main' : 'info.main',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            {expense.status}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.recentExpenses.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>
        
        {/* Policy Compliance */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <CardHeader 
              title="Policy Compliance" 
              action={
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mb: 3 }}>
                <Typography 
                  variant="h2" 
                  color="primary" 
                  fontWeight="bold"
                  sx={{
                    fontSize: '3rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  {dashboardData.policyCompliance}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Compliance Rate
                </Typography>
              </Box>
              
              <Box sx={{ px: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Department Spending
                </Typography>
                
                {dashboardData.expensesByDepartment.map((dept, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{dept.department}</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${dept.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(dept.amount / dashboardData.totalExpenses) * 100}
                      sx={{
                        height: 8, 
                        borderRadius: 1,
                        backgroundColor: 'rgba(0, 121, 193, 0.1)',
                        transition: 'all 0.5s ease',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#0079c1',
                          borderRadius: 1,
                          transition: 'all 0.5s ease',
                        },
                        '&:hover .MuiLinearProgress-bar': {
                          backgroundColor: '#00a0e9',
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;