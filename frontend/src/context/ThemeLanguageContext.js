import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { translations } from '../utils/translations';

const ThemeLanguageContext = createContext();

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  return context;
};

export const ThemeLanguageProvider = ({ children }) => {
  // --- Language State ---
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('kmaths_lang') || 'si'; // Default to Sinhala
  });

  const setLanguage = (lang) => {
    localStorage.setItem('kmaths_lang', lang);
    setLanguageState(lang);
  };

  const t = (key, replacements = {}) => {
    const dict = translations[language] || translations['en'];
    let text = dict[key] || key;
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  // --- Theme State ---
  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem('kmaths_theme') || 'auto'; // Default to auto
  });

  const setThemeMode = (mode) => {
    localStorage.setItem('kmaths_theme', mode);
    setThemeModeState(mode);
  };

  // The actual theme calculated: 'light' or 'dark'
  const [resolvedTheme, setResolvedTheme] = useState('light');

  // Listeners for system settings & ambient light sensor
  useEffect(() => {
    if (themeMode !== 'auto') {
      setResolvedTheme(themeMode);
      return;
    }

    // Auto Mode Logic
    let sensorActive = false;
    let sensorInstance = null;

    // 1. Check for Ambient Light Sensor
    if ('AmbientLightSensor' in window) {
      try {
        sensorInstance = new window.AmbientLightSensor({ frequency: 0.2 });
        sensorInstance.addEventListener('reading', () => {
          // lux < 30 lux is considered dark
          const isDark = sensorInstance.illuminance < 30;
          setResolvedTheme(isDark ? 'dark' : 'light');
          sensorActive = true;
        });
        sensorInstance.addEventListener('error', (event) => {
          console.warn('AmbientLightSensor error, using time/system fallbacks:', event.error);
        });
        sensorInstance.start();
      } catch (err) {
        console.warn('Could not instantiate AmbientLightSensor, using fallbacks:', err);
      }
    }

    // 2. Setup fallbacks: system color scheme preferences & time-of-day
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const evaluateFallbacks = () => {
      if (sensorActive) return; // Ambient sensor has priority

      const systemDark = mediaQuery.matches;
      const hour = new Date().getHours();
      // Night is 6 PM (18:00) to 6 AM (06:00)
      const isNight = hour >= 18 || hour < 6;
      
      setResolvedTheme(systemDark || isNight ? 'dark' : 'light');
    };

    // Run fallback check initially and set interval
    evaluateFallbacks();
    const timeInterval = setInterval(evaluateFallbacks, 60000); // check time every min

    // Listen to media query changes
    const mediaListener = (e) => {
      if (!sensorActive) {
        evaluateFallbacks();
      }
    };
    mediaQuery.addEventListener('change', mediaListener);

    return () => {
      clearInterval(timeInterval);
      mediaQuery.removeEventListener('change', mediaListener);
      if (sensorInstance) {
        try {
          sensorInstance.stop();
        } catch (e) {}
      }
    };
  }, [themeMode]);

  // Create MUI theme based on dynamic resolved theme
  const customTheme = useMemo(() => {
    const isDark = resolvedTheme === 'dark';
    return createTheme({
      palette: {
        mode: resolvedTheme,
        primary: {
          main: '#1565C0',
          light: '#1E88E5',
          dark: '#0D47A1',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#F57C00',
          light: '#FFA726',
          dark: '#E65100',
          contrastText: '#ffffff',
        },
        success: { main: '#2E7D32' },
        error:   { main: '#C62828' },
        warning: { main: '#F9A825' },
        info:    { main: '#0277BD' },
        background: {
          default: isDark ? '#121212' : '#F5F7FA',
          paper:   isDark ? '#1E1E1E' : '#FFFFFF',
        },
        text: {
          primary:   isDark ? '#E2E8F0' : '#1A1A2E',
          secondary: isDark ? '#94A3B8' : '#546E7A',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2.5rem' },
        h2: { fontWeight: 700, fontSize: '2rem' },
        h3: { fontWeight: 600, fontSize: '1.75rem' },
        h4: { fontWeight: 600, fontSize: '1.5rem' },
        h5: { fontWeight: 600, fontSize: '1.25rem' },
        h6: { fontWeight: 600, fontSize: '1rem' },
        subtitle1: { fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: { borderRadius: 10 },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 20px',
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
            },
            containedPrimary: {
              background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.08)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              background: isDark ? '#1F2937' : 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(21,101,192,0.3)',
            },
          },
        },
        MuiChip: {
          styleOverrides: { root: { borderRadius: 6 } },
        },
        MuiTextField: {
          defaultProps: { variant: 'outlined', size: 'small' },
        },
        MuiPaper: {
          styleOverrides: {
            root: { borderRadius: 12 },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              background: isDark ? '#111827' : 'linear-gradient(180deg, #0D47A1 0%, #1565C0 100%)',
              color: '#fff',
            },
          },
        },
      },
    });
  }, [resolvedTheme]);

  return (
    <ThemeLanguageContext.Provider value={{ language, setLanguage, themeMode, setThemeMode, resolvedTheme, t }}>
      <MuiThemeProvider theme={customTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeLanguageContext.Provider>
  );
};
