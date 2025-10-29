import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const LocationVerification = ({ 
  open, 
  onClose, 
  requestLocation, 
  onVerified,
  maxDistance = 100 // Maximum distance in meters (default 100m)
}) => {
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      getUserLocation();
    }
  }, [open]);

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });

        // Calculate distance to request location
        if (requestLocation?.coordinates) {
          const dist = calculateDistance(
            latitude,
            longitude,
            requestLocation.coordinates.lat,
            requestLocation.coordinates.lng
          );
          setDistance(dist);

          // Verify if within acceptable range
          if (dist <= maxDistance) {
            setVerified(true);
          }
        }

        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enable location services and try again.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleComplete = () => {
    if (verified && userLocation) {
      onVerified({
        userLocation,
        distance,
        timestamp: new Date().toISOString(),
        verified: true
      });
      onClose();
    }
  };

  const getDistanceColor = () => {
    if (!distance) return 'default';
    if (distance <= maxDistance) return 'success';
    if (distance <= maxDistance * 2) return 'warning';
    return 'error';
  };

  const getDistanceText = () => {
    if (!distance) return 'Calculating...';
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    }
    return `${(distance / 1000).toFixed(2)}km away`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MyLocationIcon color="primary" />
          <Typography variant="h6">Location Verification</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Getting your location...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Alert 
              severity={verified ? 'success' : 'warning'} 
              icon={verified ? <CheckIcon /> : <WarningIcon />}
              sx={{ mb: 3 }}
            >
              {verified 
                ? 'Location verified! You are at the request location.'
                : 'You must be at the request location to complete this task.'}
            </Alert>

            {distance !== null && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Distance to request location:
                  </Typography>
                  <Chip 
                    label={getDistanceText()} 
                    color={getDistanceColor()}
                    size="small"
                  />
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((maxDistance / distance) * 100, 100)}
                  color={getDistanceColor()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Must be within {maxDistance}m to complete
                </Typography>
              </Box>
            )}

            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Your Location:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationIcon fontSize="small" color="primary" />
                <Typography variant="body2">
                  {userLocation?.lat.toFixed(6)}, {userLocation?.lng.toFixed(6)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Accuracy: ±{userLocation?.accuracy?.toFixed(0)}m
              </Typography>
            </Box>

            {requestLocation?.address && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Request Location:
                </Typography>
                <Typography variant="body2">
                  {requestLocation.address}
                </Typography>
              </Box>
            )}

            {!verified && distance > maxDistance && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Too far away!</strong> Please move closer to the request location.
                  You are currently {getDistanceText()} from the location.
                </Typography>
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        {!loading && !error && (
          <Button 
            onClick={getUserLocation}
            variant="outlined"
            startIcon={<MyLocationIcon />}
          >
            Refresh Location
          </Button>
        )}
        <Button
          onClick={handleComplete}
          variant="contained"
          disabled={!verified || loading}
          startIcon={<CheckIcon />}
        >
          Verify & Complete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationVerification;
