import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Profile
      </Typography>
      <Box>
        <Typography variant="body1">
          User profile page - Coming soon!
        </Typography>
      </Box>
    </Container>
  );
};

export default Profile;
