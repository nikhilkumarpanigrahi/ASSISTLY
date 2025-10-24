// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  REQUESTS: '/requests',
  PROFILE: '/profile',
  REQUEST_DETAIL: '/request/:id',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  DASHBOARD: '/dashboard'
};

// Toast Messages
export const MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  REQUEST_CREATED: 'Request created successfully!',
  REQUEST_UPDATED: 'Request updated successfully!',
  ERROR: 'An error occurred. Please try again.',
  LOGOUT_SUCCESS: 'Successfully logged out!'
};

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  REQUESTS: 'requests',
  RESPONSES: 'responses'
};

// Request Status
export const REQUEST_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};