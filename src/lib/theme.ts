// ---------------------------------------------------------------------------
// MUI theme – Affordable Housing Portfolio Tracker
// Color scheme aligned with City of Richmond, VA (rva.gov/housing-and-community-development)
// ---------------------------------------------------------------------------
import { createTheme } from '@mui/material/styles';

/** City of Richmond brand palette */
export const richmondColors = {
  blue: '#15457B',
  blueDark: '#274576',
  blueNavy: '#143058',
  blueLink: '#3969b9',
  blueLinkHover: '#5592f1',
  blueLight: '#92a1b9',
  blueBg: '#E8EBF0',
  crimson: '#892936',
  red: '#AA222A',
  orange: '#F5821E',
  sunset: '#F05023',
  gold: '#FFC805',
  cyan: '#50C8E1',
  purple: '#4B3F72',
  charcoal: '#282938',
  sage: '#B6C4B9',
  sageBg: '#EFF2F0',
  footerGrey: '#53575a',
  textBody: '#212529',
  textDark: '#333333',
  textOnDark: '#efefef',
  greyMedium: '#8D8D8D',
  greyLight: '#d6d6d6',
} as const;

/** Semantic status colors for compliance indicators */
export const statusColors = {
  green: '#22c55e',
  amber: '#F5821E',
  red: '#AA222A',
  grey: '#8D8D8D',
} as const;

const theme = createTheme({
  palette: {
    primary: {
      main: richmondColors.blue,
      dark: richmondColors.blueNavy,
      light: richmondColors.blueLight,
    },
    secondary: {
      main: richmondColors.crimson,
      dark: richmondColors.red,
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
    background: {
      default: richmondColors.sageBg,
      paper: '#ffffff',
    },
    text: {
      primary: richmondColors.textBody,
      secondary: richmondColors.footerGrey,
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Outfit',
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
    MuiLink: {
      styleOverrides: {
        root: {
          color: richmondColors.blueLink,
          '&:hover': {
            color: richmondColors.blueLinkHover,
          },
        },
      },
    },
  },
});

export default theme;
