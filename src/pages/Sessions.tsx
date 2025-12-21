import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SortIcon from '@mui/icons-material/Sort';

interface Session {
  id: number;
  movieId: number;
  movieTitle: string;
  hallId: number;
  hallName: string;
  cinemaId?: number;
  cinemaName?: string;
  startTime: string;
  price: number;
  format: string;
  availableSeats?: number;
}

interface Movie {
  id: number;
  title: string;
}

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const moviesResponse = await axios.get('http://localhost:8080/api/movies');
      setMovies(moviesResponse.data);

      const sessionsResponse = await axios.get('http://localhost:8080/api/sessions');

      let sessionsArray: Session[] = [];
      if (Array.isArray(sessionsResponse.data)) {
        sessionsArray = sessionsResponse.data;
      } else if (sessionsResponse.data.sessions) {
        sessionsArray = sessionsResponse.data.sessions;
      }

      setAllSessions(sessionsArray);
      setSessions(sessionsArray);
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = [...allSessions];

    if (selectedMovie) {
      filtered = filtered.filter(session =>
        session.movieId.toString() === selectedMovie
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        return sessionDate === selectedDate;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.movieTitle.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.movieId - b.movieId;
      } else {
        return b.movieId - a.movieId;
      }
    });

    setSessions(filtered);
  }, [allSessions, selectedMovie, selectedDate, searchQuery, sortOrder]);

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Дата не указана';
    }
  };

  const getMovieTitle = (movieId: number) => {
    const movie = movies.find(m => m.id === movieId);
    return movie?.title || 'Фильм';
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      <Typography variant="h3" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
        Расписание сеансов
      </Typography>

      <Typography variant="body1" sx={{ color: '#B0B3B8', mb: 4 }}>
        Выберите удобное время и место для просмотра фильма
      </Typography>

      {/* Фильтры и поиск */}
      <Box
        sx={{
          p: 3,
          mb: 4,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
          Фильтры и поиск
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Поиск по названию фильма */}
          <TextField
            label="Поиск по названию фильма"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputLabelProps={{ style: { color: '#B0B3B8' } }}
            InputProps={{
              sx: {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: '#FF3A44',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF3A44',
                },
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Фильм"
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 200,
                '& .MuiInputLabel-root': {
                  color: '#B0B3B8',
                },
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF3A44',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF3A44',
                  },
                },
                '& .MuiSelect-icon': {
                  color: '#B0B3B8',
                },
              }}
            >
              <MenuItem value="">Все фильмы</MenuItem>
              {movies.map((movie) => (
                <MenuItem key={movie.id} value={movie.id.toString()}>
                  {movie.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Дата"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { color: '#B0B3B8' }
              }}
              sx={{
                flex: 1,
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF3A44',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF3A44',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedMovie('');
                setSelectedDate('');
                setSearchQuery('');
              }}
              sx={{
                borderColor: '#FF3A44',
                color: '#FF3A44',
                '&:hover': {
                  borderColor: '#FF6B73',
                  backgroundColor: 'rgba(255, 58, 68, 0.1)',
                },
              }}
            >
              Сбросить все
            </Button>

            <IconButton
              onClick={toggleSortOrder}
              sx={{
                color: '#FF3A44',
                border: '1px solid #FF3A44',
                ml: 2,
              }}
            >
              <SortIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
              Сортировка по ID фильма: {sortOrder === 'asc' ? '↑ По возрастанию' : '↓ По убыванию'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#FF6B73',
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#FF3A44' }} />
        </Box>
      ) : sessions.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            color: '#64B5F6',
          }}
        >
          {selectedMovie || selectedDate || searchQuery
            ? 'Сеансы по вашему запросу не найдены'
            : 'Сеансы отсутствуют'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ color: '#B0B3B8' }}>
              Найдено сеансов: {sessions.length}
            </Typography>
            <Chip
              label={`ID фильма: ${sortOrder === 'asc' ? '↑' : '↓'}`}
              sx={{
                background: 'rgba(255, 58, 68, 0.2)',
                color: '#FF6B73',
                fontWeight: 600,
              }}
            />
          </Box>

          {sessions.map((session) => (
            <Card
              key={session.id}
              sx={{
                background: 'linear-gradient(145deg, #1A1A2E 0%, #252540 100%)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'rgba(255, 58, 68, 0.3)',
                  boxShadow: '0 8px 32px rgba(255, 58, 68, 0.2)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                      {session.movieTitle || getMovieTitle(session.movieId)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={`ID: ${session.movieId}`}
                        size="small"
                        sx={{
                          background: 'rgba(78, 205, 196, 0.2)',
                          color: '#4ECDC4',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={session.format}
                        size="small"
                        sx={{
                          background: 'rgba(255, 58, 68, 0.2)',
                          color: '#FF6B73',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ color: '#FF3A44', fontWeight: 700 }}>
                    {session.price.toFixed(2)} ₽
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1, color: '#4ECDC4', fontSize: 20 }} />
                    <Typography sx={{ color: '#B0B3B8' }}>
                      {formatDateTime(session.startTime)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 1, color: '#4ECDC4', fontSize: 20 }} />
                    <Typography sx={{ color: '#B0B3B8' }}>
                      {session.cinemaName || 'Кинотеатр'} • {session.hallName || 'Зал'}
                    </Typography>
                  </Box>

                  {session.availableSeats !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ConfirmationNumberIcon sx={{ mr: 1, color: '#4ECDC4', fontSize: 20 }} />
                      <Typography sx={{ color: '#B0B3B8' }}>
                        Свободно мест: {session.availableSeats}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/booking/${session.id}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #FF3A44 0%, #FF6B73 100%)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FF6B73 0%, #FF3A44 100%)',
                    },
                  }}
                >
                  Выбрать места
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default SessionsPage;