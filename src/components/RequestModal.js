import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem
} from '@mui/material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { COLLECTIONS, MESSAGES } from '../utils/constants';

const REQUEST_TYPES = [
  'general',
  'groceries',
  'medical',
  'transportation',
  'housework',
  'other'
];

const RequestModal = ({ onClose }) => {
  const { user, showNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, COLLECTIONS.REQUESTS), {
        ...formData,
        status: 'open',
        createdAt: serverTimestamp(),
        createdBy: user.email,
        createdByUid: user.uid
      });
      
      showNotification(MESSAGES.REQUEST_CREATED);
      onClose();
    } catch (error) {
      showNotification(error.message, 'error');
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
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
            >
              {REQUEST_TYPES.map(type => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
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
