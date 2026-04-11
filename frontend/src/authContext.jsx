import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState( localStorage.getItem('token') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || null);
  const [userInfo, setUserInfo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  

  useEffect(() => {
    let intervalId; 

    const fetchUnreadCount = async () => {
      if (!token) {
        setUnreadCount(0);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/history/${userEmail}`);
        
        if (response.ok) {
          const data = await response.json();
          let totalUnread = data.unread_count || 0;
          if (data.is_verified === false) {
            totalUnread += 1; 
          }
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    if (token) {
      intervalId = setInterval(fetchUnreadCount, 30000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [token]);
  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };   

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
    <AuthContext.Provider value={{ token, userRole, userInfo, login, logout, unreadCount, updateUnreadCount }}>
      {children}
    </AuthContext.Provider>
  );
};