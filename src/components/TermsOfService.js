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

const TermsOfService = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to={ROUTES.HOME} underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Terms of Service</Typography>
        </Breadcrumbs>

        <Paper elevation={1} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Terms of Service
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By accessing and using Assistly, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms, you are
            prohibited from using or accessing this platform.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            2. Use License
          </Typography>
          <Typography paragraph>
            Permission is granted to temporarily access Assistly for personal,
            non-commercial transitory viewing only.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            3. User Responsibilities
          </Typography>
          <Typography paragraph>
            Users are responsible for maintaining the confidentiality of their account and password.
            Users must report any unauthorized use of their account immediately.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            4. Content Guidelines
          </Typography>
          <Typography paragraph>
            Users agree not to upload, share, or promote:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Illegal or unauthorized content</li>
            <li>Harmful or malicious content</li>
            <li>Content that violates others' rights</li>
            <li>Spam or unsolicited promotional material</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            5. Limitation of Liability
          </Typography>
          <Typography paragraph>
            Assistly shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages resulting from your use or inability to use the service.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Last updated: October 24, 2025
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default TermsOfService;