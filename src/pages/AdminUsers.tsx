import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, IconButton, Snackbar, CircularProgress,
    MenuItem, Select, FormControl, InputLabel, SelectChangeEvent,
    Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    isBlocked?: boolean;
}

const AdminUsers: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'USER' as 'USER' | 'ADMIN',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('cinema_token');
            const response = await axios.get('http://localhost:8080/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setError('');
        } catch (err: any) {
            setError('Не удалось загрузить пользователей');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleOpenDialog = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                role: user.role,
                password: '',
                confirmPassword: ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                email: '',
                role: 'USER',
                password: '',
                confirmPassword: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            role: 'USER',
            password: '',
            confirmPassword: ''
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value as 'USER' | 'ADMIN'
        });
    };

    const validateForm = () => {
        if (!formData.username.trim()) return 'Введите имя пользователя';
        if (formData.username.length < 3) return 'Имя пользователя должно содержать минимум 3 символа';
        if (!formData.email.trim()) return 'Введите email';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Введите корректный email';

        if (!editingUser) {
            if (!formData.password) return 'Введите пароль';
            if (formData.password.length < 6) return 'Пароль должен содержать минимум 6 символов';
        } else if (formData.password && formData.password.length < 6) {
            return 'Новый пароль должен содержать минимум 6 символов';
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            return 'Пароли не совпадают';
        }
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
            const userData: any = {
                username: formData.username,
                email: formData.email,
                role: formData.role
            };

            // Добавляем пароль только если он указан (или при создании)
            if (formData.password || !editingUser) {
                userData.password = formData.password;
            }

            if (editingUser) {
                await axios.put(
                    `http://localhost:8080/api/users/${editingUser.id}`,
                    userData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage('Пользователь успешно обновлен');
            } else {
                await axios.post(
                    'http://localhost:8080/api/users',
                    userData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage('Пользователь успешно создан');
            }

            await fetchUsers();
            handleCloseDialog();
            setError('');
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Ошибка сохранения пользователя';
            setError(errorMsg);
            console.error(err);
        }
    };

    const handleDeleteClick = (user: User) => {
        if (user.id === user?.id) {
            setError('Вы не можете удалить свой собственный аккаунт');
            return;
        }
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            const token = localStorage.getItem('cinema_token');
            await axios.delete(`http://localhost:8080/api/users/${userToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage('Пользователь успешно удален');
            await fetchUsers();
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        } catch (err: any) {
            setError(err.response?.data || 'Ошибка удаления пользователя');
            console.error(err);
        }
    };

    const handleBlockUser = async (id: number) => {
        if (id === user?.id) {
            setError('Вы не можете заблокировать свой собственный аккаунт');
            return;
        }

        if (!window.confirm('Заблокировать пользователя? Он не сможет войти в систему.')) return;

        try {
            const token = localStorage.getItem('cinema_token');
            await axios.put(
                `http://localhost:8080/api/users/${id}/block`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage('Пользователь заблокирован');
            await fetchUsers();
        } catch (err: any) {
            // Если эндпоинт не реализован, используем локальную блокировку
            if (err.response?.status === 404) {
                handleLocalBlock(id, true);
            } else {
                setError(err.response?.data || 'Ошибка блокировки пользователя');
                console.error(err);
            }
        }
    };

    const handleUnblockUser = async (id: number) => {
        if (!window.confirm('Разблокировать пользователя?')) return;

        try {
            const token = localStorage.getItem('cinema_token');
            await axios.put(
                `http://localhost:8080/api/users/${id}/unblock`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage('Пользователь разблокирован');
            await fetchUsers();
        } catch (err: any) {
            // Если эндпоинт не реализован, используем локальную блокировку
            if (err.response?.status === 404) {
                handleLocalBlock(id, false);
            } else {
                setError(err.response?.data || 'Ошибка разблокировки пользователя');
                console.error(err);
            }
        }
    };

    // Локальная блокировка (если бэкенд не поддерживает)
    const handleLocalBlock = (id: number, block: boolean) => {
        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.id === id ? { ...u, isBlocked: block } : u
            )
        );
        setSuccessMessage(`Пользователь ${block ? 'заблокирован' : 'разблокирован'} (локально)`);
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage('');
    };

    if (!user || user.role !== 'ADMIN') {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    У вас нет доступа к управлению пользователями
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

    const activeUsers = users.filter(u => !u.isBlocked);
    const blockedUsers = users.filter(u => u.isBlocked);
    const currentUsers = tabValue === 0 ? users : tabValue === 1 ? activeUsers : blockedUsers;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Управление пользователями
                </Typography>
                <Typography color="textSecondary">
                    Просмотр, создание и редактирование пользователей
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label={`Все пользователи (${users.length})`} />
                        <Tab label={`Активные (${activeUsers.length})`} />
                        <Tab label={`Заблокированные (${blockedUsers.length})`} />
                    </Tabs>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                        {tabValue === 0 ? 'Все пользователи' : tabValue === 1 ? 'Активные пользователи' : 'Заблокированные пользователи'}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Добавить пользователя
                    </Button>
                </Box>

                {currentUsers.length === 0 ? (
                    <Alert severity="info">
                        {tabValue === 0 ? 'Пользователи отсутствуют' :
                         tabValue === 1 ? 'Нет активных пользователей' :
                         'Нет заблокированных пользователей'}
                    </Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Имя пользователя</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Роль</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentUsers.map((userItem) => (
                                    <TableRow
                                        key={userItem.id}
                                        sx={{
                                            backgroundColor: userItem.isBlocked ? 'rgba(244, 67, 54, 0.08)' : 'inherit',
                                            '&:hover': {
                                                backgroundColor: userItem.isBlocked ? 'rgba(244, 67, 54, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        <TableCell>{userItem.id}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {userItem.username}
                                                {userItem.id === user?.id && (
                                                    <Chip label="Вы" size="small" color="primary" variant="outlined" />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{userItem.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={userItem.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                                                color={userItem.role === 'ADMIN' ? 'primary' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={userItem.isBlocked ? <LockIcon /> : <CheckCircleIcon />}
                                                label={userItem.isBlocked ? 'Заблокирован' : 'Активен'}
                                                color={userItem.isBlocked ? 'error' : 'success'}
                                                size="small"
                                                variant={userItem.isBlocked ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    variant="outlined"
                                                    onClick={() => handleOpenDialog(userItem)}
                                                    disabled={userItem.id === user?.id && userItem.role === 'ADMIN'}
                                                >
                                                    Редактировать
                                                </Button>

                                                {userItem.isBlocked ? (
                                                    <Button
                                                        size="small"
                                                        startIcon={<LockOpenIcon />}
                                                        variant="outlined"
                                                        color="success"
                                                        onClick={() => handleUnblockUser(userItem.id)}
                                                    >
                                                        Разблокировать
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="small"
                                                        startIcon={<BlockIcon />}
                                                        variant="outlined"
                                                        color="warning"
                                                        onClick={() => handleBlockUser(userItem.id)}
                                                        disabled={userItem.id === user?.id}
                                                    >
                                                        Заблокировать
                                                    </Button>
                                                )}

                                                <Button
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(userItem)}
                                                    disabled={userItem.id === user?.id}
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

                {/* Статистика */}
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Статистика:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                        <Chip label={`Всего: ${users.length}`} variant="outlined" />
                        <Chip label={`Администраторов: ${users.filter(u => u.role === 'ADMIN').length}`} color="primary" variant="outlined" />
                        <Chip label={`Пользователей: ${users.filter(u => u.role === 'USER').length}`} variant="outlined" />
                        <Chip label={`Активных: ${activeUsers.length}`} color="success" variant="outlined" />
                        <Chip label={`Заблокированных: ${blockedUsers.length}`} color="error" variant="outlined" />
                    </Box>
                </Box>
            </Paper>

            {/* Диалог добавления/редактирования пользователя */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Редактирование пользователя' : 'Добавить нового пользователя'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="username"
                        label="Имя пользователя"
                        fullWidth
                        variant="outlined"
                        value={formData.username}
                        onChange={handleFormChange}
                        sx={{ mt: 2 }}
                        required
                        helperText="Минимум 3 символа"
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Роль</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            onChange={handleSelectChange}
                            label="Роль"
                        >
                            <MenuItem value="USER">Пользователь</MenuItem>
                            <MenuItem value="ADMIN">Администратор</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        name="password"
                        label={editingUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={formData.password}
                        onChange={handleFormChange}
                        helperText={editingUser ? '' : 'Минимум 6 символов'}
                    />

                    {formData.password && (
                        <TextField
                            margin="dense"
                            name="confirmPassword"
                            label="Подтвердите пароль"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={formData.confirmPassword}
                            onChange={handleFormChange}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingUser ? 'Сохранить' : 'Добавить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Удаление пользователя</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить пользователя "{userToDelete?.username}"?
                        Все связанные данные (бронирования, билеты) также будут удалены. Это действие нельзя отменить.
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Внимание: удаление пользователя необратимо!
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
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

export default AdminUsers;