import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Rating,
  Fade,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  PlayArrow,
  Info,
  Star,
  AccessTime,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    genre: string;
    duration: number;
    rating?: number;
    description?: string;
    posterUrl?: string;
    ageRating?: number;
    isFeatured?: boolean;
  };
  variant?: 'default' | 'featured' | 'compact';
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, variant = 'default' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  if (variant === 'compact') {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <Box sx={{ position: 'relative', pt: '150%' }}>
          <CardMedia
            component="img"
            image={movie.posterUrl || '/api/placeholder/300/450'}
            alt={movie.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <IconButton
            onClick={handleFavoriteClick}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(15, 16, 20, 0.8)',
              color: isFavorite ? '#FF3A44' : '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255, 58, 68, 0.8)',
              },
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>

        <CardContent sx={{ flex: 1, p: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#fff',
              fontWeight: 600,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {movie.title}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#B0B3B8' }}>
              {movie.genre}
            </Typography>
            {movie.rating && (
              <Chip
                size="small"
                icon={<Star sx={{ fontSize: 14 }} />}
                label={movie.rating.toFixed(1)}
                sx={{
                  bgcolor: 'rgba(255, 58, 68, 0.2)',
                  color: '#FF6B73',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5)',
          '& .movie-overlay': {
            opacity: 1,
          },
          '& .movie-poster': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* Постер */}
      <Box sx={{ position: 'relative', pt: '140%', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={movie.posterUrl || '/api/placeholder/300/450'}
          alt={movie.title}
          className="movie-poster"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
          }}
        />

        {/* Оверлей при ховере */}
        <Fade in={hovered} timeout={300}>
          <Box
            className="movie-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(15, 16, 20, 0.95) 20%, transparent 60%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 3,
              opacity: 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#B0B3B8',
                mb: 2,
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {movie.description || 'Отличный фильм для просмотра в кинотеатре'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to={`/sessions?movie=${movie.id}`}
                variant="contained"
                size="small"
                startIcon={<PlayArrow />}
                fullWidth
                sx={{
                  py: 1,
                }}
              >
                Билеты
              </Button>
              <Button
                component={RouterLink}
                to={`/movies/${movie.id}`}
                variant="outlined"
                size="small"
                startIcon={<Info />}
                fullWidth
                sx={{
                  py: 1,
                }}
              >
                Подробнее
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Избранное */}
        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(15, 16, 20, 0.8)',
            color: isFavorite ? '#FF3A44' : '#fff',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 58, 68, 0.9)',
              transform: 'scale(1.1)',
            },
          }}
        >
          {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>

        {/* Рейтинг */}
        {movie.rating && (
          <Chip
            label={movie.rating.toFixed(1)}
            icon={<Star sx={{ fontSize: 16 }} />}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'rgba(255, 58, 68, 0.9)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              height: 32,
            }}
          />
        )}

        {/* Возрастной рейтинг */}
        {movie.ageRating && (
          <Chip
            label={`${movie.ageRating}+`}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              fontWeight: 700,
              border: '2px solid #FF3A44',
            }}
          />
        )}
      </Box>

      {/* Контент карточки */}
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            mb: 1,
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {movie.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#B0B3B8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 16 }} />
            {movie.duration} мин
          </Typography>

          <Chip
            label="IMAX"
            size="small"
            sx={{
              backgroundColor: 'rgba(78, 205, 196, 0.2)',
              color: '#7BD9D2',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Жанры */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {movie.genre.split(',').map((g, index) => (
            <Chip
              key={index}
              label={g.trim()}
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#B0B3B8',
                fontSize: '0.75rem',
              }}
            />
          ))}
        </Box>

        {/* Рейтинг звездами */}
        {movie.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={movie.rating / 2}
              precision={0.5}
              readOnly
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#FFD700',
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#B0B3B8' }}>
              {movie.rating.toFixed(1)}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Футер карточки */}
      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          component={RouterLink}
          to={`/sessions?movie=${movie.id}`}
          variant="contained"
          fullWidth
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #FF3A44 0%, #FF6B73 100%)',
            fontWeight: 700,
          }}
        >
          Купить билет
        </Button>
      </CardActions>
    </Card>
  );
};

export default MovieCard;