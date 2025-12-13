import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  description?: string;
  posterUrl?: string;
  year?: number;
  director?: string;
}

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  }, [searchTerm, movies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/movies');
      setMovies(response.data);
      setFilteredMovies(response.data);
    } catch (err: any) {
      setError('Не удалось загрузить фильмы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Фильмы
      </Typography>

      <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск фильмов по названию, жанру, описанию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredMovies.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'Фильмы по вашему запросу не найдены' : 'Фильмы отсутствуют'}
        </Alert>
      ) : (
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          {filteredMovies.map((movie) => (
            <Box key={movie.id} sx={{
              width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)' },
              maxWidth: 350
            }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {movie.title} {movie.year && `(${movie.year})`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {movie.genre} • {movie.duration} мин.
                  </Typography>
                  {movie.director && (
                    <Typography variant="body2" color="text.secondary">
                      Режиссер: {movie.director}
                    </Typography>
                  )}
                  {movie.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {movie.description.length > 100
                        ? `${movie.description.substring(0, 100)}...`
                        : movie.description}
                    </Typography>
                  )}
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={RouterLink}
                    to={`/sessions?movie=${movie.id}`}
                    variant="contained"
                    fullWidth
                  >
                    Выбрать сеанс
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Movies;