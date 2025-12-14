import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import SeatSelector from "../components/SeatSelector";

const BookingPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [hallInfo, setHallInfo] = useState<{ rows: number; seatsPerRow: number } | null>(null);
  const [refreshSeats, setRefreshSeats] = useState(0);

  const fetchHallInfo = useCallback(async (hallId: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/halls/${hallId}`);
      setHallInfo({
        rows: response.data.rows || 10,
        seatsPerRow: response.data.seatsPerRow || 15,
      });
    } catch (err) {
      console.error("Ошибка загрузки информации о зале:", err);
      setHallInfo({ rows: 10, seatsPerRow: 15 });
    }
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/sessions/${sessionId}`);
      setSession(response.data);

      if (response.data.hallId) {
        await fetchHallInfo(response.data.hallId);
      }
    } catch (err: any) {
      console.error("Ошибка загрузки сеанса:", err);
      setError("Не удалось загрузить информацию о сеансе");
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchHallInfo]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleSeatsChange = (seats: string[]) => {
    setSelectedSeats(seats);
  };

  const handleBookingClick = () => {
    if (!user) {
      alert("Пожалуйста, войдите в систему для бронирования");
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Выберите хотя бы одно место");
      return;
    }

    setConfirmationOpen(true);
  };

  const handleBookingConfirm = async () => {
    if (!user) return;

    setIsBooking(true);
    setConfirmationOpen(false);

    try {
      const token = localStorage.getItem('cinema_token');
      if (!token) {
        throw new Error("Токен не найден");
      }

      const ticketsData = selectedSeats.map(seat => {
        const [row, seatNum] = seat.split('-').map(Number);
        return {
          userId: user.id,
          sessionId: parseInt(sessionId || "0"),
          rowNumber: row,
          seatNumber: seatNum,
        };
      });

      // Создаем билеты по одному
      const createdTickets = [];
      for (const ticketData of ticketsData) {
        try {
          const response = await axios.post(
            'http://localhost:8080/api/tickets',
            ticketData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          createdTickets.push(response.data);
        } catch (ticketError: any) {
          console.error(`Ошибка создания билета для места ${ticketData.rowNumber}-${ticketData.seatNumber}:`, ticketError);

          // Проверяем, если место уже занято
          if (ticketError.response?.status === 400 || ticketError.response?.status === 409) {
            throw new Error(`Место ${ticketData.rowNumber}-${ticketData.seatNumber} уже занято или недоступно.`);
          }
          throw ticketError;
        }
      }

      alert(`Бронирование успешно!\nКуплено билетов: ${createdTickets.length}\nСумма: ${(session?.price || 0) * createdTickets.length} руб.`);

      // Обновляем кэш
      setRefreshSeats(prev => prev + 1);
      setSelectedSeats([]);

      // Немедленное обновление данных
      await fetchSession();

      setTimeout(() => {
        navigate("/profile");
      }, 1000);

    } catch (err: any) {
      console.error("Ошибка бронирования:", err);

      let errorMessage = "Ошибка при бронировании. Попробуйте снова.";

      if (err.message && err.message.includes("уже занято")) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);

      // Обновляем данные после ошибки
      await fetchSession();
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !session) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || "Сеанс не найден"}
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/sessions")}>
          Вернуться к сеансам
        </Button>
      </Container>
    );
  }

  const totalPrice = (session?.price || 0) * selectedSeats.length;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Бронирование билетов
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {session.movieTitle || "Фильм"}
        </Typography>
        <Typography color="textSecondary" paragraph>
          Кинотеатр: {session.cinemaName || "Не указан"} • Зал: {session.hallName || "Не указан"}
        </Typography>
        <Typography paragraph>
          Время: {new Date(session.startTime).toLocaleString("ru-RU")}
        </Typography>
        <Typography variant="h6" color="primary">
          Цена за билет: {session.price || 0} руб.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Выбор мест
        </Typography>

        {hallInfo ? (
          <SeatSelector
            sessionId={parseInt(sessionId || "0")}
            hallRows={hallInfo.rows}
            hallSeatsPerRow={hallInfo.seatsPerRow}
            onSeatsChange={handleSeatsChange}
            initialSelectedSeats={selectedSeats}
            refreshTrigger={refreshSeats}
          />
        ) : (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Итог
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography>Выбрано мест:</Typography>
          <Typography>{selectedSeats.length}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography>Цена за билет:</Typography>
          <Typography>{session.price || 0} руб.</Typography>
        </Box>

        {selectedSeats.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Выбранные места:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedSeats.map(seat => {
                const [row, seatNum] = seat.split('-');
                return `Ряд ${row}, Место ${seatNum}`;
              }).join(', ')}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h6">К оплате:</Typography>
          <Typography variant="h5" color="primary">
            {totalPrice.toFixed(2)} руб.
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleBookingClick}
          disabled={isBooking || selectedSeats.length === 0}
          sx={{ flex: 1, py: 1.5 }}
        >
          {isBooking ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1, color: "white" }} />
              Бронирование...
            </>
          ) : (
            "Забронировать"
          )}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate("/sessions")}
          sx={{ py: 1.5 }}
        >
          Отмена
        </Button>
      </Box>

      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <DialogTitle>Подтверждение бронирования</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Вы уверены, что хотите забронировать {selectedSeats.length} билет(а/ов)?
          </Typography>
          <Typography paragraph>
            Фильм: <strong>{session.movieTitle}</strong>
          </Typography>
          <Typography paragraph>
            Время: {new Date(session.startTime).toLocaleString("ru-RU")}
          </Typography>
          <Typography paragraph>
            Выбранные места:{" "}
            {selectedSeats.map(seat => {
              const [row, seatNum] = seat.split('-');
              return `Ряд ${row}, Место ${seatNum}`;
            }).join(', ')}
          </Typography>
          <Typography variant="h6" color="primary">
            Итого: {totalPrice.toFixed(2)} руб.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleBookingConfirm}
            color="primary"
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingPage;