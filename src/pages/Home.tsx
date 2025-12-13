import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, CardMedia, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MovieIcon from '@mui/icons-material/Movie';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import axios from 'axios';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  description?: string;
  posterUrl?: string;
}

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/movies');
      setMovies(response.data);
    } catch (err: any) {
      setError('Не удалось загрузить фильмы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box textAlign="center" py={8}>
        <Typography variant="h2" gutterBottom color="primary">
          Добро пожаловать в кинотеатр!
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Бронируйте билеты онлайн на лучшие фильмы
        </Typography>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<MovieIcon />}
            component={RouterLink}
            to="/movies"
            sx={{ px: 4, py: 2 }}
          >
            Смотреть фильмы
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ConfirmationNumberIcon />}
            component={RouterLink}
            to="/sessions"
            sx={{ px: 4, py: 2 }}
          >
            Посмотреть сеансы
          </Button>
        </Box>
      </Box>

      {/* Новый блок: Последние фильмы */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Новинки проката
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : movies.length === 0 ? (
          <Typography color="textSecondary">Фильмов пока нет</Typography>
        ) : (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            {movies.slice(0, 3).map((movie) => (
              <Box key={movie.id} sx={{
                width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
                maxWidth: 400
              }}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                    alt={movie.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {movie.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {movie.genre} • {movie.duration} мин.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/sessions?movie=${movie.id}`}
                      variant="contained"
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Выбрать сеанс
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home;