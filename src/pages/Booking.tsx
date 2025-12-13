import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const BookingPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketsCount, setTicketsCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/sessions/${sessionId}`);
      setSession(response.data);
    } catch (err: any) {
      console.error("Ошибка загрузки сеанса:", err);
      setError("Не удалось загрузить информацию о сеансе");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      alert("Пожалуйста, войдите в систему для бронирования");
      navigate("/login");
      return;
    }

    if (ticketsCount < 1) {
      alert("Выберите хотя бы один билет");
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        userId: user.id,
        sessionId: parseInt(sessionId || "0"),
        ticketsCount,
        seats: selectedSeats,
        totalPrice: (session?.price || 0) * ticketsCount
      };

      // Здесь будет вызов API для создания билетов
      console.log("Данные бронирования:", bookingData);

      alert(`Бронирование успешно!\nБилетов: ${ticketsCount}\nСумма: ${bookingData.totalPrice} руб.`);
      navigate("/profile");

    } catch (err: any) {
      console.error("Ошибка бронирования:", err);
      alert("Ошибка при бронировании. Попробуйте снова.");
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

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Бронирование билетов
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {session.movieTitle}
        </Typography>
        <Typography color="textSecondary" paragraph>
          Кинотеатр: {session.cinemaName || "Не указан"} • Зал: {session.hallName || "Не указан"}
        </Typography>
        <Typography paragraph>
          Время: {new Date(session.startTime).toLocaleString("ru-RU")}
        </Typography>
        <Typography variant="h6" color="primary">
          Цена за билет: {session.price} руб.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Выбор билетов
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Количество билетов</InputLabel>
          <Select
            value={ticketsCount}
            label="Количество билетов"
            onChange={(e) => setTicketsCount(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <MenuItem key={num} value={num}>
                {num} {num === 1 ? "билет" : num < 5 ? "билета" : "билетов"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="textSecondary">
          * Выбор конкретных мест будет доступен на следующем этапе разработки
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Итог
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography>Билеты:</Typography>
          <Typography>{ticketsCount} × {session.price} руб.</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">К оплате:</Typography>
          <Typography variant="h5" color="primary">
            {(session.price * ticketsCount).toFixed(2)} руб.
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleBooking}
          disabled={isBooking}
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
    </Container>
  );
};

export default BookingPage;