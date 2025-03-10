
import React, { createContext, useContext, useEffect, useState } from 'react';

type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has previously set dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode) {
      // Use saved preference
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      applyDarkMode(isDark);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }
  }, []);

  // Function to apply dark mode to document
  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    applyDarkMode(newValue);
    localStorage.setItem('darkMode', newValue.toString());
  };

  const setDarkModeValue = (isDark: boolean) => {
    setDarkMode(isDark);
    applyDarkMode(isDark);
    localStorage.setItem('darkMode', isDark.toString());
  };

  return (
    <DarkModeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      setDarkMode: setDarkModeValue 
    }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};
