import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  IconButton,
  Chip,
  Paper
} from '@mui/material';
import { MyLocation as MyLocationIcon, Close as CloseIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { COLLECTIONS, MESSAGES } from '../utils/constants';

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const REQUEST_CATEGORIES = [
  'General Help',
  'Groceries & Shopping',
  'Medical Assistance',
  'Transportation',
  'Housework & Cleaning',
  'Pet Care',
  'Childcare',
  'Technology Help',
  'Yard Work',
  'Moving & Delivery',
  'Companionship',
  'Other'
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Can wait a few days', color: 'success' },
  { value: 'medium', label: 'Medium - Within 24-48 hours', color: 'warning' },
  { value: 'high', label: 'High - Urgent, ASAP', color: 'error' }
];

// Map click handler component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const RequestModal = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General Help',
    location: '',
    urgency: 'medium',
    contactInfo: '',
    estimatedTime: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition({ lat: latitude, lng: longitude });
        setShowMap(true);
      },
      (error) => {
        console.error('Error getting location:', error);
        showNotification('Unable to get your location', 'error');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      showNotification('You must be logged in to create a request', 'error');
      return;
    }
    
    setLoading(true);

    try {
      // Ensure we have a display name
      const displayName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
      
      const requestData = {
        ...formData,
        status: 'open',
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        postedBy: displayName,
        postedByEmail: user.email || '',
        createdBy: user.email || '',
        createdByUid: user.uid,
        views: 0,
        history: [{
          type: 'created',
          by: user.email || 'Unknown',
          byUid: user.uid,
          at: new Date().toISOString()
        }]
      };

      // Add location coordinates if map position is set
      if (mapPosition) {
        requestData.location = {
          coordinates: {
            lat: mapPosition.lat,
            lng: mapPosition.lng
          },
          address: formData.location // Text address from form
        };
      }

      await addDoc(collection(db, COLLECTIONS.REQUESTS), requestData);
      
      showNotification(MESSAGES.REQUEST_CREATED || 'Request created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating request:', error);
      showNotification(error.message || 'Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Request</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            
            <TextField
              required
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              multiline
              rows={4}
            />
            
            <TextField
              required
              fullWidth
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              helperText="What type of help do you need?"
            >
              {REQUEST_CATEGORIES.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              required
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., Downtown, 123 Main St, or Neighborhood name"
              helperText="Where is help needed?"
            />

            {/* Location Picker */}
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  onClick={getUserLocation}
                  size="small"
                  fullWidth
                >
                  Use My Location
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowMap(!showMap)}
                  size="small"
                  fullWidth
                >
                  {showMap ? 'Hide Map' : 'Pick on Map'}
                </Button>
              </Box>

              {mapPosition && (
                <Chip
                  label={`📍 ${mapPosition.lat.toFixed(4)}, ${mapPosition.lng.toFixed(4)}`}
                  onDelete={() => setMapPosition(null)}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}

              {showMap && (
                <Paper elevation={2} sx={{ height: 300, overflow: 'hidden', borderRadius: 1 }}>
                  <MapContainer
                    center={mapPosition || [20.5937, 78.9629]}
                    zoom={mapPosition ? 15 : 5}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                  </MapContainer>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', p: 1, textAlign: 'center' }}>
                    Click on the map to set your location
                  </Typography>
                </Paper>
              )}
            </Box>
            
            <TextField
              required
              fullWidth
              select
              label="Urgency Level"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              disabled={loading}
              helperText="How soon do you need help?"
            >
              {URGENCY_LEVELS.map(level => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Estimated Time Needed"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., 1-2 hours, 30 minutes"
              helperText="Optional: How long might this take?"
            />
            
            <TextField
              fullWidth
              label="Contact Information"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              disabled={loading}
              placeholder="Phone number or preferred contact method"
              helperText="Optional: How should volunteers reach you?"
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Create Request
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RequestModal;
