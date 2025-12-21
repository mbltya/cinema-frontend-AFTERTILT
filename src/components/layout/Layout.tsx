import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  LocalMovies as MovieIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navItems = [
    { label: 'Главная', path: '/', show: true },
    { label: 'Фильмы', path: '/movies', show: true },
    { label: 'Сеансы', path: '/sessions', show: true },
    { label: 'Профиль', path: '/profile', show: !!user },
    { label: 'Админ', path: '/admin', show: user?.role === 'ADMIN' },
  ];

  const drawer = (
    <Box sx={{ width: 280, height: '100%', background: '#0F1014' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MovieIcon sx={{ color: '#FF3A44', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            CINEMA
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        {navItems
          .filter(item => item.show)
          .map((item) => (
            <ListItem
              key={item.label}
              component={RouterLink}
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                color: location.pathname === item.path ? '#FF3A44' : '#B0B3B8',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
      </List>

      {user && (
        <Box sx={{ p: 2 }}>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
          <ListItem
            onClick={handleLogout}
            sx={{
              color: '#FF6B73',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 58, 68, 0.1)',
              },
            }}
          >
            <LogoutIcon sx={{ mr: 2 }} />
            <ListItemText primary="Выйти" />
          </ListItem>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0F1014' }}>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
              >
                <MenuIcon />
              </IconButton>

              <Box
                component={RouterLink}
                to="/"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
              >
                <MovieIcon sx={{ color: '#FF3A44', fontSize: 32 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #FF3A44 0%, #FF6B73 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  CINEMA
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {navItems
                .filter(item => item.show && item.path !== '/')
                .map((item) => (
                  <Button
                    key={item.label}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: location.pathname === item.path ? '#FF3A44' : '#B0B3B8',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#fff',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user ? (
                <>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #FF3A44, #4ECDC4)',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                    onClick={() => navigate('/profile')}
                  >
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>

                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    sx={{
                      borderColor: '#FF3A44',
                      color: '#FF3A44',
                      '&:hover': {
                        borderColor: '#FF6B73',
                        backgroundColor: 'rgba(255, 58, 68, 0.1)',
                      },
                    }}
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: '#FF3A44',
                      color: '#FF3A44',
                    }}
                  >
                    Вход
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                  >
                    Регистрация
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      <Box component="footer" sx={{ py: 3, background: '#0a0b0e', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MovieIcon sx={{ color: '#FF3A44' }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                CINEMA
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
              © 2025 Кинотеатр. Все права защищены.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;