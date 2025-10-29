import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Box, Typography, Chip, Button, Paper, IconButton, Tooltip } from '@mui/material';
import { LocationOn as LocationIcon, MyLocation as MyLocationIcon } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icon for requests
const createCustomIcon = (urgency) => {
  const color = urgency === 'high' ? '#f44336' : urgency === 'medium' ? '#ff9800' : '#4caf50';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          margin-top: 5px;
          margin-left: 7px;
          color: white;
          font-size: 16px;
        ">📍</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// User location marker (blue dot)
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        background-color: #2196f3;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(33, 150, 243, 0.6);
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

// Component to handle map centering
const MapController = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const MapView = ({ requests = [], onRequestClick, center = [20.5937, 78.9629], zoom = 5 }) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);

  // Get user's current location
  const getUserLocation = () => {
    setLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = [latitude, longitude];
        setUserLocation(userPos);
        setMapCenter(userPos);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location services.');
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <Paper elevation={3} sx={{ height: '600px', width: '100%', overflow: 'hidden', borderRadius: 2, position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={createUserLocationIcon()}>
              <Popup>
                <Box sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>
                    📍 You are here
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your current location
                  </Typography>
                </Box>
              </Popup>
            </Marker>
            {/* Accuracy circle */}
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                color: '#2196f3',
                fillColor: '#2196f3',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}

        {requests.map((request) => {
          // Only show requests with valid coordinates
          if (!request.location?.coordinates) return null;
          
          const { lat, lng } = request.location.coordinates;
          if (!lat || !lng) return null;

          return (
            <Marker
              key={request.id}
              position={[lat, lng]}
              icon={createCustomIcon(request.urgency)}
            >
              <Popup maxWidth={300}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {request.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={request.category}
                      size="small"
                      color="primary"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={request.urgency}
                      size="small"
                      color={
                        request.urgency === 'high' ? 'error' :
                        request.urgency === 'medium' ? 'warning' : 'success'
                      }
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={request.status}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
                    {request.description?.substring(0, 100)}
                    {request.description?.length > 100 ? '...' : ''}
                  </Typography>

                  {request.location?.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {request.location.address}
                      </Typography>
                    </Box>
                  )}

                  {onRequestClick && (
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => onRequestClick(request)}
                      sx={{ mt: 1 }}
                    >
                      View Details
                    </Button>
                  )}
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* My Location Button Overlay */}
      <Tooltip title="Show my location" placement="left">
        <IconButton
          onClick={getUserLocation}
          disabled={loadingLocation}
          sx={{
            position: 'absolute',
            top: 80,
            right: 10,
            zIndex: 1000,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'background.paper',
              boxShadow: 4
            },
            '&:disabled': {
              backgroundColor: 'action.disabledBackground'
            }
          }}
        >
          <MyLocationIcon color={userLocation ? 'primary' : 'action'} />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default MapView;
