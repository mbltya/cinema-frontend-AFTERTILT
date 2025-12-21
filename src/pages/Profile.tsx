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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Cancel,
  Refresh,
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
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  cinema: string;
  hall: string;
  sessionId: number;
  ticketId?: number;
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
        return {
          id: ticket.id,
          ticketId: ticket.id,
          movieTitle: ticket.movieTitle || 'Неизвестный фильм',
          date: new Date(sessionTime).toLocaleDateString('ru-RU'),
          time: new Date(sessionTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
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
      setSnackbar({
        open: true,
        message: 'Ошибка загрузки бронирований',
        type: 'error'
      });

      // Fallback данные для демонстрации
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
        {
          id: 2,
          movieTitle: 'Дюна: Часть вторая',
          date: '16.12.2024',
          time: '20:00',
          seats: ['Ряд 7, Место 8'],
          price: 1500,
          status: 'active',
          cinema: 'Кинотеатр "Октябрь"',
          hall: 'Зал 3',
          sessionId: 2,
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

  const mapTicketStatus = (status: string): Booking['status'] => {
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
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    fetchBookings();
    refreshUser(); // Обновляем данные пользователя
    setSnackbar({
      open: true,
      message: 'Бронирование успешно отменено',
      type: 'success'
    });
  };

  const activeBookings = bookings.filter(b => b.status === 'active');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
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
                <Chip
                  label={`Участник с 2024`}
                  size="small"
                  sx={{ mt: 1, background: 'rgba(255, 255, 255, 0.1)', color: '#B0B3B8' }}
                />
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
                      {totalSpent} ₽
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B0B3B8' }}>
                      Всего потрачено
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fff' }}>
                      {cancelledBookings.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B0B3B8' }}>
                      Отменено
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
                  label="История бронирований"
                  sx={{ color: '#B0B3B8' }}
                />
                <Tab
                  icon={<ConfirmationNumber />}
                  label="Активные билеты"
                  sx={{ color: '#B0B3B8' }}
                />
                <Tab
                  icon={<Cancel />}
                  label="Отмененные"
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

            {/* Таб 1: Все бронирования */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                История бронирований
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#FF3A44' }} />
                </Box>
              ) : bookings.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    color: '#64B5F6',
                  }}
                >
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
                    <Card
                      key={booking.id}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
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
                              label={booking.status === 'active' ? 'Активен' :
                                     booking.status === 'completed' ? 'Завершен' :
                                     booking.status === 'cancelled' ? 'Отменен' : 'В обработке'}
                              color={booking.status === 'active' ? 'success' :
                                     booking.status === 'completed' ? 'default' :
                                     booking.status === 'cancelled' ? 'error' : 'warning'}
                              size="small"
                              sx={{ mb: 1 }}
                            />

                            <Typography variant="h6" sx={{ mt: 1, color: '#fff' }}>
                              {booking.price} ₽
                            </Typography>

                            {booking.status === 'active' && (
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: '#FF3A44',
                                    borderColor: '#FF3A44',
                                  }}
                                  onClick={() => handleCancelClick(booking)}
                                >
                                  Отменить
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => navigate(`/booking/${booking.sessionId}`)}
                                >
                                  Подробнее
                                </Button>
                              </Box>
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

                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => handleCancelClick(booking)}
                                sx={{
                                  background: 'linear-gradient(135deg, #FF5252 0%, #FF8A80 100%)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #FF8A80 0%, #FF5252 100%)',
                                  },
                                }}
                              >
                                Отменить
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/booking/${booking.sessionId}`)}
                              >
                                Подробнее
                              </Button>
                            </Box>
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

            {/* Таб 3: Отмененные билеты */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Отмененные бронирования
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#FF3A44' }} />
                </Box>
              ) : cancelledBookings.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    color: '#64B5F6',
                  }}
                >
                  У вас нет отмененных бронирований
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cancelledBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      sx={{
                        background: 'rgba(244, 67, 54, 0.05)',
                        border: '1px solid rgba(244, 67, 54, 0.2)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                          {booking.movieTitle}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            label="Отменен"
                            color="error"
                            size="small"
                          />
                          <Typography variant="caption" sx={{ color: '#FF6B73' }}>
                            Деньги будут возвращены в течение 3-5 рабочих дней
                          </Typography>
                        </Box>

                        <Typography color="#B0B3B8" sx={{ mt: 1 }}>
                          Дата отмены: {booking.date} • {booking.time}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 1, color: '#B0B3B8' }}>
                          Возвращаемая сумма: {booking.price} ₽
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
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