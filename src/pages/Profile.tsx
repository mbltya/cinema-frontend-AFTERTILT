import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import {
  Edit,
  History,
  ConfirmationNumber,
  Movie,
  CalendarToday,
  LocationOn,
  AccessTime,
  Settings
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
    email: user?.email || ''
  });

  // Мок данные для демонстрации
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
      sessionId: 1
    },
    {
      id: 2,
      movieTitle: 'Начало',
      date: '10.12.2024',
      time: '21:00',
      seats: ['Ряд 3, Место 5'],
      price: 1500,
      status: 'completed',
      cinema: 'Кинотеатр "Москва"',
      hall: 'IMAX зал',
      sessionId: 2
    },
    {
      id: 3,
      movieTitle: 'Зеленая миля',
      date: '20.12.2024',
      time: '18:15',
      seats: ['Ряд 7, Место 8', 'Ряд 7, Место 9'],
      price: 2000,
      status: 'active',
      cinema: 'Кинотеатр "Октябрь"',
      hall: 'VIP зал',
      sessionId: 3
    },
  ];

  useEffect(() => {
    // Загрузка реальных бронирований
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Здесь будет реальный API запрос
      // const response = await axios.get(`http://localhost:8080/api/tickets/user/${user?.id}`);

      // Пока используем мок данные
      setTimeout(() => {
        setBookings(mockBookings);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
      setBookings(mockBookings); // Fallback на мок данные
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = () => {
    setIsEditing(false);
    // Здесь будет вызов API для обновления профиля
    console.log('Сохранение данных:', editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      username: user?.username || 'Пользователь',
      email: user?.email || ''
    });
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Мой профиль
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4
      }}>
        {/* Левая колонка - информация профиля */}
        <Box sx={{
          width: { xs: '100%', md: '35%' },
          minWidth: { md: 300 }
        }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  fontSize: '2rem',
                  bgcolor: 'primary.main'
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
                    mt: 1
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{bookings.length}</Typography>
                      <Typography variant="caption">Бронирований</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">
                        {bookings.reduce((sum, booking) => sum + booking.price, 0)} ₽
                      </Typography>
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

        {/* Правая колонка - активность */}
        <Box sx={{
          width: { xs: '100%', md: '65%' },
          flex: 1
        }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<History />} label="История бронирований" />
              <Tab icon={<ConfirmationNumber />} label="Активные билеты" />
              <Tab icon={<Settings />} label="Настройки" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                История бронирований
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : bookings.length === 0 ? (
                <Alert severity="info">
                  У вас пока нет бронирований
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
                          alignItems: { xs: 'flex-start', md: 'center' }
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
                            mt: { xs: 2, md: 0 }
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
              <Alert severity="info">
                Активные билеты появятся здесь после бронирования
              </Alert>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/sessions')}
              >
                Посмотреть сеансы
              </Button>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Настройки аккаунта
              </Typography>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Настройки временно недоступны. Функциональность будет добавлена позже.
              </Alert>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Выйти из аккаунта
              </Button>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Profile;