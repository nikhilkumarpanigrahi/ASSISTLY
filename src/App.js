import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { collection, doc, query, orderBy, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { useApp } from './context/AppContext';
import { ROUTES, MESSAGES } from './utils/constants';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Components
import Login from './components/Login';
import SignUp from './components/SignUp';
import RequestCard from './components/RequestCard';
import RequestModal from './components/RequestModal';
import ForgotPassword from './components/ForgotPassword';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import Dashboard from './components/Dashboard';

// Meta tags setup
document.title = process.env.REACT_APP_NAME || 'Community Care Platform';
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute('content', process.env.REACT_APP_DESCRIPTION || 'A platform connecting people who need help with volunteers in the community');
}

// Protected Route Component
const ProtectedRoute = React.memo(({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} />;
  }
  
  return children;
});

function App() {
  const { user, setUser, loading, showNotification } = useApp();
  const [requests, setRequests] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);

  // Set up authentication listener
  useAuth(setUser);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification(MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      showNotification('Logout failed. Please try again.', 'error');
    }
  };

  // Fetch requests from Firestore
  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'requests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleVolunteer = async (requestId) => {
    if (!user) return;

    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        status: 'claimed',
        claimedByUid: user.uid,
        claimedBy: user.email,
        history: arrayUnion({ 
          type: 'claimed', 
          byUid: user.uid, 
          by: user.email, 
          at: serverTimestamp() 
        })
      });
      showNotification('Successfully volunteered for this request!');
    } catch (error) {
      showNotification('Error volunteering for request. Please try again.', 'error');
    }
  };

  const handleMarkComplete = async (requestId) => {
    if (!user) return;
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        status: 'completed',
        completedByUid: user.uid,
        completedBy: user.email,
        completedAt: serverTimestamp(),
        history: arrayUnion({ 
          type: 'completed', 
          byUid: user.uid, 
          by: user.email, 
          at: serverTimestamp() 
        })
      });
      showNotification('Request marked as completed!');
    } catch (error) {
      showNotification('Error completing request. Please try again.', 'error');
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {process.env.REACT_APP_NAME || 'Community Care Platform'}
            </Typography>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">
                  Welcome, {user.email}
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button color="inherit" component={Link} to={ROUTES.LOGIN}>
                  Login
                </Button>
                <Button color="inherit" component={Link} to={ROUTES.SIGNUP}>
                  Sign Up
                </Button>
                <Button color="inherit" component={Link} to={ROUTES.DASHBOARD}>
                  Dashboard
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<SignUp />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.TERMS} element={<TermsOfService />} />
          <Route path={ROUTES.PRIVACY} element={<PrivacyPolicy />} />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mb: 3 }}
                    onClick={() => setShowModal(true)}
                  >
                    New Request
                  </Button>

                  {showModal && (
                    <RequestModal
                      onClose={() => setShowModal(false)}
                    />
                  )}

                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {loading ? (
                      <LoadingSpinner />
                    ) : requests.map(request => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        currentUser={user}
                        onVolunteer={handleVolunteer}
                        onComplete={handleMarkComplete}
                      />
                    ))}
                  </Box>
                </Container>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
        </Routes>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
