import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || null);
  const [userInfo, setUserInfo] = useState(null);

  const login = (newToken, role, userData) => {
    setToken(newToken);
    setUserRole(role);
    setUserInfo(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', role);
    if (userData) localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userInfo');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) setUserInfo(JSON.parse(storedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ token, userRole, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};