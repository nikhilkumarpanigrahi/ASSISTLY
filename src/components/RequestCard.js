import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box
} from '@mui/material';
import { formatDate } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const RequestCard = ({ request, onVolunteer, onComplete }) => {
  const { user } = useApp();
  const isClaimed = request.status === 'claimed';
  const isCompleted = request.status === 'completed';
  const isOwner = request.createdByUid === user?.uid;
  const isVolunteer = request.claimedByUid === user?.uid;
  
  const getStatusColor = () => {
    switch (request.status) {
      case 'open': return 'info';
      case 'claimed': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" noWrap>
            {request.title}
          </Typography>
          <Chip 
            label={request.status.toUpperCase()} 
            color={getStatusColor()}
            size="small"
          />
        </Box>
      </CardContent>
      
      <CardContent>
        {request.category && (
          <Box mb={1}>
            <Chip label={request.category} size="small" color="primary" variant="outlined" />
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {request.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Location:</strong> {request.location}
          </Typography>
          
          <Typography variant="body2">
            <strong>Urgency:</strong>{' '}
            <Chip 
              label={request.urgency} 
              size="small"
              color={request.urgency === 'high' ? 'error' : request.urgency === 'medium' ? 'warning' : 'success'}
            />
          </Typography>
          
          <Typography variant="body2">
            <strong>Posted by:</strong> {request.postedBy || request.postedByEmail || 'Anonymous'}
          </Typography>
          
          <Typography variant="body2">
            <strong>Date:</strong> {formatDate(request.timestamp)}
          </Typography>
          
          {isClaimed && (
            <Typography variant="body2">
              <strong>Claimed by:</strong> {request.claimedBy || request.claimedByEmail || '—'}
            </Typography>
          )}
        </Box>
        
        {request.contactInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Contact:</strong> {request.contactInfo}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ padding: 2, justifyContent: 'flex-end' }}>
        {!isOwner && !isCompleted && (
          <>
            {!isClaimed && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => onVolunteer(request.id)}
                size="small"
              >
                Volunteer
              </Button>
            )}
            
            {isVolunteer && (
              <Button
                variant="outlined"
                color="success"
                onClick={() => onComplete(request.id)}
                size="small"
                sx={{ ml: 1 }}
              >
                Mark Complete
              </Button>
            )}
            
            {isClaimed && !isVolunteer && (
              <Typography variant="body2" color="text.secondary">
                This request has been claimed
              </Typography>
            )}
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default RequestCard;
