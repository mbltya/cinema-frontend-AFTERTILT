import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  description?: string;
  posterUrl?: string;
  ageRating?: number;
  trailerUrl?: string;
}

interface Session {
  id: number;
  movieTitle: string;
  cinemaName: string;
  hallName: string;
  startTime: string;
  price: number;
  format: string;
}

interface Cinema {
  id: number;
  name: string;
  city: string;
  address: string;
}

interface Ticket {
  id: number;
  movieTitle: string;
  sessionTime: string;
  price: number;
  status: string;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    duration: '',
    description: '',
    posterUrl: '',
    ageRating: '',
    trailerUrl: '',
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      const token = localStorage.getItem('cinema_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [moviesRes, sessionsRes, cinemasRes, ticketsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/movies', { headers }),
        axios.get('http://localhost:8080/api/sessions', { headers }),
        axios.get('http://localhost:8080/api/cinemas', { headers }),
        axios.get('http://localhost:8080/api/tickets', { headers })
      ]);

      setMovies(moviesRes.data);
      setSessions(sessionsRes.data);
      setCinemas(cinemasRes.data);
      setTickets(ticketsRes.data);
      setError('');
    } catch (err: any) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem('cinema_token');
      const response = await axios.get('http://localhost:8080/api/movies', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setMovies(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки фильмов:', err);
    }
  };

  const sortedMovies = useMemo(() => {
      return [...movies].sort((a, b) => a.id - b.id);
    }, [movies]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('cinema_token');
      const response = await axios.get('http://localhost:8080/api/sessions', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setSessions(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки сеансов:', err);
    }
  };

  const fetchCinemas = async () => {
    try {
      const token = localStorage.getItem('cinema_token');
      const response = await axios.get('http://localhost:8080/api/cinemas', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setCinemas(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки кинотеатров:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('cinema_token');
      const response = await axios.get('http://localhost:8080/api/tickets', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setTickets(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки билетов:', err);
    }
  };

  const countActiveSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionTime = new Date(session.startTime);
      return sessionTime > now;
    }).length;
  };

  const countSoldTickets = () => {
    return tickets.filter(ticket =>
      ticket.status !== 'CANCELLED' && ticket.status !== 'CANCELED'
    ).length;
  };

  const handleOpenDialog = (movie: Movie | null = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title,
        genre: movie.genre,
        duration: movie.duration.toString(),
        description: movie.description || '',
        posterUrl: movie.posterUrl || '',
        ageRating: movie.ageRating?.toString() || '',
        trailerUrl: movie.trailerUrl || '',
      });
    } else {
      setEditingMovie(null);
      setFormData({
        title: '',
        genre: '',
        duration: '',
        description: '',
        posterUrl: '',
        ageRating: '',
        trailerUrl: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMovie(null);
    setFormData({
      title: '',
      genre: '',
      duration: '',
      description: '',
      posterUrl: '',
      ageRating: '',
      trailerUrl: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Введите название фильма';
    if (!formData.genre.trim()) return 'Введите жанр';
    if (!formData.duration || parseInt(formData.duration) <= 0)
      return 'Введите корректную длительность';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('cinema_token');
      const movieData = {
        title: formData.title,
        genre: formData.genre,
        duration: parseInt(formData.duration),
        description: formData.description || undefined,
        posterUrl: formData.posterUrl || undefined,
        ageRating: formData.ageRating ? parseInt(formData.ageRating) : undefined,
        trailerUrl: formData.trailerUrl || undefined,
      };

      if (editingMovie) {
        await axios.put(
          `http://localhost:8080/api/movies/${editingMovie.id}`,
          movieData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccessMessage('Фильм успешно обновлен');
      } else {
        await axios.post('http://localhost:8080/api/movies', movieData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage('Фильм успешно добавлен');
      }

      await fetchData();
      handleCloseDialog();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения фильма');
      console.error(err);
    }
  };

  const handleDeleteClick = (movie: Movie) => {
    setMovieToDelete(movie);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!movieToDelete) return;

    try {
      const token = localStorage.getItem('cinema_token');
      await axios.delete(`http://localhost:8080/api/movies/${movieToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchData();
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
      setSuccessMessage('Фильм успешно удален');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления фильма');
      console.error(err);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  const handleRefreshStats = () => {
    fetchData();
    setSnackbar({
      open: true,
      message: 'Статистика обновлена',
      type: 'success'
    });
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  if (user?.role !== 'ADMIN') {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          У вас нет доступа к админ-панели
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель администратора
        </Typography>
        <Typography color="textSecondary">
          Управление контентом кинотеатра
        </Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
      }}>
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Paper key={index} sx={{
              p: 3,
              textAlign: 'center',
              flex: 1,
              minWidth: { xs: '100%', md: 'auto' }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <CircularProgress size={40} />
              </Box>
              <Typography color="textSecondary">
                Загрузка...
              </Typography>
            </Paper>
          ))
        ) : (
          [
            {
              value: movies.length.toString(),
              label: 'Фильмов в прокате',
              icon: '🎬',
              color: 'primary.main'
            },
            {
              value: countSoldTickets().toString(),
              label: 'Билетов продано',
              icon: '🎫',
              color: 'success.main'
            },
            {
              value: countActiveSessions().toString(),
              label: 'Активных сеансов',
              icon: '⏰',
              color: 'warning.main'
            },
            {
              value: cinemas.length.toString(),
              label: 'Кинотеатров',
              icon: '🏢',
              color: 'info.main'
            },
          ].map((stat, index) => (
            <Paper key={index} sx={{
              p: 3,
              textAlign: 'center',
              flex: 1,
              minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'auto' },
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: 'rgba(255, 58, 68, 0.3)',
                boxShadow: '0 8px 32px rgba(255, 58, 68, 0.2)',
              },
            }}>
              <Typography
                variant="h4"
                sx={{
                  color: stat.color,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <span>{stat.icon}</span>
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ fontWeight: 500 }}
              >
                {stat.label}
              </Typography>
            </Paper>
          ))
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Управление контентом
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefreshStats}
            disabled={statsLoading}
            startIcon={<RefreshIcon />}
            sx={{
              color: '#FF3A44',
              borderColor: '#FF3A44',
              '&:hover': {
                borderColor: '#FF6B73',
                background: 'rgba(255, 58, 68, 0.1)',
              },
            }}
          >
            Обновить статистику
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить фильм
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/sessions"
          >
            Управление сеансами
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/users"
          >
            Управление пользователями
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/cinemas"
          >
            Управление кинотеатрами
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/halls"
          >
            Управление залами
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Список фильмов ({movies.length})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : movies.length === 0 ? (
          <Alert severity="info">
            Фильмы отсутствуют. Добавьте первый фильм.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Жанр</TableCell>
                  <TableCell>Длительность</TableCell>
                  <TableCell>Рейтинг</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMovies.map((movie) => (
                  <TableRow key={movie.id} hover>
                    <TableCell>{movie.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {movie.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {movie.description?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={movie.genre}
                        size="small"
                        sx={{
                          background: 'rgba(255, 58, 68, 0.1)',
                          color: '#FF6B73',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>{movie.duration} мин.</TableCell>
                    <TableCell>
                      {movie.ageRating ? (
                        <Chip
                          label={`${movie.ageRating}+`}
                          size="small"
                          sx={{
                            background: 'rgba(78, 205, 196, 0.1)',
                            color: '#4ECDC4',
                            fontWeight: 600
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Нет
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="outlined"
                          onClick={() => handleOpenDialog(movie)}
                          sx={{
                            color: '#4ECDC4',
                            borderColor: '#4ECDC4',
                            '&:hover': {
                              borderColor: '#7BD9D2',
                              background: 'rgba(78, 205, 196, 0.1)',
                            },
                          }}
                        >
                          Редактировать
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteClick(movie)}
                          sx={{
                            borderColor: '#FF3A44',
                            '&:hover': {
                              borderColor: '#FF6B73',
                              background: 'rgba(255, 58, 68, 0.1)',
                            },
                          }}
                        >
                          Удалить
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMovie ? 'Редактирование фильма' : 'Добавить новый фильм'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Название фильма"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleFormChange}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="genre"
            label="Жанр"
            fullWidth
            variant="outlined"
            value={formData.genre}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            name="duration"
            label="Длительность (мин)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.duration}
            onChange={handleFormChange}
            InputProps={{ inputProps: { min: 1 } }}
            required
          />
          <TextField
            margin="dense"
            name="ageRating"
            label="Возрастной рейтинг"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.ageRating}
            onChange={handleFormChange}
            InputProps={{ inputProps: { min: 0, max: 21 } }}
            helperText="0+ по умолчанию"
          />
          <TextField
            margin="dense"
            name="posterUrl"
            label="URL постера"
            fullWidth
            variant="outlined"
            value={formData.posterUrl}
            onChange={handleFormChange}
            helperText="Ссылка на изображение"
          />
          <TextField
            margin="dense"
            name="trailerUrl"
            label="URL трейлера"
            fullWidth
            variant="outlined"
            value={formData.trailerUrl}
            onChange={handleFormChange}
            helperText="Ссылка на YouTube"
          />
          <TextField
            margin="dense"
            name="description"
            label="Описание"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            {editingMovie ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление фильма</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить фильм "{movieToDelete?.title}"?
            Это действие нельзя отменить.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Все связанные сеансы также будут удалены!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        message={snackbar.message}
      />
    </Container>
  );
};

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

export default Admin;