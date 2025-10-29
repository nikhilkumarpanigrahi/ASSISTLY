import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const RatingDialog = ({ open, onClose, requestId, requestTitle, ratedUserId, ratedUserEmail, isVolunteer, onRatingSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update the request with the rating
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        rating: {
          score: rating,
          review: review.trim(),
          ratedUserId,
          ratedUserEmail,
          ratedAt: serverTimestamp()
        }
      });

      // You could also update user profile with ratings here
      // This would require a separate users collection

      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      
      onClose();
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Rate {isVolunteer ? 'Volunteer' : 'Request Creator'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Request: <strong>{requestTitle}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Rating for: <strong>{ratedUserEmail?.split('@')[0]}</strong>
          </Typography>
          
          <Box sx={{ mt: 3, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="legend" gutterBottom>
              How was your experience?
            </Typography>
            <Rating
              name="user-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
                setError('');
              }}
              size="large"
              icon={<StarIcon fontSize="inherit" />}
            />
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review (Optional)"
            placeholder="Share your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            disabled={loading}
            sx={{ mt: 2 }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || rating === 0}
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;
