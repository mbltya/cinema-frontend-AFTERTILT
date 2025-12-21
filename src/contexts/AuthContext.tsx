import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cinema_token');
    const userData = localStorage.getItem('cinema_user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('cinema_token');
        localStorage.removeItem('cinema_user');
      }
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role as 'USER' | 'ADMIN',
        username: response.data.username,
      };
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('cinema_token');
    if (!token) return;

    try {
      const userProfile = await fetchUserProfile(token);
      if (userProfile) {
        localStorage.setItem('cinema_user', JSON.stringify(userProfile));
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });

      const userProfile = await fetchUserProfile(loginResponse.data.token);

      if (!userProfile) {
        return {
          success: false,
          error: 'Не удалось получить данные пользователя'
        };
      }

      const userData: User = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        username: userProfile.username || email.split('@')[0]
      };

      localStorage.setItem('cinema_token', loginResponse.data.token);
      localStorage.setItem('cinema_user', JSON.stringify(userData));
      setUser(userData);

      return {
        success: true,
        user: userData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка входа'
      };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username,
        email,
        password,
      });

      const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
      });

      const userProfile = await fetchUserProfile(loginResponse.data.token);

      if (!userProfile) {
        return {
          success: false,
          error: 'Не удалось получить данные пользователя'
        };
      }

      const userData: User = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        username: userProfile.username || username
      };

      localStorage.setItem('cinema_token', loginResponse.data.token);
      localStorage.setItem('cinema_user', JSON.stringify(userData));
      setUser(userData);

      return {
        success: true,
        user: userData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка регистрации'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('cinema_token');
    localStorage.removeItem('cinema_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};