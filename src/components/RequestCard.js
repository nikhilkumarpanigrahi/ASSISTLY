import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Rating
} from '@mui/material';
import {
  Message as MessageIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import MessageThread from './MessageThread';
import RatingDialog from './RatingDialog';
import LocationVerification from './LocationVerification';

const RequestCard = ({ request, onVolunteer, onComplete, onVerifyCompletion }) => {
  const { user } = useAuth();
  const [showMessageThread, setShowMessageThread] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showLocationVerification, setShowLocationVerification] = useState(false);
  const isClaimed = request.status === 'claimed';
  const isPendingCompletion = request.status === 'pending_completion';
  const isCompleted = request.status === 'completed';
  const isOwner = request.createdByUid === user?.uid;
  const isVolunteer = request.claimedByUid === user?.uid;
  
  const canMessage = (isOwner && (isClaimed || isPendingCompletion)) || (isVolunteer && (isClaimed || isPendingCompletion));
  const canRate = isCompleted && isOwner && !request.rating; // Only owner can rate volunteer
  const canVerify = isPendingCompletion && isOwner; // Only owner can verify completion
  const otherUserId = isOwner ? request.claimedByUid : request.createdByUid;
  const otherUserEmail = isOwner ? request.claimedBy : request.createdBy;
  
  const getStatusColor = () => {
    switch (request.status) {
      case 'open': return 'info';
      case 'claimed': return 'warning';
      case 'pending_completion': return 'secondary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
      <Card sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, wordBreak: 'break-word' }}>
              {request.title}
            </Typography>
            <Chip 
              label={request.status.toUpperCase()} 
              color={getStatusColor()}
              size="small"
            />
          </Box>
          
          {canMessage && (
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <Tooltip title="Send Message">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => setShowMessageThread(true)}
                >
                  <MessageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </CardContent>
      
      <CardContent>
        {request.category && (
          <Box mb={1.5}>
            <Chip label={request.category} size="small" color="primary" variant="outlined" />
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {request.description}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {(request.location?.address || request.location) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {typeof request.location === 'string' ? request.location : request.location?.address || 'Location set'}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={request.urgency?.toUpperCase() || 'MEDIUM'} 
              size="small"
              color={request.urgency === 'high' ? 'error' : request.urgency === 'medium' ? 'warning' : 'success'}
            />
            {request.estimatedTime && (
              <Chip
                icon={<TimeIcon />}
                label={request.estimatedTime}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {request.postedBy || request.postedByEmail?.split('@')[0] || 'Anonymous'}
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Posted {formatDate(request.timestamp || request.createdAt)}
          </Typography>
          
          {isClaimed && (
            <Typography variant="body2" color="primary">
              <strong>Volunteer:</strong> {request.claimedBy || request.claimedByEmail?.split('@')[0] || '—'}
            </Typography>
          )}
          
          {request.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Rating value={request.rating.score} readOnly size="small" />
              {request.rating.review && (
                <Typography variant="caption" color="text.secondary">
                  "{request.rating.review}"
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        {request.contactInfo && (isOwner || isVolunteer) && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Contact Info:
            </Typography>
            <Typography variant="body2">
              {request.contactInfo}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ padding: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        {!isOwner && !isCompleted && (
          <>
            {!isClaimed && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => onVolunteer(request.id)}
                size="small"
                fullWidth
              >
                Volunteer to Help
              </Button>
            )}
            
            {isVolunteer && (
              <Button
                variant="contained"
                color="success"
                onClick={() => setShowLocationVerification(true)}
                size="small"
                fullWidth
              >
                Mark as Complete
              </Button>
            )}
            
            {isClaimed && !isVolunteer && (
              <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>
                Already claimed by a volunteer
              </Typography>
            )}
          </>
        )}
        
        {isPendingCompletion && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="secondary.main" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              ⏳ Pending Verification
            </Typography>
            {canVerify && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => onVerifyCompletion(request.id, true)}
                  fullWidth
                >
                  ✓ Verify
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => onVerifyCompletion(request.id, false)}
                  fullWidth
                >
                  ✗ Reject
                </Button>
              </Box>
            )}
            {isVolunteer && (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                Waiting for resident to verify completion
              </Typography>
            )}
          </Box>
        )}
        
        {isCompleted && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="success.main" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              ✓ Completed
            </Typography>
            {canRate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<StarIcon />}
                onClick={() => setShowRatingDialog(true)}
                fullWidth
              >
                Rate Volunteer
              </Button>
            )}
          </Box>
        )}
      </CardActions>
    </Card>
    
    {showMessageThread && canMessage && (
      <MessageThread
        open={showMessageThread}
        onClose={() => setShowMessageThread(false)}
        requestId={request.id}
        requestTitle={request.title}
        otherUserId={otherUserId}
        otherUserEmail={otherUserEmail}
      />
    )}
    
    {showRatingDialog && canRate && (
      <RatingDialog
        open={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        requestId={request.id}
        requestTitle={request.title}
        ratedUserId={otherUserId}
        ratedUserEmail={otherUserEmail}
        isVolunteer={isOwner}
        onRatingSubmitted={() => {
          setShowRatingDialog(false);
        }}
      />
    )}

    {/* Location Verification Dialog */}
    <LocationVerification
      open={showLocationVerification}
      onClose={() => setShowLocationVerification(false)}
      requestLocation={request.location}
      onVerified={(verificationData) => {
        // Call onComplete with verification data
        onComplete(request.id, verificationData);
        setShowLocationVerification(false);
      }}
      maxDistance={100} // 100 meters
    />
    </>
  );
};

export default RequestCard;
