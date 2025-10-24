import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Grid,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';

const ProfileEditor = ({ open, onClose, userData, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    phoneNumber: userData?.phoneNumber || '',
    location: userData?.location || '',
    bio: userData?.bio || '',
    skills: userData?.skills || [],
    languages: userData?.languages || [],
    website: userData?.website || ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storage = getStorage();
      const photoRef = ref(storage, `profile-photos/${auth.currentUser.uid}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);
      
      await updateProfile(auth.currentUser, { photoURL });
      
      onUpdate({ photoURL });
      setError('');
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(language => language !== languageToRemove)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills,
        languages: formData.languages,
        website: formData.website,
        updatedAt: new Date()
      });

      onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={userData?.photoURL}
            sx={{ width: 80, height: 80, mr: 2 }}
          >
            {userData?.displayName?.[0] || userData?.email?.[0].toUpperCase()}
          </Avatar>
          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoUpload}
            />
            <label htmlFor="photo-upload">
              <IconButton
                color="primary"
                component="span"
                disabled={loading}
              >
                <PhotoCameraIcon />
              </IconButton>
            </label>
            <Typography variant="caption" display="block" color="textSecondary">
              Click to change profile photo
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <LanguageIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Skills
            </Typography>
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  disabled={loading}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Add Skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                disabled={loading}
              />
              <Button
                onClick={handleAddSkill}
                disabled={!newSkill || loading}
                variant="outlined"
              >
                Add
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Languages
            </Typography>
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.languages.map((language) => (
                <Chip
                  key={language}
                  label={language}
                  onDelete={() => handleRemoveLanguage(language)}
                  disabled={loading}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Add Language"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                disabled={loading}
              />
              <Button
                onClick={handleAddLanguage}
                disabled={!newLanguage || loading}
                variant="outlined"
              >
                Add
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditor;