import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert,
    IconButton, Snackbar, CircularProgress, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Session {
    id: number;
    movieId: number;
    movieTitle: string;
    hallId: number;
    hallName: string;
    startTime: string;
    price: number;
    format: string;
}

interface Movie {
    id: number;
    title: string;
}

interface Hall {
    id: number;
    name: string;
}

const AdminSessions: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        movieId: '',
        hallId: '',
        startTime: '',
        price: '',
        format: '2D'
    });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('cinema_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [sessionsRes, moviesRes, hallsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/sessions', { headers }),
                axios.get('http://localhost:8080/api/movies'),
                axios.get('http://localhost:8080/api/halls')
            ]);

            // Сортируем фильмы по ID
            const sortedMovies = [...moviesRes.data].sort((a, b) => a.id - b.id);

            setSessions(sessionsRes.data);
            setMovies(sortedMovies);
            setHalls(hallsRes.data);
            setError('');
        } catch (err: any) {
            console.error('Ошибка загрузки:', err);
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        if (!formData.movieId || !formData.hallId || !formData.startTime || !formData.price) {
            setError('Заполните все поля');
            return;
        }

        try {
            const token = localStorage.getItem('cinema_token');
            const sessionData = {
                movieId: parseInt(formData.movieId),
                hallId: parseInt(formData.hallId),
                startTime: formData.startTime + ':00',
                price: parseFloat(formData.price),
                format: formData.format
            };

            await axios.post('http://localhost:8080/api/sessions', sessionData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage('Сеанс создан успешно!');
            setFormData({ movieId: '', hallId: '', startTime: '', price: '', format: '2D' });
            fetchData();
        } catch (err: any) {
            setError(err.response?.data || 'Ошибка создания сеанса');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить сеанс?')) return;

        try {
            const token = localStorage.getItem('cinema_token');
            await axios.delete(`http://localhost:8080/api/sessions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage('Сеанс удален');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data || 'Ошибка удаления');
        }
    };

    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user || user.role !== 'ADMIN') {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    Нет доступа
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
                Управление сеансами
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            {/* Форма создания сеанса */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Создать новый сеанс</Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <TextField
                        select
                        sx={{ minWidth: 200 }}
                        label="Фильм"
                        value={formData.movieId}
                        onChange={(e) => setFormData({...formData, movieId: e.target.value})}
                    >
                        <MenuItem value=""><em>Выберите фильм</em></MenuItem>
                        {movies.map(movie => (
                            <MenuItem key={movie.id} value={movie.id}>
                                {movie.id}. {movie.title}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        sx={{ minWidth: 200 }}
                        label="Зал"
                        value={formData.hallId}
                        onChange={(e) => setFormData({...formData, hallId: e.target.value})}
                    >
                        <MenuItem value=""><em>Выберите зал</em></MenuItem>
                        {halls.map(hall => (
                            <MenuItem key={hall.id} value={hall.id}>
                                {hall.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Дата и время"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                    />

                    <TextField
                        label="Цена"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        sx={{ minWidth: 120 }}
                    />

                    <TextField
                        select
                        label="Формат"
                        value={formData.format}
                        onChange={(e) => setFormData({...formData, format: e.target.value})}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="2D">2D</MenuItem>
                        <MenuItem value="3D">3D</MenuItem>
                        <MenuItem value="IMAX">IMAX</MenuItem>
                    </TextField>
                </Box>

                <Button
                    variant="contained"
                    onClick={handleCreateSession}
                    startIcon={<AddIcon />}
                >
                    Создать сеанс
                </Button>
            </Paper>

            {/* Список сеансов */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Список сеансов</Typography>

                {sessions.length === 0 ? (
                    <Alert severity="info">Сеансы отсутствуют</Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Фильм</TableCell>
                                    <TableCell>Зал</TableCell>
                                    <TableCell>Время</TableCell>
                                    <TableCell>Цена</TableCell>
                                    <TableCell>Формат</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sessions.map(session => (
                                    <TableRow key={session.id}>
                                        <TableCell>{session.id}</TableCell>
                                        <TableCell>{session.movieTitle}</TableCell>
                                        <TableCell>{session.hallName}</TableCell>
                                        <TableCell>{formatDateTime(session.startTime)}</TableCell>
                                        <TableCell>{session.price} руб.</TableCell>
                                        <TableCell>
                                            <Chip label={session.format} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(session.id)}
                                                startIcon={<DeleteIcon />}
                                            >
                                                Удалить
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default AdminSessions;