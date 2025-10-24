import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const NotificationPreferences = ({ open, onClose, userId, currentSettings = {} }) => {
  const [settings, setSettings] = useState({
    email: {
      newRequests: currentSettings?.email?.newRequests ?? true,
      responses: currentSettings?.email?.responses ?? true,
      statusUpdates: currentSettings?.email?.statusUpdates ?? true,
      weeklyDigest: currentSettings?.email?.weeklyDigest ?? false
    },
    push: {
      newRequests: currentSettings?.push?.newRequests ?? true,
      responses: currentSettings?.push?.responses ?? true,
      statusUpdates: currentSettings?.push?.statusUpdates ?? true,
      achievements: currentSettings?.push?.achievements ?? true
    },
    frequency: currentSettings?.frequency ?? 'immediate',
    radius: currentSettings?.radius ?? 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleFrequencyChange = (event) => {
    setSettings(prev => ({
      ...prev,
      frequency: event.target.value
    }));
  };

  const handleRadiusChange = (event) => {
    setSettings(prev => ({
      ...prev,
      radius: event.target.value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        notificationSettings: settings
      });
      onClose();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notification Preferences</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" gutterBottom>
          Email Notifications
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="New Requests"
              secondary="Get notified when new requests are posted in your area"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.email.newRequests}
                onChange={() => handleToggle('email', 'newRequests')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Responses"
              secondary="Get notified when someone responds to your requests"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.email.responses}
                onChange={() => handleToggle('email', 'responses')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Status Updates"
              secondary="Get notified when your requests' status changes"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.email.statusUpdates}
                onChange={() => handleToggle('email', 'statusUpdates')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Weekly Digest"
              secondary="Receive a weekly summary of community activity"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.email.weeklyDigest}
                onChange={() => handleToggle('email', 'weeklyDigest')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Push Notifications
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="New Requests"
              secondary="Instant notifications for new requests in your area"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.push.newRequests}
                onChange={() => handleToggle('push', 'newRequests')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Responses"
              secondary="Instant notifications for responses to your requests"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.push.responses}
                onChange={() => handleToggle('push', 'responses')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Status Updates"
              secondary="Instant notifications for status changes"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.push.statusUpdates}
                onChange={() => handleToggle('push', 'statusUpdates')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Achievements"
              secondary="Get notified when you earn new achievements"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.push.achievements}
                onChange={() => handleToggle('push', 'achievements')}
                disabled={loading}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Notification Frequency</InputLabel>
                <Select
                  value={settings.frequency}
                  onChange={handleFrequencyChange}
                  disabled={loading}
                >
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="hourly">Hourly Digest</MenuItem>
                  <MenuItem value="daily">Daily Digest</MenuItem>
                  <MenuItem value="weekly">Weekly Digest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Notification Radius</InputLabel>
                <Select
                  value={settings.radius}
                  onChange={handleRadiusChange}
                  disabled={loading}
                >
                  <MenuItem value={1}>1 mile</MenuItem>
                  <MenuItem value={5}>5 miles</MenuItem>
                  <MenuItem value={10}>10 miles</MenuItem>
                  <MenuItem value={25}>25 miles</MenuItem>
                  <MenuItem value={50}>50 miles</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPreferences;