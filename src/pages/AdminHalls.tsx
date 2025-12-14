import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, IconButton, Snackbar, CircularProgress,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Hall {
    id: number;
    name: string;
    rows: number;
    seatsPerRow: number;
    cinemaId: number;
    cinemaName: string;
}

interface Cinema {
    id: number;
    name: string;
}

const AdminHalls: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [halls, setHalls] = useState<Hall[]>([]);
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHall, setEditingHall] = useState<Hall | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hallToDelete, setHallToDelete] = useState<Hall | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        rows: '',
        seatsPerRow: '',
        cinemaId: ''
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
            const headers = { Authorization: token ? `Bearer ${token}` : undefined };

            const [hallsRes, cinemasRes] = await Promise.all([
                axios.get('http://localhost:8080/api/halls', { headers }),
                axios.get('http://localhost:8080/api/cinemas', { headers })
            ]);

            setHalls(hallsRes.data);
            setCinemas(cinemasRes.data);
            setError('');
        } catch (err: any) {
            setError('Не удалось загрузить данные');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (hall: Hall | null = null) => {
        if (hall) {
            setEditingHall(hall);
            setFormData({
                name: hall.name,
                rows: hall.rows.toString(),
                seatsPerRow: hall.seatsPerRow.toString(),
                cinemaId: hall.cinemaId.toString()
            });
        } else {
            setEditingHall(null);
            setFormData({
                name: '',
                rows: '',
                seatsPerRow: '',
                cinemaId: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingHall(null);
        setFormData({
            name: '',
            rows: '',
            seatsPerRow: '',
            cinemaId: ''
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.name.trim()) return 'Введите название зала';
        if (!formData.rows || parseInt(formData.rows) <= 0) return 'Введите корректное количество рядов';
        if (!formData.seatsPerRow || parseInt(formData.seatsPerRow) <= 0) return 'Введите корректное количество мест в ряду';
        if (!formData.cinemaId) return 'Выберите кинотеатр';

        const totalSeats = parseInt(formData.rows) * parseInt(formData.seatsPerRow);
        if (totalSeats > 300) return 'Слишком большой зал (максимум 300 мест)';
        if (totalSeats < 10) return 'Слишком маленький зал (минимум 10 мест)';

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
            const hallData = {
                name: formData.name,
                rows: parseInt(formData.rows),
                seatsPerRow: parseInt(formData.seatsPerRow),
                cinema: { id: parseInt(formData.cinemaId) }
            };

            if (editingHall) {
                await axios.put(
                    `http://localhost:8080/api/halls/${editingHall.id}`,
                    hallData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage('Зал успешно обновлен');
            } else {
                await axios.post(
                    'http://localhost:8080/api/halls',
                    hallData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage('Зал успешно создан');
            }

            await fetchData();
            handleCloseDialog();
            setError('');
        } catch (err: any) {
            setError(err.response?.data || 'Ошибка сохранения зала');
            console.error(err);
        }
    };

    const handleDeleteClick = (hall: Hall) => {
        setHallToDelete(hall);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!hallToDelete) return;

        try {
            const token = localStorage.getItem('cinema_token');
            await axios.delete(`http://localhost:8080/api/halls/${hallToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage('Зал успешно удален');
            await fetchData();
            setDeleteDialogOpen(false);
            setHallToDelete(null);
        } catch (err: any) {
            setError(err.response?.data || 'Ошибка удаления зала');
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage('');
    };

    const getTotalSeats = (rows: number, seatsPerRow: number) => rows * seatsPerRow;

    if (!user || user.role !== 'ADMIN') {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    У вас нет доступа к управлению залами
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
                    Управление залами
                </Typography>
                <Typography color="textSecondary">
                    Создание и редактирование кинозалов
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Список залов</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Добавить зал
                    </Button>
                </Box>

                {halls.length === 0 ? (
                    <Alert severity="info">Залы отсутствуют</Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell>Кинотеатр</TableCell>
                                    <TableCell>Ряды</TableCell>
                                    <TableCell>Мест в ряду</TableCell>
                                    <TableCell>Всего мест</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {halls.map((hall) => (
                                    <TableRow key={hall.id}>
                                        <TableCell>{hall.id}</TableCell>
                                        <TableCell>{hall.name}</TableCell>
                                        <TableCell>{hall.cinemaName}</TableCell>
                                        <TableCell>{hall.rows}</TableCell>
                                        <TableCell>{hall.seatsPerRow}</TableCell>
                                        <TableCell>{getTotalSeats(hall.rows, hall.seatsPerRow)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    variant="outlined"
                                                    onClick={() => handleOpenDialog(hall)}
                                                >
                                                    Редактировать
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(hall)}
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
                    {editingHall ? 'Редактирование зала' : 'Добавить новый зал'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Название зала"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={handleFormChange}
                        sx={{ mt: 2 }}
                        required
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Кинотеатр</InputLabel>
                        <Select
                            name="cinemaId"
                            value={formData.cinemaId}
                            onChange={handleSelectChange}
                            label="Кинотеатр"
                        >
                            <MenuItem value=""><em>Выберите кинотеатр</em></MenuItem>
                            {cinemas.map((cinema) => (
                                <MenuItem key={cinema.id} value={cinema.id}>
                                    {cinema.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        name="rows"
                        label="Количество рядов"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.rows}
                        onChange={handleFormChange}
                        InputProps={{ inputProps: { min: 1, max: 30 } }}
                        required
                    />

                    <TextField
                        margin="dense"
                        name="seatsPerRow"
                        label="Мест в ряду"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.seatsPerRow}
                        onChange={handleFormChange}
                        InputProps={{ inputProps: { min: 1, max: 30 } }}
                        required
                    />

                    {formData.rows && formData.seatsPerRow && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Всего мест: {parseInt(formData.rows) * parseInt(formData.seatsPerRow)}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingHall ? 'Сохранить' : 'Добавить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Удаление зала</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить зал "{hallToDelete?.name}"?
                        Все связанные сеансы также будут удалены. Это действие нельзя отменить.
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

export default AdminHalls;