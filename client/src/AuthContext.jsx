import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from './services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          const API_URL = getApiUrl();
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

  useEffect(() => {
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

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = async (credentials) => {
    try {
      const API_URL = getApiUrl();
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      const { token: newToken, role: newRole, name, email, userId, profileCompletion } = response.data;

      if (newToken && newRole) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', newRole);
        localStorage.setItem('name', name || 'User');
        localStorage.setItem('email', email || credentials.email);
        localStorage.setItem('userId', userId);
        localStorage.setItem('profileCompletion', profileCompletion?.percentage || 0);

        setToken(newToken);
        setRole(newRole);
        setUser({
          name: name || 'User',
          email: email || credentials.email,
          userId,
          profileCompletion: profileCompletion?.percentage || 0
        });

        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('profileCompletion');

    setToken(null);
    setRole(null);
    setUser(null);

    delete axios.defaults.headers.common['Authorization'];

    navigate('/login', { replace: true });
  };

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

  const isAuthenticated = () => {
    return !!(token && role && user);
  };

  const hasRole = (requiredRole) => {
    return role === requiredRole;
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
