import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Snackbar,
  IconButton,
} from '@mui/material';
import {
  Edit,
  History,
  ConfirmationNumber,
  CalendarToday,
  LocationOn,
  AccessTime,
  Settings,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Booking {
  id: number;
  movieTitle: string;
  date: string;
  time: string;
  seats: string[];
  price: number;
  status: 'active' | 'completed' | 'cancelled';
  cinema: string;
  hall: string;
  sessionId: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || 'Пользователь',
    email: user?.email || '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchBookings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('cinema_token');
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `http://localhost:8080/api/tickets/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Данные билетов:', response.data); // Для отладки

      const bookingsData: Booking[] = response.data.map((ticket: any) => {
        const sessionTime = ticket.sessionTime || ticket.purchaseTime;
        return {
          id: ticket.id,
          movieTitle: ticket.movieTitle || 'Неизвестный фильм',
          date: new Date(sessionTime).toLocaleDateString('ru-RU'),
          time: new Date(sessionTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          seats: ticket.rowNumber && ticket.seatNumber
            ? [`Ряд ${ticket.rowNumber}, Место ${ticket.seatNumber}`]
            : ['Место не указано'],
          price: ticket.price || 0,
          status: mapTicketStatus(ticket.status),
          cinema: ticket.cinemaName || 'Кинотеатр',
          hall: ticket.hallName || 'Зал',
          sessionId: ticket.sessionId || 0,
        };
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
      setSnackbar({ open: true, message: 'Ошибка загрузки бронирований', type: 'error' });

      // Fallback: показываем mock данные для отладки
      const mockBookings: Booking[] = [
        {
          id: 1,
          movieTitle: 'Интерстеллар',
          date: '15.12.2024',
          time: '19:30',
          seats: ['Ряд 5, Место 10', 'Ряд 5, Место 11'],
          price: 2500,
          status: 'active',
          cinema: 'Кинотеатр "Октябрь"',
          hall: 'Зал 1',
          sessionId: 1,
        },
      ];
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const mapTicketStatus = (status: string): 'active' | 'completed' | 'cancelled' => {
    if (!status) return 'active';

    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'CONFIRMED':
        return 'active';
      case 'USED':
        return 'completed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'active';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('cinema_token');
      await axios.put(
        `http://localhost:8080/api/users/${user.id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsEditing(false);
      setSnackbar({ open: true, message: 'Профиль успешно обновлен', type: 'success' });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      setSnackbar({ open: true, message: 'Ошибка обновления профиля', type: 'error' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      username: user?.username || 'Пользователь',
      email: user?.email || '',
    });
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: 'Пароли не совпадают', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Новый пароль должен содержать минимум 6 символов', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('cinema_token');
      await axios.put(
        `http://localhost:8080/api/users/${user?.id}`,
        {
          password: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSnackbar({ open: true, message: 'Пароль успешно изменен', type: 'success' });
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      setSnackbar({ open: true, message: 'Ошибка смены пароля', type: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRefreshBookings = () => {
    fetchBookings();
    setSnackbar({ open: true, message: 'Список бронирований обновлен', type: 'success' });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          Пожалуйста, войдите в систему для просмотра профиля
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/login')}
        >
          Войти
        </Button>
      </Container>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'active');
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.price, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Мой профиль
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
      }}>
        <Box sx={{
          width: { xs: '100%', md: '35%' },
          minWidth: { md: 300 },
        }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  fontSize: '2rem',
                  bgcolor: 'primary.main',
                }}
              >
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h5">{user.username || 'Пользователь'}</Typography>
                <Typography color="textSecondary">
                  {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                </Typography>
                <Chip
                  label={`Участник с 2024`}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {isEditing ? (
              <Box>
                <TextField
                  fullWidth
                  label="Имя пользователя"
                  value={editData.username}
                  onChange={(e) => setEditData({...editData, username: e.target.value})}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  margin="normal"
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    fullWidth
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    fullWidth
                  >
                    Отмена
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>Информация</Typography>
                <Typography paragraph><strong>Email:</strong> {user.email}</Typography>
                <Typography paragraph><strong>Роль:</strong> {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}</Typography>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary">Статистика</Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 1,
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{bookings.length}</Typography>
                      <Typography variant="caption">Бронирований</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{totalSpent} ₽</Typography>
                      <Typography variant="caption">Всего потрачено</Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Редактировать профиль
                </Button>
              </Box>
            )}
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Любимые жанры</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {['Фантастика', 'Драма', 'Триллер', 'Комедия'].map((genre, index) => (
                <Chip key={index} label={genre} color="primary" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Box>

        <Box sx={{
          width: { xs: '100%', md: '65%' },
          flex: 1,
        }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab icon={<History />} label="История бронирований" />
                <Tab icon={<ConfirmationNumber />} label="Активные билеты" />
                <Tab icon={<Settings />} label="Настройки профиля" />
              </Tabs>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRefreshBookings}
                disabled={loading}
              >
                Обновить
              </Button>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                История бронирований
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : bookings.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  У вас пока нет бронирований
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={() => navigate('/sessions')}
                  >
                    Купить билеты
                  </Button>
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', md: 'center' },
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">{booking.movieTitle}</Typography>
                            <Typography color="textSecondary" sx={{ mt: 1 }}>
                              <CalendarToday sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                              {booking.date} •
                              <AccessTime sx={{ fontSize: 14, verticalAlign: 'middle', mx: 0.5 }} />
                              {booking.time}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <LocationOn sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                              {booking.cinema} • {booking.hall}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Места: {booking.seats.join(', ')}
                            </Typography>
                          </Box>
                          <Box sx={{
                            textAlign: { xs: 'left', md: 'right' },
                            mt: { xs: 2, md: 0 },
                          }}>
                            <Chip
                              label={booking.status === 'active' ? 'Активен' :
                                     booking.status === 'completed' ? 'Завершен' : 'Отменен'}
                              color={booking.status === 'active' ? 'success' :
                                     booking.status === 'completed' ? 'default' : 'error'}
                              size="small"
                            />
                            <Typography variant="h6" sx={{ mt: 1 }}>
                              {booking.price} ₽
                            </Typography>
                            {booking.status === 'active' && (
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ mt: 1 }}
                                onClick={() => navigate(`/booking/${booking.sessionId}`)}
                              >
                                Подробнее
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Активные билеты
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : activeBookings.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  У вас нет активных билетов
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={() => navigate('/sessions')}
                  >
                    Купить билеты
                  </Button>
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activeBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">{booking.movieTitle}</Typography>
                            <Typography color="textSecondary" sx={{ mt: 1 }}>
                              {booking.date} • {booking.time}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Места: {booking.seats.join(', ')}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip label="Активен" color="success" size="small" />
                            <Typography variant="h6" sx={{ mt: 1 }}>
                              {booking.price} ₽
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1 }}
                              onClick={() => navigate(`/booking/${booking.sessionId}`)}
                            >
                              Подробнее
                            </Button>
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            QR-код для входа:
                          </Typography>
                          <Box
                            sx={{
                              width: 120,
                              height: 120,
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="caption" color="textSecondary" align="center">
                              QR-код<br />билета #{booking.id}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/sessions')}
              >
                Купить билеты
              </Button>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Настройки профиля
              </Typography>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Личная информация
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Имя пользователя"
                    value={editData.username}
                    onChange={(e) => setEditData({...editData, username: e.target.value})}
                    fullWidth
                  />

                  <TextField
                    label="Email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Смена пароля
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Текущий пароль"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    fullWidth
                  />

                  <TextField
                    label="Новый пароль"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    fullWidth
                  />

                  <TextField
                    label="Подтвердите новый пароль"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    fullWidth
                  />

                  <Button
                    variant="outlined"
                    onClick={handleChangePassword}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Сменить пароль
                  </Button>
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom color="error">
                  Опасная зона
                </Typography>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  sx={{ mr: 2 }}
                >
                  Выйти из аккаунта
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
                      alert('Функция удаления аккаунта будет реализована позже');
                    }
                  }}
                >
                  Удалить аккаунт
                </Button>
              </Paper>
            </TabPanel>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: snackbar.type === 'success' ? '#4caf50' : '#f44336',
          }
        }}
      />
    </Container>
  );
};

export default Profile;