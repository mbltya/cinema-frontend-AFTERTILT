import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const ticketApi = {
  cancelTicket: async (ticketId: number) => {
    const token = localStorage.getItem('cinema_token');

    if (!token) {
      throw new Error('Требуется авторизация');
    }

    try {
      const response = await axios.delete(`${API_URL}/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        message: 'Бронирование успешно отменено',
        data: response.data,
      };

    } catch (error: any) {
      if (error.response?.status === 405) {
        try {
          const putResponse = await axios.put(
            `${API_URL}/tickets/${ticketId}/cancel`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            success: true,
            message: 'Бронирование отменено',
            data: putResponse.data,
          };

        } catch (putError: any) {
          if (putError.response?.status === 404 || putError.response?.status === 403) {
            console.log('Используем симуляцию отмены');
            return simulateCancellation(ticketId);
          }
          throw putError;
        }
      }

      if (error.response?.status === 403) {
        throw new Error('Вы не можете отменить этот билет. Возможно, он принадлежит другому пользователю.');
      }

      if (error.response?.status === 404) {
        console.log('Эндпоинт не найден, используем симуляцию');
        return simulateCancellation(ticketId);
      }

      throw error;
    }
  },

  getUserTickets: async (userId: number) => {
    const token = localStorage.getItem('cinema_token');
    const response = await axios.get(`${API_URL}/tickets/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

const simulateCancellation = (ticketId: number) => {
  console.log(`Симуляция отмены билета ${ticketId}`);

  const cancelledTickets = JSON.parse(
    localStorage.getItem('simulated_cancelled_tickets') || '[]'
  );
  cancelledTickets.push({
    ticketId,
    cancelledAt: new Date().toISOString(),
  });
  localStorage.setItem('simulated_cancelled_tickets', JSON.stringify(cancelledTickets));

  return {
    success: true,
    message: 'Бронирование отменено (симуляция - бэкенд не реализован)',
    simulation: true,
  };
};