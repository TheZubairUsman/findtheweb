import React, { createContext, useContext, useReducer, useEffect } from 'react';

const ThemeContext = createContext();

const initialState = {
  theme: 'light',
  isDark: false
};

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        theme: newTheme,
        isDark: newTheme === 'dark'
      };
    
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        isDark: action.payload === 'dark'
      };
    
    default:
      return state;
  }
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Check localStorage first
      const savedTheme = localStorage.getItem('webgem-theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
      } else {
        // Check OS preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        dispatch({ type: 'SET_THEME', payload: defaultTheme });
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      // Fallback to light theme
      dispatch({ type: 'SET_THEME', payload: 'light' });
    }
  }, []);

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (state.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.isDark]);

  // Save theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('webgem-theme', state.theme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [state.theme]);

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const setTheme = (theme) => {
    if (theme === 'light' || theme === 'dark') {
      dispatch({ type: 'SET_THEME', payload: theme });
    }
  };

  const value = {
    theme: state.theme,
    isDark: state.isDark,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
