import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Register: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Регистрация</Typography>
        <Typography>Страница регистрации будет здесь</Typography>
      </Paper>
    </Container>
  );
};

export default Register;