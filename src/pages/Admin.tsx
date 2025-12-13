import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  description: string;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchMovies();
    }
  }, [user]);

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
        mb: 4
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
            onClick={() => setOpenDialog(true)}
          >
            Добавить фильм
          </Button>
          <Button variant="outlined">
            Управление сеансами
          </Button>
          <Button variant="outlined">
            Просмотреть отчеты
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
          <Typography>Загрузка...</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Жанр</TableCell>
                  <TableCell>Длительность</TableCell>
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
                        {movie.description.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={movie.genre} size="small" />
                    </TableCell>
                    <TableCell>{movie.duration} мин.</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="outlined"
                        >
                          Редактировать
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          variant="outlined"
                          color="error"
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

      {/* Диалог добавления фильма */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить новый фильм</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название фильма"
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Жанр"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Длительность (мин)"
            type="number"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Описание"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;