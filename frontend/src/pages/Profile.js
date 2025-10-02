import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, loading: authLoading, error: authError, updateUser: updateAuthUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    // Add other fields you want to display/edit
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError(null); // Clear local error on change
    setSuccessMessage(null); // Clear success message on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      // Use authAPI.updateProfile for the currently logged-in user
      const response = await authAPI.updateProfile(formData);
      updateAuthUser(response.data.user); // Update context with new user data
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error("Failed to update profile:", err);
      setLocalError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (authError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{authError}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'Georgia, serif' }}>
        My Profile
      </Typography>

      {(localError || successMessage) && (
        <Alert severity={localError ? "error" : "success"} sx={{ mb: 2 }}>
          {localError || successMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Full Name"
          name="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="normal"
          fullWidth
          id="address"
          label="Shipping Address"
          name="address"
          autoComplete="shipping-address-line1"
          value={formData.address}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{
            mt: 2,
            backgroundColor: '#e91e63',
            '&:hover': { backgroundColor: '#ad1457' },
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Update Profile'}
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
