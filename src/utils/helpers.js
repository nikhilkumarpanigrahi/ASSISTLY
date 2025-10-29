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
  
  // Handle Firestore Timestamp
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
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