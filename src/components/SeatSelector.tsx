import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Seat {
  row: number;
  seat: number;
  status: 'available' | 'selected' | 'booked' | 'unavailable';
}

interface SeatSelectorProps {
  sessionId: number;
  hallRows: number;
  hallSeatsPerRow: number;
  onSeatsChange: (seats: string[]) => void;
  initialSelectedSeats?: string[];
  refreshTrigger?: number;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
  sessionId,
  hallRows,
  hallSeatsPerRow,
  onSeatsChange,
  initialSelectedSeats = [],
  refreshTrigger = 0,
}) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<Seat[][]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(initialSelectedSeats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const initializeSeats = useCallback(() => {
    const seatsArray: Seat[][] = [];
    for (let row = 1; row <= hallRows; row++) {
      const rowSeats: Seat[] = [];
      for (let seat = 1; seat <= hallSeatsPerRow; seat++) {
        rowSeats.push({
          row,
          seat,
          status: 'available',
        });
      }
      seatsArray.push(rowSeats);
    }
    setSeats(seatsArray);
    setLoading(false);
  }, [hallRows, hallSeatsPerRow]);

  const fetchBookedSeats = useCallback(async () => {
    try {
      const token = localStorage.getItem('cinema_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `http://localhost:8080/api/tickets/session/${sessionId}`,
        { headers }
      );

      const booked = response.data
        .filter((ticket: any) =>
          ticket.status === 'CONFIRMED' || ticket.status === 'PENDING'
        )
        .map((ticket: any) => `${ticket.rowNumber}-${ticket.seatNumber}`);

      setBookedSeats(booked);

      setSeats(prev =>
        prev.map((rowSeats, rowIndex) =>
          rowSeats.map((seat, seatIndex) => {
            const seatKey = `${rowIndex + 1}-${seatIndex + 1}`;
            return {
              ...seat,
              status: booked.includes(seatKey) ? 'booked' : seat.status === 'selected' ? 'available' : seat.status,
            };
          })
        )
      );
    } catch (err) {
      console.error('Ошибка загрузки забронированных мест:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    initializeSeats();
    fetchBookedSeats();
  }, [initializeSeats, fetchBookedSeats]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchBookedSeats();
      setSelectedSeats([]);
    }
  }, [refreshTrigger, fetchBookedSeats]);

  useEffect(() => {
    onSeatsChange(selectedSeats);
  }, [selectedSeats, onSeatsChange]);

  const checkSeatAvailability = async (row: number, seat: number) => {
    if (!user) {
      setError('Для выбора мест необходимо войти в систему');
      return false;
    }

    try {
      setIsChecking(true);
      const token = localStorage.getItem('cinema_token');

      if (!token) {
        setError('Токен не найден. Пожалуйста, войдите снова.');
        return false;
      }

      const response = await axios.get(
        'http://localhost:8080/api/tickets/check-seat',
        {
          params: {
            sessionId,
            rowNumber: row,
            seatNumber: seat,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (err: any) {
      console.error('Ошибка проверки места:', err);

      if (err.response?.status === 403) {
        setError('Доступ запрещен. Пожалуйста, войдите снова.');
        return false;
      } else if (err.response?.status === 401) {
        setError('Необходима авторизация');
        return false;
      } else if (err.response?.status === 404) {
        setError('Сеанс не найден');
        return false;
      }

      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleSeatClick = async (row: number, seat: number) => {
    if (!user) {
      setError('Для выбора мест необходимо войти в систему');
      return;
    }

    const seatKey = `${row}-${seat}`;

    if (bookedSeats.includes(seatKey)) {
      setError('Это место уже забронировано');
      return;
    }

    if (selectedSeats.includes(seatKey)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatKey));
      setSeats(prev =>
        prev.map((rowSeats, rowIndex) =>
          rowSeats.map((s, seatIndex) => {
            if (rowIndex + 1 === row && seatIndex + 1 === seat) {
              return { ...s, status: 'available' };
            }
            return s;
          })
        )
      );
      setError('');
      return;
    }

    setError('');

    const isAvailable = await checkSeatAvailability(row, seat);

    if (!isAvailable) {
      if (!error) {
        setError('Место сейчас недоступно');
      }
      return;
    }

    setSelectedSeats(prev => [...prev, seatKey]);

    setSeats(prev =>
      prev.map((rowSeats, rowIndex) =>
        rowSeats.map((s, seatIndex) => {
          if (rowIndex + 1 === row && seatIndex + 1 === seat) {
            return { ...s, status: 'selected' };
          }
          return s;
        })
      )
    );
  };

  const getSeatColor = (status: Seat['status']) => {
    switch (status) {
      case 'available': return '#4caf50';
      case 'selected': return '#2196f3';
      case 'booked': return '#f44336';
      case 'unavailable': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setSeats(prev =>
      prev.map(rowSeats =>
        rowSeats.map(seat => ({
          ...seat,
          status: seat.status === 'selected' ? 'available' : seat.status,
        }))
      )
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Выбор мест
      </Typography>

      {!user && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Для выбора мест необходимо войти в систему
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isChecking && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Проверка доступности места...
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#4caf50', borderRadius: 1 }} />
          <Typography variant="body2">Свободно</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#2196f3', borderRadius: 1 }} />
          <Typography variant="body2">Выбрано</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#f44336', borderRadius: 1 }} />
          <Typography variant="body2">Занято</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: 4,
          bgcolor: 'primary.main',
          mb: 4,
          borderRadius: 1,
          position: 'relative',
          '&::after': {
            content: '"ЭКРАН"',
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.75rem',
            color: 'text.secondary',
          },
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, alignItems: 'center' }}>
        {seats.map((rowSeats, rowIndex) => (
          <Box key={`row-${rowIndex}`} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ width: 30, textAlign: 'center' }}>
              {rowIndex + 1}
            </Typography>
            {rowSeats.map((seat, seatIndex) => (
              <Button
                key={`seat-${rowIndex}-${seatIndex}`}
                onClick={() => handleSeatClick(rowIndex + 1, seatIndex + 1)}
                disabled={seat.status === 'booked' || seat.status === 'unavailable' || !user || isChecking}
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  p: 0,
                  bgcolor: getSeatColor(seat.status),
                  color: 'white',
                  '&:hover': {
                    bgcolor: seat.status === 'available' ? '#388e3c' : getSeatColor(seat.status),
                  },
                  '&.Mui-disabled': {
                    bgcolor: seat.status === 'booked' ? '#f44336' : '#9e9e9e',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {seatIndex + 1}
              </Button>
            ))}
          </Box>
        ))}
      </Box>

      {selectedSeats.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            Вы выбрали {selectedSeats.length} мест:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {selectedSeats.map(seat => {
              const [row, seatNum] = seat.split('-');
              return `Ряд ${row}, Место ${seatNum}`;
            }).join(', ')}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={clearSelection}
          disabled={selectedSeats.length === 0 || !user}
        >
          Сбросить выбор
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
          {user ? 'Нажмите на место для выбора' : 'Войдите для выбора мест'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SeatSelector;