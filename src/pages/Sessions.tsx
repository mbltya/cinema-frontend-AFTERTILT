import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Paper from "@mui/material/Paper";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface Session {
  id: number;
  movieId: number;
  movieTitle: string;
  hallId: number;
  hallName: string;
  cinemaId?: number;
  cinemaName?: string;
  startTime: string;
  endTime?: string;
  price: number;
  format: string;
  availableSeats?: number;
}

interface Movie {
  id: number;
  title: string;
}

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("movie");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>(movieId || "");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loadingMovies, setLoadingMovies] = useState<boolean>(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [selectedMovie, selectedDate]);

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      const response = await axios.get("http://localhost:8080/api/movies");
      setMovies(response.data);
    } catch (err: any) {
      console.error("Ошибка загрузки фильмов:", err);
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      let url = "http://localhost:8080/api/sessions";
      const params = new URLSearchParams();

      if (selectedMovie) {
        params.append("movie", selectedMovie);
      }
      if (selectedDate) {
        params.append("date", selectedDate);
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url);
      console.log("Ответ от API сеансов:", response.data);

      let sessionsArray: Session[] = [];

      if (response.data && Array.isArray(response.data)) {
        sessionsArray = response.data;
      } else if (response.data && response.data.sessions) {
        sessionsArray = response.data.sessions;
      }

      setSessions(sessionsArray);

    } catch (err: any) {
      console.error("Ошибка при загрузке сеансов:", err);
      setError("Не удалось загрузить сеансы");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleString("ru-RU", {
        weekday: "short",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Дата не указана";
    }
  };

  const getMovieTitle = (movieId: number) => {
    const movie = movies.find(m => m.id === movieId);
    return movie?.title || "Фильм";
  };

  if (loading && loadingMovies) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {movieId ? `Сеансы фильма: ${getMovieTitle(Number(movieId))}` : "Расписание сеансов"}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Выберите удобное время и место для просмотра фильма
        </Typography>
      </Box>

      {/* Фильтры */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>Фильтры</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Фильм</InputLabel>
            <Select
              value={selectedMovie}
              label="Фильм"
              onChange={(e) => setSelectedMovie(e.target.value)}
              disabled={loadingMovies}
            >
              <MenuItem value="">Все фильмы</MenuItem>
              {movies.map((movie) => (
                <MenuItem key={movie.id} value={movie.id.toString()}>
                  {movie.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Дата"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />

          <Button
            variant="outlined"
            onClick={() => {
              setSelectedMovie("");
              setSelectedDate("");
            }}
          >
            Сбросить фильтры
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {sessions.length === 0 ? (
        <Alert severity="info">
          {selectedMovie || selectedDate
            ? "Сеансы по вашему запросу не найдены"
            : "Сеансы отсутствуют"}
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      {session.movieTitle || getMovieTitle(session.movieId)}
                    </Typography>
                    {session.format && (
                      <Chip
                        label={session.format}
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  <Typography variant="h5" color="primary">
                    {session.price.toFixed(2)} руб.
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                    <Typography>
                      {formatDateTime(session.startTime)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocationOnIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                    <Typography>
                      {session.cinemaName || "Кинотеатр"} • {session.hallName || "Зал"}
                    </Typography>
                  </Box>

                  {session.availableSeats !== undefined && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ConfirmationNumberIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                      <Typography>
                        Свободно мест: {session.availableSeats}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="medium"
                  variant="contained"
                  onClick={() => navigate(`/booking/${session.id}`)}
                >
                  Выбрать места
                </Button>
                <Button
                  size="medium"
                  onClick={() => navigate("/movies")}
                >
                  Все фильмы
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default SessionsPage;