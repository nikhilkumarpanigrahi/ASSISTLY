// Validation patterns
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
export const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;

// Form validation
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password, isSignup = false) => {
  if (!password) return 'Password is required';
  if (isSignup) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!PASSWORD_REGEX.test(password)) {
      return 'Password must contain at least one letter and one number';
    }
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) return '';  // Phone is optional
  if (!PHONE_REGEX.test(phone)) return 'Please enter a valid phone number';
  return '';
};

// Rate limiting
class RateLimiter {
  constructor(maxAttempts = 5, timeWindow = 300000) { // 5 attempts per 5 minutes
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow;
  }

  async isRateLimited(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove expired attempts
    const validAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    if (validAttempts.length >= this.maxAttempts) {
      return true;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return false;
  }

  async clearAttempts(key) {
    this.attempts.delete(key);
  }
}

export const authRateLimiter = new RateLimiter();

// Error handling
export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
};

// Analytics
export const logAnalyticsEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString()
    });
  }
};