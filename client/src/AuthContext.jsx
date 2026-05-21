import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      const storedUser = {
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
        userId: localStorage.getItem('userId'),
        profileCompletion: localStorage.getItem('profileCompletion') || 0
      };

      if (storedToken && storedRole) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          const API_URL = import.meta.env.VITE_API_URL || '/api';
          const response = await axios.get(`${API_URL}/auth/verify`);
          if (response.data?.valid) {
            setToken(storedToken);
            setRole(storedRole);
            setUser(storedUser);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor - automatically add token to requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      const { token: newToken, role: newRole, name, email, userId, profileCompletion } = response.data;

      if (newToken && newRole) {
        // Save to localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', newRole);
        localStorage.setItem('name', name || 'User');
        localStorage.setItem('email', email || credentials.email);
        localStorage.setItem('userId', userId);
        localStorage.setItem('profileCompletion', profileCompletion?.percentage || 0);

        // Update state
        setToken(newToken);
        setRole(newRole);
        setUser({
          name: name || 'User',
          email: email || credentials.email,
          userId,
          profileCompletion: profileCompletion?.percentage || 0
        });

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Navigate to appropriate dashboard
        const dashboardPath = getDashboardPath(newRole);
        navigate(dashboardPath, { replace: true });

        return { success: true };
      } else {
        throw new Error('Invalid response: missing token or role');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('profileCompletion');

    // Reset state
    setToken(null);
    setRole(null);
    setUser(null);

    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];

    // Navigate to login
    navigate('/login', { replace: true });
  };

  // Helper function to get dashboard path based on role
  const getDashboardPath = (userRole) => {
    switch (userRole) {
      case 'student':
        return '/student/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'company':
        return '/company/dashboard';
      case 'tpo':
        return '/tpo/dashboard';
      default:
        return '/login';
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && role && user);
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return role === requiredRole;
  };

  // Context value
  const value = {
    user,
    token,
    role,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getDashboardPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;