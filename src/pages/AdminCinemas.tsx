import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, IconButton, Snackbar, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Cinema {
    id: number;
    name: string;
    city: string;
    address: string;
}

const AdminCinemas: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cinemaToDelete, setCinemaToDelete] = useState<Cinema | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchCinemas();
    }, [user, navigate]);

    const fetchCinemas = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('cinema_token');
            const response = await axios.get('http://localhost:8080/api/cinemas', {
                headers: { Authorization: token ? `Bearer ${token}` : undefined }
            });
            setCinemas(response.data);
            setError('');
        } catch (err: any) {
            setError('Не удалось загрузить кинотеатры');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (cinema: Cinema | null = null) => {
        if (cinema) {
            setEditingCinema(cinema);
            setFormData({
                name: cinema.name,
                city: cinema.city,
                address: cinema.address
            });
        } else {
            setEditingCinema(null);
            setFormData({
                name: '',
                city: '',
                address: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCinema(null);
        setFormData({
            name: '',
            city: '',
            address: ''
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.name.trim()) return 'Введите название кинотеатра';
        if (!formData.city.trim()) return 'Введите город';
        if (!formData.address.trim()) return 'Введите адрес';
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
            const cinemaData = {
                name: formData.name,
                city: formData.city,
                address: formData.address
            };

            if (editingCinema) {
                await axios.put(
                    `http://localhost:8080/api/cinemas/${editingCinema.id}`,
                    cinemaData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage('Кинотеатр успешно обновлен');
            } else {
                await axios.post(
                    'http://localhost:8080/api/cinemas',
                    cinemaData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage('Кинотеатр успешно создан');
            }

            await fetchCinemas();
            handleCloseDialog();
            setError('');
        } catch (err: any) {
            setError(err.response?.data || 'Ошибка сохранения кинотеатра');
            console.error(err);
        }
    };

    const handleDeleteClick = (cinema: Cinema) => {
        setCinemaToDelete(cinema);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!cinemaToDelete) return;

        try {
            const token = localStorage.getItem('cinema_token');
            await axios.delete(`http://localhost:8080/api/cinemas/${cinemaToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage('Кинотеатр успешно удален');
            await fetchCinemas();
            setDeleteDialogOpen(false);
            setCinemaToDelete(null);
        } catch (err: any) {
            setError(err.response?.data || 'Ошибка удаления кинотеатра');
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage('');
    };

    if (!user || user.role !== 'ADMIN') {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    У вас нет доступа к управлению кинотеатрами
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
            <Box sx={{ mb: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Управление кинотеатрами
                </Typography>
                <Typography color="textSecondary">
                    Создание и редактирование кинотеатров
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Список кинотеатров</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Добавить кинотеатр
                    </Button>
                </Box>

                {cinemas.length === 0 ? (
                    <Alert severity="info">Кинотеатры отсутствуют</Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>Город</TableCell>
                                    <TableCell>Адрес</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cinemas.map((cinema) => (
                                    <TableRow key={cinema.id}>
                                        <TableCell>{cinema.id}</TableCell>
                                        <TableCell>{cinema.name}</TableCell>
                                        <TableCell>{cinema.city}</TableCell>
                                        <TableCell>{cinema.address}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    variant="outlined"
                                                    onClick={() => handleOpenDialog(cinema)}
                                                >
                                                    Редактировать
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(cinema)}
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

            {/* Диалог добавления/редактирования */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCinema ? 'Редактирование кинотеатра' : 'Добавить новый кинотеатр'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Название кинотеатра"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={handleFormChange}
                        sx={{ mt: 2 }}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="city"
                        label="Город"
                        fullWidth
                        variant="outlined"
                        value={formData.city}
                        onChange={handleFormChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="address"
                        label="Адрес"
                        fullWidth
                        variant="outlined"
                        value={formData.address}
                        onChange={handleFormChange}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingCinema ? 'Сохранить' : 'Добавить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Удаление кинотеатра</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить кинотеатр "{cinemaToDelete?.name}"?
                        Все связанные залы также будут удалены. Это действие нельзя отменить.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
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
        </Container>
    );
};

export default AdminCinemas;