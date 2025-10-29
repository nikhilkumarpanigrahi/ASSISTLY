import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link,
  CircularProgress,
  Divider,
  Container,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Google as GoogleIcon 
} from '@mui/icons-material';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';
import { ROUTES, MESSAGES } from '../utils/constants';
import { Link as RouterLink } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const googleProvider = new GoogleAuthProvider();
  // Force account selection every time
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (window.gtag) {
        window.gtag('event', 'sign_up', {
          method: 'google'
        });
      }
      showNotification(MESSAGES.SIGNUP_SUCCESS);
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Google sign up error:', error);
      setError('Failed to sign up with Google. Please try again.');
      showNotification('Sign up failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      showNotification(MESSAGES.SIGNUP_SUCCESS);
      navigate(ROUTES.HOME);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box 
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
            Join Our Community
          </Typography>
          <Typography variant="h5" gutterBottom color="textSecondary">
            Make a Difference in Your Neighborhood
          </Typography>
          <Box sx={{ my: 4 }}>
            <Typography variant="body1" paragraph>
              Create an account to:
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Post and respond to community requests</li>
              <li>Track your impact and contributions</li>
              <li>Connect with neighbors and volunteers</li>
              <li>Receive notifications about local needs</li>
            </Typography>
          </Box>
        </Box>

        {/* Sign Up Form Section */}
        <Paper 
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
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign Up Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignUp}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{ 
              py: 1.5, 
              textTransform: 'none',
              mb: 2
            }}
          >
            Continue with Google
          </Button>

          <Divider sx={{ mb: 2 }}>OR</Divider>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
            
            <TextField
              required
              fullWidth
              label="Password"
              name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            helperText="Must be at least 6 characters long"
          />

          <TextField
            required
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </form>
        
        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
      </Box>
    </Container>
  );
};

export default SignUp;
