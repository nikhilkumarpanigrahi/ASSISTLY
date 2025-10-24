import { createContext, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MESSAGES } from '../utils/constants';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const showNotification = (message, type = 'success') => {
    toast[type](message);
  };

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    showNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};