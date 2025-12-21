import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    gradient: {
      primary: string;
      secondary: string;
      dark: string;
    };
  }
  interface PaletteOptions {
    gradient?: {
      primary?: string;
      secondary?: string;
      dark?: string;
    };
  }
}

const cinemaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF3A44',
      light: '#FF6B73',
      dark: '#CC2E36',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4ECDC4',
      light: '#7BD9D2',
      dark: '#3AAFA7',
    },
    background: {
      default: '#0F1014',
      paper: '#1F2128',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B3B8',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #FF3A44 0%, #FF6B73 100%)',
      secondary: 'linear-gradient(135deg, #4ECDC4 0%, #7BD9D2 100%)',
      dark: 'linear-gradient(135deg, #0F1014 0%, #1F2128 100%)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 28px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FF3A44 0%, #FF6B73 100%)',
          boxShadow: '0 4px 20px rgba(255, 58, 68, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FF6B73 0%, #FF3A44 100%)',
            boxShadow: '0 6px 25px rgba(255, 58, 68, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #1A1A2E 0%, #252540 100%)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 16, 20, 0.95)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
});

export default cinemaTheme;