// ---------------------------------------------------------------------------
// MUI theme – Affordable Housing Portfolio Tracker
// ---------------------------------------------------------------------------
import { createTheme } from '@mui/material/styles';

/** Semantic palette used across the application. */
export const statusColors = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  grey: '#9ca3af',
} as const;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e40af',
    },
    secondary: {
      main: '#7c3aed',
    },
    success: {
      main: statusColors.green,
    },
    warning: {
      main: statusColors.amber,
    },
    error: {
      main: statusColors.red,
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
