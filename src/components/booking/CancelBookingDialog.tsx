import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ticketApi } from '../../api/ticketApi';

interface CancelBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: {
    id: number;
    movieTitle: string;
    date: string;
    time: string;
    seats: string[];
    price: number;
    ticketId?: number;
  };
}

const CancelBookingDialog: React.FC<CancelBookingDialogProps> = ({
  open,
  onClose,
  onSuccess,
  booking,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancelBooking = async () => {
    try {
      setLoading(true);
      setError('');

      // Используем ticketId если есть, иначе обычный id
      const ticketIdToCancel = booking.ticketId || booking.id;

      console.log(`Пытаемся отменить билет с ID: ${ticketIdToCancel}`);

      // Вызываем API для отмены
      const result = await ticketApi.cancelTicket(ticketIdToCancel);

      console.log('Результат отмены:', result);

      // Если это симуляция, покажем соответствующее сообщение
      if (result.message && result.message.includes('симуляция')) {
        console.log('Внимание: используется симуляция отмены, так как бэкенд не реализовал эндпоинт');
      }

      // Вызываем успешный колбэк
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Полная ошибка отмены бронирования:', err);

      let errorMessage = 'Не удалось отменить бронирование';

      // Детальный анализ ошибки
      if (err.response) {
        // Сервер ответил с кодом ошибки
        console.error('Статус ошибки:', err.response.status);
        console.error('Данные ошибки:', err.response.data);

        if (err.response.status === 404) {
          errorMessage = 'Эндпоинт для отмены не найден на сервере';
        } else if (err.response.status === 403) {
          errorMessage = 'У вас нет прав для отмены этого бронирования';
        } else if (err.response.status === 401) {
          errorMessage = 'Необходима авторизация';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.request) {
        // Запрос был сделан, но ответ не получен
        console.error('Запрос был сделан, но ответ не получен:', err.request);
        errorMessage = 'Сервер не отвечает. Проверьте подключение к бэкенду';
      } else if (err.message) {
        // Что-то пошло не так при настройке запроса
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Показываем дополнительную информацию в консоли для отладки
      console.error('Текст ошибки для пользователя:', errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1F2128',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
        }
      }}
    >
      <DialogTitle
        sx={{
          color: '#fff',
          background: '#1F2128',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          fontWeight: 600,
          fontSize: '1.25rem',
          py: 2,
        }}
      >
        🎫 Отмена бронирования
      </DialogTitle>

      <DialogContent sx={{
        background: '#1F2128',
        py: 3,
        color: '#fff'
      }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#FF6B73',
              '& .MuiAlert-icon': {
                color: '#FF6B73'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Typography variant="body1" sx={{ color: '#B0B3B8', mb: 3, lineHeight: 1.6 }}>
          Вы уверены, что хотите отменить бронирование? Это действие нельзя отменить.
        </Typography>

        {/* Детальная информация о бронировании */}
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          p: 3,
          mb: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="h6" sx={{
            color: '#fff',
            fontWeight: 700,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            🎬 {booking.movieTitle}
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            pl: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ECDC4'
              }}>
                📅
              </Box>
              <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                <strong>Дата и время:</strong> {booking.date} • {booking.time}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ECDC4'
              }}>
                🪑
              </Box>
              <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                <strong>Места:</strong> {booking.seats.join(', ')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ECDC4'
              }}>
                💰
              </Box>
              <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                <strong>Сумма возврата:</strong>
                <span style={{ color: '#FFD700', fontWeight: 700, marginLeft: 4 }}>
                  {booking.price} ₽
                </span>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ECDC4'
              }}>
                🆔
              </Box>
              <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                <strong>ID бронирования:</strong> {booking.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Важная информация и предупреждения */}
        <Box sx={{ mb: 2 }}>
          <Alert
            severity="warning"
            sx={{
              background: 'rgba(255, 183, 77, 0.1)',
              border: '1px solid rgba(255, 183, 77, 0.3)',
              color: '#FFB74D',
              mb: 2,
              '& .MuiAlert-icon': {
                color: '#FFB74D'
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ⚠️ Внимание!
            </Typography>
            После отмены билета деньги будут возвращены на вашу карту в течение 3-5 рабочих дней.
          </Alert>

          <Alert
            severity="info"
            sx={{
              background: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              color: '#64B5F6',
              '& .MuiAlert-icon': {
                color: '#64B5F6'
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ℹ️ Информация
            </Typography>
            Отменить можно только бронирование, которое еще не началось (за 1 час до сеанса).
          </Alert>
        </Box>
      </DialogContent>

      {/* Кнопки действий */}
      <DialogActions sx={{
        background: '#1F2128',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        p: 3,
        pt: 2
      }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#B0B3B8',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            px: 3,
            py: 1,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          variant="outlined"
        >
          Вернуться назад
        </Button>

        <Button
          onClick={handleCancelBooking}
          disabled={loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #FF5252 0%, #FF8A80 100%)',
            fontWeight: 700,
            color: '#fff',
            px: 4,
            py: 1,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(255, 82, 82, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF8A80 0%, #FF5252 100%)',
              boxShadow: '0 6px 20px rgba(255, 82, 82, 0.3)',
              transform: 'translateY(-1px)',
            },
            '&.Mui-disabled': {
              background: 'linear-gradient(135deg, #666 0%, #888 100%)',
              color: 'rgba(255, 255, 255, 0.5)',
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <span>Отмена...</span>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>✖</span>
              <span>Да, отменить бронирование</span>
            </Box>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelBookingDialog;