/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('access_token'));

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    let active = true;

    authApi.me()
      .then((data) => {
        if (active) {
          setUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const signUp = async (email, password, name) => {
    const data = await authApi.signup(email, password, name);
    localStorage.setItem('access_token', data.token);
    setUser(data.user);
    return data;
  };

  const signIn = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('access_token', data.token);
    setUser(data.user);
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
