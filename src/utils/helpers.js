import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Custom hook for authentication state
export const useAuth = (setUser) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  });
};

// Format date for display
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format request status for display
export const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

// Validate request form data
export const validateRequest = (data) => {
  const { title, description, type } = data;
  if (!title || !description || !type) {
    return 'All fields are required';
  }
  if (title.length < 5) {
    return 'Title must be at least 5 characters long';
  }
  if (description.length < 20) {
    return 'Description must be at least 20 characters long';
  }
  return null;
};