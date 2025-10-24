import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link,
  CircularProgress,
  Container,
  Alert
} from '@mui/material';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../utils/constants';
import { Link as RouterLink } from 'react-router-dom';

// Email validation regex
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const ForgotPassword = () => {
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      showNotification('Password reset email sent successfully');
      
      // Log analytics event
      if (window.gtag) {
        window.gtag('event', 'forgot_password', {
          method: 'email'
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      const errorMessage = error.code === 'auth/user-not-found'
        ? 'No account found with this email address'
        : error.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later'
        : 'Failed to send password reset email. Please try again.';

      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box 
        component="main"
        sx={{
          display: 'flex',
          minHeight: '100vh',
          p: 3,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Reset Password
          </Typography>

          {!success ? (
            <>
              <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={!!error}
                disabled={loading}
                required
                fullWidth
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset email sent! Check your inbox for further instructions.
            </Alert>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Remember your password?{' '}
              <Link
                component={RouterLink}
                to={ROUTES.LOGIN}
                underline="hover"
                color="primary"
              >
                Back to login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;