import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  EditRounded as EditIcon,
  VolunteerActivism as VolunteerIcon,
  EmojiEvents as AchievementsIcon,
  History as HistoryIcon,
  LocalOffer as TagIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  EmojiPeople as CommunityIcon,
  SupervisorAccount as MentorIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  Weekend as WeekendIcon,
  DateRange as DateRangeIcon,
  WorkspacePremium as WorkspacePremiumIcon
} from '@mui/icons-material';
import ProfileEditor from './ProfileEditor';
import StatisticsVisualizer from './StatisticsVisualizer';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { COLLECTIONS } from '../utils/constants';
import RequestCard from './RequestCard';

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    helpedOthers: 0,
    impact: 0,
    responseRate: 0,
    communityTotalRequests: 0,
    communityTotalHelped: 0,
    categoriesBreakdown: {}
  });
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [helpedRequests, setHelpedRequests] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Helper function to calculate consecutive active days
  function calculateConsecutiveDays(activities) {
    // Extract all activity dates as YYYY-MM-DD strings
    const dates = activities
      .map(a => {
        const dateObj = a.createdAt?.toDate?.() || (a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : null);
        return dateObj ? dateObj.toISOString().slice(0, 10) : null;
      })
      .filter(Boolean);
    // Remove duplicates and sort
    const uniqueDates = Array.from(new Set(dates)).sort();
    let maxStreak = 0;
    let currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    return maxStreak;
  }

  // Fetch user data and statistics
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get last 6 months for activity chart
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Fetch user's requests
        const requestsQuery = query(
          collection(db, COLLECTIONS.REQUESTS),
          where('createdByUid', '==', user.uid)
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requests = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyRequests(requests);

        // Calculate categories breakdown
        const categories = requests.reduce((acc, request) => {
          const category = request.category || 'Other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        // Fetch requests user has helped with (claimed by user)
        const helpedQuery = query(
          collection(db, COLLECTIONS.REQUESTS),
          where('claimedByUid', '==', user.uid)
        );
        const helpedSnapshot = await getDocs(helpedQuery);
        const helped = helpedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHelpedRequests(helped);

        // Calculate response rate first
        const totalOpportunities = helped.length + requests.filter(r => r.status === 'open').length;
        const responseRate = totalOpportunities > 0
          ? Math.round((helped.length / totalOpportunities) * 100)
          : 0;

        // Calculate statistics
        setUserStats({
          totalRequests: requests.length,
          completedRequests: requests.filter(r => r.status === 'completed').length,
          helpedOthers: helped.length,
          impact: helped.length + requests.filter(r => r.status === 'completed').length,
          responseRate: responseRate
        });

        // Calculate achievements
        const userAchievements = [];
        
        // Request Creation Achievements
        if (requests.length >= 5) {
          userAchievements.push({
            title: 'Request Creator',
            description: 'Created 5 or more requests',
            icon: <TagIcon />,
            color: 'primary'
          });
        }
        if (requests.length >= 20) {
          userAchievements.push({
            title: 'Request Master',
            description: 'Created 20 or more requests',
            icon: <VerifiedIcon />,
            color: 'primary'
          });
        }

        // Helper Achievements
        if (helped.length >= 5) {
          userAchievements.push({
            title: 'Super Helper',
            description: 'Helped 5 or more community members',
            icon: <VolunteerIcon />,
            color: 'success'
          });
        }
        if (helped.length >= 20) {
          userAchievements.push({
            title: 'Helper Elite',
            description: 'Helped 20 or more community members',
            icon: <TrendingUpIcon />,
            color: 'success'
          });
        }

        // Impact Achievements
        if (userStats.impact >= 10) {
          userAchievements.push({
            title: 'Community Champion',
            description: 'Made an impact on 10+ occasions',
            icon: <CommunityIcon />,
            color: 'secondary'
          });
        }
        if (userStats.impact >= 50) {
          userAchievements.push({
            title: 'Community Legend',
            description: 'Made an impact on 50+ occasions',
            icon: <MentorIcon />,
            color: 'secondary'
          });
        }

        // Reliability Achievements
        if (responseRate >= 50) {
          userAchievements.push({
            title: 'Reliable Helper',
            description: '50%+ response rate to community requests',
            icon: <AccessTimeIcon />,
            color: 'info'
          });
        }
        if (responseRate >= 80) {
          userAchievements.push({
            title: 'Dependable Pillar',
            description: '80%+ response rate to community requests',
            icon: <StarIcon />,
            color: 'info'
          });
        }

        // Consistency Achievements
        const consecutiveDays = calculateConsecutiveDays([...requests, ...helped]);
        if (consecutiveDays >= 7) {
          userAchievements.push({
            title: 'Weekly Warrior',
            description: 'Active for 7 consecutive days',
            icon: <WeekendIcon />,
            color: 'warning'
          });
        }
        if (consecutiveDays >= 30) {
          userAchievements.push({
            title: 'Monthly Maven',
            description: 'Active for 30 consecutive days',
            icon: <DateRangeIcon />,
            color: 'warning'
          });
        }

        // Engagement Achievements
        const quickResponseCount = helped.filter(h => 
          h.responseTime && h.responseTime <= 3600000 // 1 hour in milliseconds
        ).length;
        if (quickResponseCount >= 5) {
          userAchievements.push({
            title: 'Quick Responder',
            description: 'Responded to 5 requests within 1 hour',
            icon: <AccessTimeIcon />,
            color: 'info'
          });
        }

        // Rating Excellence
        const fiveStarCount = helped.filter(h => h.rating === 5).length;
        if (fiveStarCount >= 10) {
          userAchievements.push({
            title: 'Five Star Excellence',
            description: 'Received 10 or more 5-star ratings',
            icon: <StarIcon />,
            color: 'primary'
          });
        }

        // Weekend Warrior
        const weekendHelps = helped.filter(h => {
          const date = new Date(h.timestamp.seconds * 1000);
          return date.getDay() === 0 || date.getDay() === 6;
        });
        if (weekendHelps.length >= 10) {
          userAchievements.push({
            title: 'Weekend Warrior',
            description: 'Helped 10 times during weekends',
            icon: <WeekendIcon />,
            color: 'success'
          });
        }

        // Premium Status
        if (helped.length >= 100) {
          userAchievements.push({
            title: 'Premium Helper',
            description: 'Completed 100 successful helps',
            icon: <WorkspacePremiumIcon />,
            color: 'secondary'
          });
        }

        // Category Achievements
        Object.entries(categories).forEach(([category, count]) => {
          // Category Specialist (Bronze)
          if (count >= 10) {
            userAchievements.push({
              title: `${category} Specialist`,
              description: `Completed 10+ requests in ${category}`,
              icon: <WorkspacePremiumIcon />,
              color: 'warning'
            });
          }
          
          // Category Expert (Silver)
          if (count >= 25) {
            userAchievements.push({
              title: `${category} Expert`,
              description: `Completed 25+ requests in ${category}`,
              icon: <WorkspacePremiumIcon />,
              color: 'info'
            });
          }
          
          // Category Master (Gold)
          if (count >= 50) {
            userAchievements.push({
              title: `${category} Master`,
              description: `Completed 50+ requests in ${category}`,
              icon: <WorkspacePremiumIcon />,
              color: 'secondary'
            });
          }
          
          // Category Rating Excellence
          const categoryFiveStars = helped
            .filter(h => h.category === category && h.rating === 5)
            .length;
          if (categoryFiveStars >= 15) {
            userAchievements.push({
              title: `${category} Excellence`,
              description: `Received 15+ five-star ratings in ${category}`,
              icon: <StarIcon />,
              color: 'success'
            });
          }
          
          // Category Quick Response
          const categoryQuickResponses = helped
            .filter(h => h.category === category && h.responseTime && h.responseTime <= 3600000)
            .length;
          if (categoryQuickResponses >= 10) {
            userAchievements.push({
              title: `Swift ${category} Helper`,
              description: `Quick response to 10+ ${category} requests`,
              icon: <AccessTimeIcon />,
              color: 'info'
            });
          }
          
          // Category Weekend Warrior
          const categoryWeekendHelps = helped.filter(h => {
            if (h.category !== category) return false;
            const date = new Date(h.timestamp.seconds * 1000);
            return date.getDay() === 0 || date.getDay() === 6;
          }).length;
          if (categoryWeekendHelps >= 8) {
            userAchievements.push({
              title: `${category} Weekend Hero`,
              description: `Completed 8+ ${category} requests on weekends`,
              icon: <WeekendIcon />,
              color: 'warning'
            });
          }
        });

        // Add category diversity achievement
        const categoriesWithFiveOrMore = Object.values(categories)
          .filter(count => count >= 5)
          .length;
        if (categoriesWithFiveOrMore >= 3) {
          userAchievements.push({
            title: 'Versatile Helper',
            description: 'Completed 5+ requests in at least 3 categories',
            icon: <WorkspacePremiumIcon />,
            color: 'primary'
          });
        }

        // Get community totals
        const communitySnapshot = await getDocs(collection(db, COLLECTIONS.REQUESTS));
        const communityTotalRequests = communitySnapshot.size;
        const communityTotalHelped = communitySnapshot.docs
          .filter(doc => doc.data().helpedBy?.length > 0).length;

        // Prepare activity chart data
        const months = {};
        const helpedMonths = {};
        [...requests, ...helped].forEach(item => {
          const date = item.createdAt.toDate();
          const monthKey = date.toLocaleString('default', { month: 'short' });
          if (item.userId === user.uid) {
            months[monthKey] = (months[monthKey] || 0) + 1;
          } else {
            helpedMonths[monthKey] = (helpedMonths[monthKey] || 0) + 1;
          }
        });

        setAchievements(userAchievements);

      } catch (error) {
        console.error('Error fetching user data:', error);
        showNotification('Error loading dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, showNotification]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Grid item>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Tooltip title="Click to edit profile">
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: 'primary.main',
                    cursor: 'pointer'
                  }}
                  src={user.photoURL}
                  onClick={() => setShowProfileEditor(true)}
                >
                  {user.displayName?.[0] || user.email[0].toUpperCase()}
                </Avatar>
              </Tooltip>
            </Badge>
          </Grid>
          <Grid item xs={12} sm>
            <Typography variant="h4" gutterBottom>
              Welcome, {user.displayName || user.email}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Member since {new Date(user.metadata.creationTime).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        {/* Statistics Visualizer */}
        <StatisticsVisualizer
          stats={userStats}
          recentActivities={[...myRequests, ...helpedRequests]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5)
            .map(activity => ({
              title: activity.title,
              date: new Date(activity.createdAt.toDate()).toLocaleDateString(),
              color: activity.userId === user.uid ? 'primary' : 'success'
            }))}
        />

        {/* Tabs Section */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PersonIcon />} label="My Requests" />
            <Tab icon={<VolunteerIcon />} label="Helped Others" />
            <Tab icon={<AchievementsIcon />} label="Achievements" />
            <Tab icon={<HistoryIcon />} label="Activity" />
          </Tabs>

          {/* My Requests Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {myRequests.length > 0 ? (
                myRequests.map(request => (
                  <Grid item xs={12} sm={6} md={4} key={request.id}>
                    <RequestCard request={request} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography align="center" color="textSecondary">
                    You haven't created any requests yet
                  </Typography>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Helped Others Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              {helpedRequests.length > 0 ? (
                helpedRequests.map(request => (
                  <Grid item xs={12} sm={6} md={4} key={request.id}>
                    <RequestCard request={request} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography align="center" color="textSecondary">
                    You haven't helped with any requests yet
                  </Typography>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Achievements Tab */}
          <TabPanel value={activeTab} index={2}>
            <List>
              {achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <React.Fragment key={achievement.title}>
                    <ListItem>
                      <ListItemIcon>
                        <Typography fontSize="24px">{achievement.icon}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={achievement.title}
                        secondary={achievement.description}
                      />
                    </ListItem>
                    {index < achievements.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography align="center" color="textSecondary">
                  Keep helping others to earn achievements!
                </Typography>
              )}
            </List>
          </TabPanel>

          {/* Activity Tab */}
          <TabPanel value={activeTab} index={3}>
            <List>
              {[...myRequests, ...helpedRequests]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(activity => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.userId === user.uid ? <PersonIcon /> : <VolunteerIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={`${activity.userId === user.uid ? 'Created' : 'Helped with'} request on ${new Date(activity.createdAt.toDate()).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          </TabPanel>
        </Paper>

        {/* Profile Editor Dialog */}
        <ProfileEditor
          open={showProfileEditor}
          onClose={() => setShowProfileEditor(false)}
          userData={user}
          onUpdate={(updatedData) => {
            // Refresh user data here if needed
            setShowProfileEditor(false);
          }}
        />
      </Box>
    </Container>
  );
};

export default Dashboard;