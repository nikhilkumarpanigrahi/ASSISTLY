import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link,
  CircularProgress,
  Divider,
  Container
} from '@mui/material';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';
import { ROUTES, MESSAGES } from '../utils/constants';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  Visibility, 
  VisibilityOff,
  Google as GoogleIcon 
} from '@mui/icons-material';
import { InputAdornment, IconButton, Alert } from '@mui/material';

// Email validation regex
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const Login = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authProvider, setAuthProvider] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const googleProvider = new GoogleAuthProvider();

  // Set up persistent authentication
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch(error => {
        console.error('Auth persistence error:', error);
      });
  }, []);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));
    setAuthProvider(provider.providerId);

    try {
      const result = await signInWithPopup(auth, provider);
      if (window.gtag) {
        window.gtag('event', 'login', {
          method: provider.providerId
        });
      }
      showNotification(MESSAGES.LOGIN_SUCCESS);
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Social login error:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to sign in with ' + provider.providerId
      }));
      showNotification('Authentication failed', 'error');
    } finally {
      setLoading(false);
      setAuthProvider('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Log analytics event
      if (window.gtag) {
        window.gtag('event', 'login', {
          method: 'email'
        });
      }

      showNotification(MESSAGES.LOGIN_SUCCESS);
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      const errorMessage = error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'
        ? 'Invalid email or password'
        : error.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Please try again later'
        : 'An error occurred during login. Please try again.';

      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
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
          gap: 4
        }}
      >
        {/* Product Information Section */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            pr: 4
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Community Care Platform
          </Typography>
          <Typography variant="h5" gutterBottom color="textSecondary">
            Connect, Share, and Support Your Community
          </Typography>
          <Box sx={{ my: 4 }}>
            <Typography variant="body1" paragraph>
              Welcome to the platform that brings communities together. Make a difference by:
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Connecting with neighbors in need</li>
              <li>Sharing resources and support</li>
              <li>Building stronger communities</li>
              <li>Making a real impact in people's lives</li>
            </Typography>
          </Box>
        </Box>

        {/* Login Form Section */}
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
            gap: 2,
            alignSelf: 'center'
          }}
        >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Sign In
        </Typography>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
          required
          fullWidth
          autoComplete="email"
          autoFocus
          inputProps={{
            'aria-label': 'Email address'
          }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          disabled={loading}
          required
          fullWidth
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
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
            'Sign In'
          )}
        </Button>

        {/* Google Login Button */}
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }}>OR</Divider>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSocialLogin(googleProvider)}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{ textTransform: 'none' }}
          >
            Continue with Google
          </Button>
        </Box>

        {/* Links Section */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" paragraph>
            <Link
              component={RouterLink}
              to={ROUTES.FORGOT_PASSWORD}
              underline="hover"
              color="primary"
            >
              Forgot your password?
            </Link>
          </Typography>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to={ROUTES.SIGNUP}
              underline="hover"
              color="primary"
            >
              Sign up here
            </Link>
          </Typography>
        </Box>

        {/* Terms and Privacy */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            By signing in, you agree to our{' '}
            <Link href="/terms" underline="hover" target="_blank">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" underline="hover" target="_blank">
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
    </Container>
  );
};

export default Login;
