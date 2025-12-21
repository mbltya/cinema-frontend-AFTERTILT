import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MovieIcon from '@mui/icons-material/Movie';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import axios from 'axios';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  posterUrl?: string;
}

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [, setLoading] = useState(true); // Убрали предупреждение
  const [, setError] = useState(''); // Убрали предупреждение

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/movies');
      setMovies(response.data.slice(0, 8));
      setError('');
    } catch (err: any) {
      setError('Не удалось загрузить фильмы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const tabs = [
    { label: 'В кино', icon: <MovieIcon /> },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '70vh',
          background: `
            linear-gradient(rgba(15, 16, 20, 0.9), rgba(15, 16, 20, 0.7)),
            url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          mb: 6,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: '600px' }}>
            <Typography
              variant="h1"
              sx={{
                color: '#fff',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.1,
              }}
            >
              Добро пожаловать в кинотеатр
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#B0B3B8',
                mb: 4,
                fontSize: '1.2rem',
              }}
            >
              Бронируйте билеты онлайн на лучшие фильмы в городе
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/sessions"
                sx={{
                  px: 4,
                  py: 1.5,
                }}
              >
                Купить билеты
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/movies"
                sx={{
                  px: 4,
                  py: 1.5,
                  color: '#fff',
                  borderColor: '#fff',
                }}
              >
                Все фильмы
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Секция с фильмами */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ color: '#fff' }}>
              Сейчас в кино
            </Typography>
            <Button
              component={RouterLink}
              to="/movies"
              variant="outlined"
              sx={{
                color: '#FF3A44',
                borderColor: '#FF3A44',
              }}
            >
              Все фильмы
            </Button>
          </Box>

          {/* Табы */}
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{ color: '#B0B3B8', fontWeight: 600, textTransform: 'none' }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Сетка фильмов */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {movies.slice(0, 4).map((movie) => (
              <Card key={movie.id} sx={{ background: '#1F2128' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.posterUrl || '/api/placeholder/300/400'}
                  alt={movie.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                    {movie.genre} • {movie.duration} мин
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={`/sessions?movie=${movie.id}`}
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Выбрать сеанс
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* CTA секция */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 58, 68, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            mb: 8,
          }}
        >
          <Typography variant="h2" sx={{ color: '#fff', mb: 2 }}>
            Готовы к просмотру?
          </Typography>
          <Typography variant="body1" sx={{ color: '#B0B3B8', mb: 4 }}>
            Выберите фильм, забронируйте лучшие места и наслаждайтесь просмотром
          </Typography>
          <Button
            component={RouterLink}
            to="/sessions"
            variant="contained"
            size="large"
            sx={{ px: 6, py: 1.5 }}
          >
            Выбрать сеанс
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;