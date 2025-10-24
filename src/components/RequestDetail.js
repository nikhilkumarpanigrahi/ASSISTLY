import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Rating,
  TextField,
  Divider
} from '@mui/material';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';

// Simple Request detail view + rating submission
const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showNotification } = useApp();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchRequest = async () => {
      try {
        const ref = doc(db, 'requests', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          showNotification('Request not found', 'error');
          navigate('/');
          return;
        }
        if (mounted) setRequest({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error('Error loading request', err);
        showNotification('Error loading request', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRequest();
    return () => { mounted = false; };
  }, [id, navigate, showNotification]);

  const submitRating = async () => {
    if (!user) {
      showNotification('Please sign in to leave ratings', 'info');
      return;
    }
    setSubmitting(true);
    try {
      const ratingsRef = collection(db, 'requests', id, 'ratings');
      await addDoc(ratingsRef, {
        uid: user.uid,
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      showNotification('Thanks for your feedback!');
      setComment('');
    } catch (err) {
      console.error('Rating submit error', err);
      showNotification('Failed to submit rating', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Loading…</Typography>;
  if (!request) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, maxWidth: 900, margin: '0 auto' }} elevation={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar>{request.postedBy ? request.postedBy.charAt(0) : 'U'}</Avatar>
          <Box>
            <Typography variant="h5">{request.title}</Typography>
            <Typography variant="body2" color="text.secondary">Posted by {request.postedBy || 'Anonymous'}</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Chip label={request.status?.toUpperCase()} color={request.status === 'open' ? 'info' : request.status === 'claimed' ? 'warning' : 'success'} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1" paragraph>{request.description}</Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Contact</Typography>
          <Typography variant="body2">{request.contactInfo || '—'}</Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Leave a rating</Typography>
          <Rating value={rating} onChange={(e, v) => setRating(v)} />
          <TextField
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            multiline
            rows={3}
            fullWidth
            sx={{ mt: 1 }}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={submitRating} disabled={submitting}>
              Submit
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RequestDetail;
