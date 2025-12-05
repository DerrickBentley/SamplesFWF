import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  TablePagination,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getForecasts } from '../api/weather';
import type { Forecast } from '../api/weather';

export default function Forecasts() {
  const [forecasts, setForecasts] = useState<Forecast[] | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getForecasts();
        if (mounted) setForecasts(data);
      } catch {
        // optional: handle or surface error state
        if (mounted) setForecasts([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!forecasts) return [];
    const q = query.trim().toLowerCase();
    if (!q) return forecasts;
    return forecasts.filter((f) =>
      f.date.toLowerCase().includes(q) ||
      f.summary.toLowerCase().includes(q) ||
      String(f.temperatureC).includes(q) ||
      String(f.temperatureF).includes(q)
    );
  }, [forecasts, query]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (forecasts === undefined) {
    return (
      <Typography component="p" sx={{ p: 2 }}>
        <em>
          Loading... Please refresh once the ASP.NET backend has started. See{' '}
          <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.
        </em>
      </Typography>
    );
  }

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" id="tableLabel" sx={{ mb: 1 }}>
        Weather forecast
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        This component demonstrates fetching data from the server.
      </Typography>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search by date, summary, or temperature..."
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          aria-label="Search forecasts"
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table aria-labelledby="tableLabel">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Temp. (C)</TableCell>
              <TableCell align="right">Temp. (F)</TableCell>
              <TableCell>Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((forecast) => (
              <TableRow key={forecast.date} hover>
                <TableCell component="th" scope="row">
                  {forecast.date}
                </TableCell>
                <TableCell align="right">{forecast.temperatureC}</TableCell>
                <TableCell align="right">{forecast.temperatureF}</TableCell>
                <TableCell>{forecast.summary}</TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
}