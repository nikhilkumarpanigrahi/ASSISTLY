import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to={ROUTES.HOME} underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Privacy Policy</Typography>
        </Breadcrumbs>

        <Paper elevation={1} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            1. Information We Collect
          </Typography>
          <Typography paragraph>
            We collect information that you provide directly to us, including:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Account information (name, email, password)</li>
            <li>Profile information</li>
            <li>Content you post or share</li>
            <li>Communications with other users</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            2. How We Use Your Information
          </Typography>
          <Typography paragraph>
            We use the information we collect to:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Provide and maintain our services</li>
            <li>Process your requests and transactions</li>
            <li>Communicate with you</li>
            <li>Improve our services</li>
            <li>Protect against fraud and abuse</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            3. Information Sharing
          </Typography>
          <Typography paragraph>
            We do not sell or rent your personal information to third parties. We may share your
            information in the following circumstances:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in our operations</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            4. Data Security
          </Typography>
          <Typography paragraph>
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            5. Your Rights
          </Typography>
          <Typography paragraph>
            You have the right to:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Data portability</li>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Last updated: October 24, 2025
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;