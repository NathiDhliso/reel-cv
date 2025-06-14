import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference, default to light
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove both classes first
        root.classList.remove('light', 'dark');
        
        // Add the current theme class
        root.classList.add(theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update the data-theme attribute for additional styling if needed
        root.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};