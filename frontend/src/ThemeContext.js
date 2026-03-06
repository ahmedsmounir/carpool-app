import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = {
    background: isDarkMode ? '#121212' : '#F5F5F5',
    surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    textSecondary: isDarkMode ? '#A0A0A0' : '#555555',
    textMuted: isDarkMode ? '#666666' : '#AAAAAA',
    primary: isDarkMode ? '#FFFFFF' : '#000000',
    primaryText: isDarkMode ? '#000000' : '#FFFFFF',
    border: isDarkMode ? '#333333' : '#E0E0E0',
    inputBackground: isDarkMode ? '#2A2A2A' : '#FAFAFA',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#f0ad4e',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
