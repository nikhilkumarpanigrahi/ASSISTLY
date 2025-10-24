import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';

const StatCard = ({ title, value, total, color, description }) => {
  const percentage = Math.round((value / total) * 100) || 0;
  
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        <Tooltip title={`${value} out of ${total}`}>
          <Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
              {description || `${percentage}% of total`}
            </Typography>
          </Box>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

const ActivityTimeline = ({ activities }) => {
  return (
    <Timeline>
      {activities.map((activity, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color={activity.color || 'primary'} />
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body2" color="textPrimary">
              {activity.title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {activity.date}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

const StatisticsVisualizer = ({ stats, recentActivities }) => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Requests Created"
            value={stats.totalRequests}
            total={stats.communityTotalRequests || 100}
            color="primary"
            description="Your contribution to community requests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Requests"
            value={stats.completedRequests}
            total={stats.totalRequests}
            color="success"
            description="Completion rate of your requests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Helped Others"
            value={stats.helpedOthers}
            total={stats.communityTotalHelped || 100}
            color="secondary"
            description="Your contributions as a helper"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Response Rate"
            value={stats.responseRate || 0}
            total={100}
            color="info"
            description="How often you respond to requests"
          />
        </Grid>
      </Grid>

      {recentActivities && recentActivities.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Card>
            <CardContent>
              <ActivityTimeline activities={recentActivities} />
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default StatisticsVisualizer;