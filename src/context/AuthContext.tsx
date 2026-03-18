import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'default-admin',
    name: 'Admin',
    email: 'admin@pgmanager.com',
    role: 'OWNER'
  });
  const [token, setToken] = useState<string | null>('zero-auth-token');

  useEffect(() => {
    const storedToken = localStorage.getItem('pg_token') || 'zero-auth-token';
    const storedUser = localStorage.getItem('pg_user');

    if (storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    } else {
      // Default to "Admin" if nothing is stored
      setToken('zero-auth-token');
      setUser({
        id: 'default-admin',
        name: 'Admin',
        email: 'admin@pgmanager.com',
        role: 'OWNER'
      });
      axios.defaults.headers.common['Authorization'] = `Bearer zero-auth-token`;
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('pg_token', newToken);
    localStorage.setItem('pg_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    // For zero-auth, logout just resets to default admin or clears, 
    // but we want to stay logged in. For now, keep it simple.
    console.log("Logout triggered, but staying in Zero-Auth mode.");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
