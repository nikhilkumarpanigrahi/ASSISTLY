import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  VolunteerActivism as VolunteerIcon,
  HelpOutline as HelpIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import ProfileEditor from './ProfileEditor';
import { formatDate } from '../utils/helpers';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfile = () => {
  const { user } = useAuth();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    requestsCreated: 0,
    requestsHelped: 0,
    requestsCompleted: 0,
    averageRating: 0,
    totalRatings: 0,
    badges: []
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setProfileData(userDoc.data());
      } else {
        // Create initial profile
        const initialProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || '',
          bio: '',
          location: '',
          phoneNumber: '',
          website: '',
          skills: [],
          languages: [],
          userType: 'both', // 'resident', 'volunteer', or 'both'
          availability: 'available',
          joinedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userRef, initialProfile);
        setProfileData(initialProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showNotification('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get requests created by user
      const createdQuery = query(
        collection(db, 'requests'),
        where('createdByUid', '==', user.uid)
      );
      const createdSnapshot = await getDocs(createdQuery);
      const requestsCreated = createdSnapshot.size;

      // Get requests helped by user
      const helpedQuery = query(
        collection(db, 'requests'),
        where('claimedByUid', '==', user.uid)
      );
      const helpedSnapshot = await getDocs(helpedQuery);
      const requestsHelped = helpedSnapshot.size;

      // Get completed requests
      const completedQuery = query(
        collection(db, 'requests'),
        where('claimedByUid', '==', user.uid),
        where('status', '==', 'completed')
      );
      const completedSnapshot = await getDocs(completedQuery);
      const requestsCompleted = completedSnapshot.size;

      // Calculate average rating
      let totalRating = 0;
      let ratingCount = 0;
      
      createdSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.rating && data.rating.ratedUserId === user.uid) {
          totalRating += data.rating.score;
          ratingCount++;
        }
      });
      
      helpedSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.rating && data.rating.ratedUserId === user.uid) {
          totalRating += data.rating.score;
          ratingCount++;
        }
      });

      const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

      // Calculate badges
      const badges = [];
      if (requestsHelped >= 1) badges.push({ name: 'First Help', icon: '🌟' });
      if (requestsHelped >= 5) badges.push({ name: 'Helper', icon: '🤝' });
      if (requestsHelped >= 10) badges.push({ name: 'Super Helper', icon: '⭐' });
      if (requestsHelped >= 25) badges.push({ name: 'Community Hero', icon: '🏆' });
      if (requestsCompleted >= 10) badges.push({ name: 'Reliable', icon: '✅' });
      if (averageRating >= 4.5 && ratingCount >= 5) badges.push({ name: 'Highly Rated', icon: '💎' });

      setStats({
        requestsCreated,
        requestsHelped,
        requestsCompleted,
        averageRating,
        totalRatings: ratingCount,
        badges
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
    showNotification('Profile updated successfully!');
    loadProfile();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  const completionPercentage = () => {
    const fields = [
      profileData?.displayName,
      profileData?.bio,
      profileData?.location,
      profileData?.phoneNumber,
      profileData?.skills?.length > 0,
      profileData?.languages?.length > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                stats.averageRating >= 4.5 && stats.totalRatings >= 5 ? (
                  <VerifiedIcon color="primary" sx={{ width: 24, height: 24 }} />
                ) : null
              }
            >
              <Avatar
                src={profileData?.photoURL || user.photoURL}
                sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'primary.main' }}
              >
                {(profileData?.displayName || user.displayName || user.email)?.[0]?.toUpperCase()}
              </Avatar>
            </Badge>
          </Grid>
          
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                {profileData?.displayName || user.displayName || user.email.split('@')[0]}
              </Typography>
              {stats.averageRating >= 4.5 && stats.totalRatings >= 5 && (
                <Tooltip title="Verified Community Member">
                  <VerifiedIcon color="primary" />
                </Tooltip>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              
              {profileData?.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {profileData.location}
                  </Typography>
                </Box>
              )}
              
              {user.metadata?.creationTime && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Joined {new Date(user.metadata.creationTime).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>

            {profileData?.bio && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {profileData.bio}
              </Typography>
            )}

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setShowEditor(true)}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>

        {/* Profile Completion */}
        {completionPercentage() < 100 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Profile Completion
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {completionPercentage()}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={completionPercentage()} sx={{ height: 8, borderRadius: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Complete your profile to help others know you better!
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stats.requestsCreated}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requests Created
                  </Typography>
                </Box>
                <HelpIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.requestsHelped}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    People Helped
                  </Typography>
                </Box>
                <VolunteerIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.requestsCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {stats.averageRating}
                    </Typography>
                    <StarIcon sx={{ color: 'error.main' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating ({stats.totalRatings})
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper elevation={3}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="About" />
          <Tab label="Skills & Languages" />
          <Tab label="Badges & Achievements" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={user.email} />
                </ListItem>
                
                {profileData?.phoneNumber && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Phone" secondary={profileData.phoneNumber} />
                  </ListItem>
                )}
                
                {profileData?.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Location" secondary={profileData.location} />
                  </ListItem>
                )}
                
                {profileData?.website && (
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Website" 
                      secondary={
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                          {profileData.website}
                        </a>
                      } 
                    />
                  </ListItem>
                )}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                About Me
              </Typography>
              {profileData?.bio ? (
                <Typography variant="body1" color="text.secondary">
                  {profileData.bio}
                </Typography>
              ) : (
                <Alert severity="info">
                  Add a bio to tell others about yourself!
                </Alert>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Skills
              </Typography>
              {profileData?.skills && profileData.skills.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profileData.skills.map((skill) => (
                    <Chip key={skill} label={skill} color="primary" />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Add your skills to help others know what you can help with!
                </Alert>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Languages
              </Typography>
              {profileData?.languages && profileData.languages.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profileData.languages.map((language) => (
                    <Chip key={language} label={language} color="secondary" />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Add languages you speak to connect with more people!
                </Alert>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon color="warning" />
            Your Achievements
          </Typography>
          
          {stats.badges.length > 0 ? (
            <Grid container spacing={2}>
              {stats.badges.map((badge, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ mb: 1 }}>
                        {badge.icon}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {badge.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              Start helping others to earn badges and achievements!
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Milestones
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color={stats.requestsHelped >= 1 ? 'success' : 'disabled'} />
              </ListItemIcon>
              <ListItemText 
                primary="Help your first person" 
                secondary={stats.requestsHelped >= 1 ? 'Completed!' : 'Volunteer for a request to unlock'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color={stats.requestsHelped >= 5 ? 'success' : 'disabled'} />
              </ListItemIcon>
              <ListItemText 
                primary="Help 5 people" 
                secondary={stats.requestsHelped >= 5 ? 'Completed!' : `${stats.requestsHelped}/5 completed`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color={stats.requestsHelped >= 10 ? 'success' : 'disabled'} />
              </ListItemIcon>
              <ListItemText 
                primary="Help 10 people" 
                secondary={stats.requestsHelped >= 10 ? 'Completed!' : `${stats.requestsHelped}/10 completed`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color={stats.averageRating >= 4.5 && stats.totalRatings >= 5 ? 'success' : 'disabled'} />
              </ListItemIcon>
              <ListItemText 
                primary="Maintain 4.5+ rating with 5+ reviews" 
                secondary={
                  stats.averageRating >= 4.5 && stats.totalRatings >= 5 
                    ? 'Completed!' 
                    : `Current: ${stats.averageRating} stars (${stats.totalRatings} reviews)`
                }
              />
            </ListItem>
          </List>
        </TabPanel>
      </Paper>

      {/* Profile Editor Dialog */}
      {showEditor && (
        <ProfileEditor
          open={showEditor}
          onClose={() => setShowEditor(false)}
          userData={profileData}
          onUpdate={handleProfileUpdate}
        />
      )}
    </Container>
  );
};

export default UserProfile;
