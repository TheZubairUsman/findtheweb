import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const readStorage = key => { try { return window.localStorage.getItem(key); } catch (_) { return null; } };

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if admin is logged in on mount
  useEffect(() => {
    const token = readStorage('adminToken');
    const adminData = readStorage('adminData');
    
    if (token && adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        setUser(parsedAdmin);
      } catch (err) {
        console.error('Error parsing admin data:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    }
    
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Input validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use status-based error messages
          if (response.status === 401) {
            errorMessage = 'Invalid email or password';
          } else if (response.status === 423) {
            errorMessage = 'Account is temporarily locked due to too many failed attempts';
          } else if (response.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later';
          } else {
            errorMessage = `Login failed (${response.status})`;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Accept the backend's nested response and its legacy top-level alias.
      const { token, admin } = data.data || data;
      if (typeof token !== 'string' || !token || !admin || typeof admin !== 'object' || Array.isArray(admin)) {
        throw new Error('Invalid response from server');
      }

      // Store token and admin data securely
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(admin));
      
      setUser(admin);
      return { ...data, token, admin };
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection and try again.');
      } else {
        setError(err.message);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = readStorage('adminToken');
      
      // Call logout endpoint if token exists
      if (token) {
        await fetch('/api/v1/auth/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setUser(null);
      setError(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const token = readStorage('adminToken');
      
      if (!token) {
        logout();
        return null;
      }

      const response = await fetch('/api/v1/auth/admin/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token refresh failed, logout admin
        logout();
        return null;
      }

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        if (data.admin) {
          localStorage.setItem('adminData', JSON.stringify(data.admin));
          setUser(data.admin);
        }
        return data.token;
      } else {
        logout();
        return null;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return null;
    }
  }, [logout]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const token = readStorage('adminToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Validate inputs
      if (!currentPassword || !newPassword) {
        throw new Error('Both current and new passwords are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      const response = await fetch('/api/v1/auth/admin/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return data;
    } catch (err) {
      console.error('Password change error:', err);
      throw err;
    }
  }, []);

  // Helper functions
  const isAuthenticated = Boolean(user && readStorage('adminToken'));
  // UI state only; API authorization remains enforced by the server.
  const isAdmin = Boolean(user && (user.role === 'admin' || user.isAdmin === true));

  // The API does not expose a refresh endpoint. Keep the server-issued session
  // until it expires instead of logging an editor out on a periodic 404.

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshToken,
    changePassword,
    adminToken: readStorage('adminToken'),
    adminData: user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
