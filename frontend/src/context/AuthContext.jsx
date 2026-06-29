import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // Apply theme classes and attributes
  const applyTheme = (themeName) => {
    const root = document.documentElement;
    if (
      themeName === 'dark' ||
      (themeName === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Load user profile on initialize
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.success) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        if (import.meta.env.DEV) {
          console.error('Failed to load user session:', error.message);
        }
        // Clear tokens if loaded profile fails (e.g. expired token)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Register
  const registerUser = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        toast.success('Registration successful! Welcome!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  // Login
  const loginUser = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        toast.success('Logged in successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout warning:', error.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  // Update Profile
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/me', data);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
      return { success: false, error: error.message };
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (response.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Password change failed');
      return { success: false, error: error.message };
    }
  };

  // Request Reset Password Link
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.success) {
        toast.success('Password reset email sent! Check console logs.');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Password reset request failed');
      return { success: false, error: error.message };
    }
  };

  // Reset Password Confirm
  const resetPassword = async (token, password) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      if (response.success) {
        toast.success('Password reset successful! You can now login.');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Password reset failed');
      return { success: false, error: error.message };
    }
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light'; // loop system -> light -> dark -> system
    });
  };

  const selectTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        register: registerUser,
        login: loginUser,
        logout: logoutUser,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        toggleTheme,
        selectTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
