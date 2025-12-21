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
  Snackbar,
  IconButton,
} from '@mui/material';
import {
  History,
  ConfirmationNumber,
  CalendarToday,
  LocationOn,
  AccessTime,
  Refresh,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CancelBookingDialog from '../components/booking/CancelBookingDialog';

interface Booking {
  id: number;
  movieTitle: string;
  date: string;
  time: string;
  seats: string[];
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  cinema: string;
  hall: string;
  sessionId: number;
  ticketId?: number;
  sessionTime?: string;
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
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Функция для проверки, прошел ли сеанс
  const isSessionPassed = (sessionTime: string): boolean => {
    try {
      const sessionDate = new Date(sessionTime);
      const now = new Date();
      return sessionDate < now;
    } catch {
      return false;
    }
  };

  // Функция для определения статуса билета (только 3 статуса)
  const determineTicketStatus = (ticket: any): Booking['status'] => {
    // Если билет отменен
    if (ticket.status === 'CANCELLED') {
      return 'cancelled';
    }

    // Проверяем, прошел ли сеанс
    const sessionTime = ticket.sessionTime || ticket.purchaseTime;
    if (sessionTime && isSessionPassed(sessionTime)) {
      return 'expired';
    }

    // Если не отменен и сеанс не прошел - активен
    return 'active';
  };

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

      console.log('Данные билетов:', response.data);

      const bookingsData: Booking[] = response.data.map((ticket: any) => {
        const sessionTime = ticket.sessionTime || ticket.purchaseTime;
        const status = determineTicketStatus(ticket);

        return {
          id: ticket.id,
          ticketId: ticket.id,
          movieTitle: ticket.movieTitle || 'Неизвестный фильм',
          date: sessionTime ? new Date(sessionTime).toLocaleDateString('ru-RU') : 'Дата не указана',
          time: sessionTime ? new Date(sessionTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }) : 'Время не указано',
          seats: ticket.rowNumber && ticket.seatNumber
            ? [`Ряд ${ticket.rowNumber}, Место ${ticket.seatNumber}`]
            : ['Место не указано'],
          price: ticket.price || 0,
          status: status,
          cinema: ticket.cinemaName || 'Кинотеатр',
          hall: ticket.hallName || 'Зал',
          sessionId: ticket.sessionId || 0,
          sessionTime: sessionTime,
        };
      });

      // Сортируем по дате сеанса (новые сверху)
      bookingsData.sort((a, b) => {
        if (!a.sessionTime || !b.sessionTime) return 0;
        return new Date(b.sessionTime).getTime() - new Date(a.sessionTime).getTime();
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка загрузки бронирований',
        type: 'error'
      });

      // Fallback данные для демонстрации с 3 статусами
      const mockBookings: Booking[] = [
        {
          id: 1,
          movieTitle: 'Интерстеллар',
          date: '15.12.2024',
          time: '19:30',
          seats: ['Ряд 5, Место 10', 'Ряд 5, Место 11'],
          price: 2500,
          status: 'active', // Активен - сеанс еще не прошел
          cinema: 'Кинотеатр "Октябрь"',
          hall: 'Зал 1',
          sessionId: 1,
          sessionTime: '2024-12-15T19:30:00',
        },
        {
          id: 2,
          movieTitle: 'Дюна: Часть вторая',
          date: '01.10.2024',
          time: '20:00',
          seats: ['Ряд 7, Место 8'],
          price: 1500,
          status: 'expired', // Не активен - сеанс прошел
          cinema: 'Кинотеатр "Октябрь"',
          hall: 'Зал 3',
          sessionId: 2,
          sessionTime: '2024-10-01T20:00:00',
        },
        {
          id: 3,
          movieTitle: 'Мстители: Финал',
          date: '20.12.2024',
          time: '18:00',
          seats: ['Ряд 4, Место 12'],
          price: 1800,
          status: 'cancelled', // Отменен
          cinema: 'Кинотеатр "Октябрь"',
          hall: 'Зал 2',
          sessionId: 3,
          sessionTime: '2024-12-20T18:00:00',
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRefreshBookings = () => {
    fetchBookings();
    setSnackbar({
      open: true,
      message: 'Список бронирований обновлен',
      type: 'success'
    });
  };

  const handleCancelClick = (booking: Booking) => {
    // Проверяем, можно ли отменить этот билет
    if (booking.status !== 'active') {
      setSnackbar({
        open: true,
        message: 'Этот билет нельзя отменить',
        type: 'error'
      });
      return;
    }
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    fetchBookings();
    refreshUser();
    setSnackbar({
      open: true,
      message: 'Бронирование успешно отменено',
      type: 'success'
    });
  };

  // Фильтрация для разных табов
  const activeBookings = bookings.filter(b => b.status === 'active');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  const expiredBookings = bookings.filter(b => b.status === 'expired');

  // Для первого таба показываем все билеты
  const allBookings = bookings;

  // Общая статистика
  const totalSpent = bookings
    .filter(b => b.status === 'active')
    .reduce((sum, booking) => sum + booking.price, 0);

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

  // Функция для получения цвета статуса
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  // Функция для получения текста статуса
  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'cancelled': return 'Отменен';
      case 'expired': return 'Прошел';
      default: return 'Неизвестно';
    }
  };

  // Функция для проверки, можно ли отменить билет
  const canCancelBooking = (booking: Booking) => {
    return booking.status === 'active' && booking.sessionTime && !isSessionPassed(booking.sessionTime);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: '#fff' }}>
        Мой профиль
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
      }}>
        {/* Левая колонка - информация профиля */}
        <Box sx={{
          width: { xs: '100%', md: '35%' },
          minWidth: { md: 300 },
        }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, background: '#1F2128' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #FF3A44, #4ECDC4)',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ color: '#fff' }}>
                  {user.username || 'Пользователь'}
                </Typography>
                <Typography color="#B0B3B8">
                  {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Информация
              </Typography>
              <Typography paragraph sx={{ color: '#B0B3B8' }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography paragraph sx={{ color: '#B0B3B8' }}>
                <strong>Роль:</strong> {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="#B0B3B8">
                  Статистика
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 1,
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                      {bookings.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B0B3B8' }}>
                      Всего билетов
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                      {activeBookings.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B0B3B8' }}>
                      Активных
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Правая колонка - табы с бронированиями */}
        <Box sx={{
          width: { xs: '100%', md: '65%' },
          flex: 1,
        }}>
          <Paper elevation={3} sx={{ p: 3, background: '#1F2128' }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab
                  icon={<History />}
                  label="Все билеты"
                  sx={{ color: '#B0B3B8' }}
                />
                <Tab
                  icon={<ConfirmationNumber />}
                  label="Активные"
                  sx={{ color: '#B0B3B8' }}
                />
              </Tabs>

              <Button
                variant="outlined"
                size="small"
                onClick={handleRefreshBookings}
                disabled={loading}
                startIcon={<Refresh />}
                sx={{
                  color: '#FF3A44',
                  borderColor: '#FF3A44',
                  '&:hover': {
                    borderColor: '#FF6B73',
                    background: 'rgba(255, 58, 68, 0.1)',
                  },
                }}
              >
                Обновить
              </Button>
            </Box>

            {/* Таб 1: Все билеты */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Все билеты
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#FF3A44' }} />
                </Box>
              ) : allBookings.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    color: '#64B5F6',
                  }}
                >
                  У вас пока нет билетов
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
                  {allBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      sx={{
                        background: booking.status === 'cancelled'
                          ? 'rgba(244, 67, 54, 0.05)'
                          : booking.status === 'expired'
                          ? 'rgba(255, 152, 0, 0.05)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: booking.status === 'cancelled'
                          ? '1px solid rgba(244, 67, 54, 0.2)'
                          : booking.status === 'expired'
                          ? '1px solid rgba(255, 152, 0, 0.2)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <CardContent>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', md: 'center' },
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ color: '#fff' }}>
                              {booking.movieTitle}
                            </Typography>
                            <Typography color="#B0B3B8" sx={{ mt: 1 }}>
                              <CalendarToday sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                              {booking.date} •
                              <AccessTime sx={{ fontSize: 14, verticalAlign: 'middle', mx: 0.5 }} />
                              {booking.time}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, color: '#B0B3B8' }}>
                              <LocationOn sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                              {booking.cinema} • {booking.hall}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, color: '#B0B3B8' }}>
                              Места: {booking.seats.join(', ')}
                            </Typography>
                          </Box>

                          <Box sx={{
                            textAlign: { xs: 'left', md: 'right' },
                            mt: { xs: 2, md: 0 },
                          }}>
                            <Chip
                              label={getStatusText(booking.status)}
                              color={getStatusColor(booking.status)}
                              size="small"
                              sx={{ mb: 1 }}
                            />

                            <Typography variant="h6" sx={{ mt: 1, color: '#fff' }}>
                              {booking.price} ₽
                            </Typography>

                            {booking.status === 'cancelled' && (
                              <Typography variant="caption" sx={{ color: '#FF6B73', display: 'block', mt: 1 }}>
                                Отменено
                              </Typography>
                            )}

                            {booking.status === 'expired' && (
                              <Typography variant="caption" sx={{ color: '#FFB74D', display: 'block', mt: 1 }}>
                                Сеанс прошел
                              </Typography>
                            )}

                            {booking.status === 'active' && canCancelBooking(booking) && (
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{
                                  mt: 1,
                                  color: '#FF3A44',
                                  borderColor: '#FF3A44',
                                }}
                                onClick={() => handleCancelClick(booking)}
                              >
                                Отменить
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

            {/* Таб 2: Активные билеты */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Активные билеты
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#FF3A44' }} />
                </Box>
              ) : activeBookings.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    color: '#64B5F6',
                  }}
                >
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
                    <Card
                      key={booking.id}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#fff' }}>
                              {booking.movieTitle}
                            </Typography>
                            <Typography color="#B0B3B8" sx={{ mt: 1 }}>
                              {booking.date} • {booking.time}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, color: '#B0B3B8' }}>
                              Места: {booking.seats.join(', ')}
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: 'right' }}>
                            <Chip
                              label="Активен"
                              color="success"
                              size="small"
                              sx={{ mb: 1 }}
                            />

                            <Typography variant="h6" sx={{ mt: 1, color: '#fff' }}>
                              {booking.price} ₽
                            </Typography>

                            {canCancelBooking(booking) && (
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => handleCancelClick(booking)}
                                sx={{
                                  mt: 1,
                                  background: 'linear-gradient(135deg, #FF5252 0%, #FF8A80 100%)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #FF8A80 0%, #FF5252 100%)',
                                  },
                                }}
                              >
                                Отменить
                              </Button>
                            )}
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
          </Paper>
        </Box>
      </Box>

      {/* Диалог отмены бронирования */}
      {selectedBooking && (
        <CancelBookingDialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          onSuccess={handleCancelSuccess}
          booking={selectedBooking}
        />
      )}

      {/* Уведомления */}
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
            background: snackbar.type === 'success' ? '#4caf50' : '#f44336',
          },
        }}
      />
    </Container>
  );
};

export default Profile;