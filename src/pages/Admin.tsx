import React, { useState, useEffect } from 'react';
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

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
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
      fetchMovies();
    }
  }, [user]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cinema_token');
      const response = await axios.get('http://localhost:8080/api/movies', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setMovies(response.data);
      setError('');
    } catch (err: any) {
      setError('Не удалось загрузить фильмы');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        // Обновление фильма
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
        // Создание фильма
        await axios.post('http://localhost:8080/api/movies', movieData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage('Фильм успешно добавлен');
      }

      await fetchMovies();
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

      await fetchMovies();
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

      {/* Статистика */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
      }}>
        {[
          { value: movies.length.toString(), label: 'Фильмов в прокате' },
          { value: '156', label: 'Билетов продано' },
          { value: '24', label: 'Активных сеансов' },
          { value: '2', label: 'Кинотеатров' },
        ].map((stat, index) => (
          <Paper key={index} sx={{
            p: 3,
            textAlign: 'center',
            flex: 1,
            minWidth: { xs: '100%', md: 'auto' }
          }}>
            <Typography variant="h4" color="primary">
              {stat.value}
            </Typography>
            <Typography color="textSecondary">{stat.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Быстрые действия */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Управление фильмами
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить фильм
          </Button>
          <Button variant="outlined"
            component = {RouterLink}
            to = "/admin/sessions">
            Управление сеансами
          </Button>
          <Button variant="outlined">
            Просмотреть отчеты
          </Button>
          <Button variant="outlined"
            component={RouterLink}
            to="/admin/users">
            Управление пользователями
          </Button>
          <Button variant="outlined"
            component={RouterLink}
            to ="/admin/cinemas">
            Управление кинотеатрами
          </Button>
          <Button variant="outlined"
            component={RouterLink}
            to="/admin/halls">
            Управление залами
          </Button>
        </Box>
      </Paper>

      {/* Список фильмов */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Список фильмов
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
                {movies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell>{movie.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{movie.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {movie.description?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={movie.genre} size="small" />
                    </TableCell>
                    <TableCell>{movie.duration} мин.</TableCell>
                    <TableCell>
                      {movie.ageRating ? `${movie.ageRating}+` : 'Нет'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="outlined"
                          onClick={() => handleOpenDialog(movie)}
                        >
                          Редактировать
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteClick(movie)}
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

      {/* Диалог добавления/редактирования фильма */}
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

      {/* Диалог подтверждения удаления */}
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

      {/* Уведомление об успехе */}
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
    </Container>
  );
};

export default Admin;