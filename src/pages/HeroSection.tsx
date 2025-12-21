import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Container,
  Fade,
  Slide,
} from '@mui/material';
import { PlayArrow, Info, Star } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const features = [
    { label: '4K', value: 'Качество' },
    { label: 'IMAX', value: 'Формат' },
    { label: 'Dolby', value: 'Звук' },
    { label: '3D', value: 'Эффекты' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '90vh', md: '100vh' },
        background: `
          linear-gradient(rgba(15, 16, 20, 0.9), rgba(15, 16, 20, 0.7)),
          url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        mb: { xs: 6, md: 8 },
      }}
    >
      {/* Анимированные частицы */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 58, 68, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(78, 205, 196, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <Container maxWidth="xl">
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4
        }}>
          {/* Левая колонка */}
          <Box sx={{ flex: 1 }}>
            <Slide direction="right" in timeout={800}>
              <Box>
                {/* Бейдж */}
                <Chip
                  label="Фильм недели"
                  icon={<Star />}
                  sx={{
                    bgcolor: 'rgba(255, 58, 68, 0.2)',
                    color: '#FF6B73',
                    fontWeight: 700,
                    mb: 4,
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem',
                    '& .MuiChip-icon': {
                      color: '#FF6B73',
                    },
                  }}
                />

                {/* Заголовок */}
                <Typography
                  variant="h1"
                  sx={{
                    color: '#fff',
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.1,
                    fontWeight: 800,
                  }}
                >
                  Дюна:
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #FF3A44 0%, #FF6B73 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Часть вторая
                  </Box>
                </Typography>

                {/* Жанры и информация */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                  <Chip
                    label="Фантастика"
                    variant="outlined"
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label="Приключения"
                    variant="outlined"
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label="2ч 46м"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Описание */}
                <Typography
                  variant="body1"
                  sx={{
                    color: '#B0B3B8',
                    mb: 5,
                    lineHeight: 1.8,
                    fontSize: '1.125rem',
                  }}
                >
                  Пол Рэтти продолжает своё эпическое путешествие по планете Арракис,
                  объединяясь с Чани и фременами в войне против врагов.
                  Грандиозное продолжение культовой саги.
                </Typography>

                {/* Кнопки действий */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    component={RouterLink}
                    to="/sessions?movie=1"
                    sx={{
                      px: 5,
                      py: 1.8,
                      fontSize: '1.1rem',
                      minWidth: '200px',
                    }}
                  >
                    Купить билеты
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Info />}
                    sx={{
                      px: 5,
                      py: 1.8,
                      fontSize: '1.1rem',
                      minWidth: '200px',
                      color: '#fff',
                      borderColor: '#fff',
                    }}
                  >
                    Трейлер
                  </Button>
                </Box>
              </Box>
            </Slide>
          </Box>

          {/* Правая колонка с характеристиками */}
          <Box sx={{ flex: 1 }}>
            <Fade in timeout={1200}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    p: 4,
                    maxWidth: '400px',
                    width: '100%',
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 700 }}>
                    Технологии кино
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    mb: 3
                  }}>
                    {features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          flex: '1 0 calc(50% - 12px)',
                          minWidth: '150px',
                        }}
                      >
                        <Box
                          sx={{
                            textAlign: 'center',
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              color: '#FF3A44',
                              fontWeight: 800,
                              mb: 0.5,
                            }}
                          >
                            {feature.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#B0B3B8',
                              fontWeight: 600,
                            }}
                          >
                            {feature.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                        Рейтинг зрителей
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                          9.2/10
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;