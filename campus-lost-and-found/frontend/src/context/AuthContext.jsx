import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserToken = localStorage.getItem('campus_user_token');
      const storedUserInfo = localStorage.getItem('campus_user_info');
      if (storedUserToken && storedUserInfo) {
        setUserToken(storedUserToken);
        setUser(JSON.parse(storedUserInfo));
      }

      const storedAdminToken = localStorage.getItem('campus_admin_token');
      const storedAdminInfo = localStorage.getItem('campus_admin_info');
      if (storedAdminToken && storedAdminInfo) {
        setAdminToken(storedAdminToken);
        setAdmin(JSON.parse(storedAdminInfo));
      }
    } catch (e) {
      console.error('Failed to restore session from localStorage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userInfo) => {
    localStorage.setItem('campus_user_token', token);
    localStorage.setItem('campus_user_info', JSON.stringify(userInfo));
    setUserToken(token);
    setUser(userInfo);
  };

  const logoutUser = () => {
    localStorage.removeItem('campus_user_token');
    localStorage.removeItem('campus_user_info');
    setUserToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    localStorage.setItem('campus_user_info', JSON.stringify(updated));
    setUser(updated);
  };

  const loginAdmin = (token, adminInfo) => {
    localStorage.setItem('campus_admin_token', token);
    localStorage.setItem('campus_admin_info', JSON.stringify(adminInfo));
    setAdminToken(token);
    setAdmin(adminInfo);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('campus_admin_token');
    localStorage.removeItem('campus_admin_info');
    setAdminToken(null);
    setAdmin(null);
  };

  const updateAdminProfile = (updatedData) => {
    const updated = { ...admin, ...updatedData };
    localStorage.setItem('campus_admin_info', JSON.stringify(updated));
    setAdmin(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        isUserAuthenticated: !!userToken,
        loginUser,
        logoutUser,
        updateUserProfile,

        admin,
        adminToken,
        isAdminAuthenticated: !!adminToken,
        loginAdmin,
        logoutAdmin,
        updateAdminProfile,

        loading,
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
