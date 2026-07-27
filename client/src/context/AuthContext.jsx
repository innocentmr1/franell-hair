import { createContext, useContext, useState } from 'react';
import { login as apiLogin, register as apiRegister, resetPassword as apiResetPassword } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('franellUser') || 'null'));

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    localStorage.setItem('franellUser', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await apiRegister({ name, email, password });
    localStorage.setItem('franellUser', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await apiResetPassword(token, password);
    localStorage.setItem('franellUser', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const updateUser = (data) => {
    const merged = { ...JSON.parse(localStorage.getItem('franellUser') || '{}'), ...data };
    localStorage.setItem('franellUser', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = () => {
    localStorage.removeItem('franellUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
