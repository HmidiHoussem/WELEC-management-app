import React, { createContext, useContext, useState } from 'react';
import { darkTheme, lightTheme } from '../../constants/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 5. Default isDarkMode to false (Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// import React, { createContext, useContext, useState } from 'react';
// import { darkTheme, lightTheme } from '../../constants/theme';

// // Create Theme Context
// const ThemeContext = createContext();

// export function ThemeProvider({ children }) {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   // Toggle state
//   const toggleTheme = () => setIsDarkMode((prev) => !prev);

//   // Derive current theme values
//   const theme = isDarkMode ? darkTheme : lightTheme;

//   return (
//     <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// // Custom hook to consume theme easily inside any screen
// export function useTheme() {
//   return useContext(ThemeContext);
// }