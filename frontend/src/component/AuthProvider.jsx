import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/user`, { 
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setUser(Object.keys(data).length ? data : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, { 
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    localStorage.removeItem('token');
    setUser(null);
  };

  const login = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
