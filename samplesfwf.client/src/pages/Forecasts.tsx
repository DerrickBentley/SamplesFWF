import React, { useEffect, useState } from 'react';
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
import type { PaginatedForecasts, Forecast } from '../api/weather';

export default function Forecasts() {
  const [items, setItems] = useState<Forecast[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); // Added missing state setter
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
      // Move to first page when the effective search term changes
      setPage(0);
    }, 350); // 350ms debounce delay

    return () => {
      clearTimeout(handle);
    };
  }, [query]);

  // Fetch whenever page, rowsPerPage or debouncedQuery changes.
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const data: PaginatedForecasts = await getForecasts(page, rowsPerPage, debouncedQuery);
        if (mounted) {
          setItems(data.items);
          setTotalCount(data.totalCount);
        }
      } catch {
        if (mounted) {
          setItems([]);
          setTotalCount(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page, rowsPerPage, debouncedQuery]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Typography component="p" sx={{ p: 2 }}>
        <em>
          Loading... Please refresh once the ASP.NET backend has started. See{' '}
          <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.
        </em>
      </Typography>
    );
  }

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
            {items.map((forecast) => (
              <TableRow key={forecast.date} hover>
                <TableCell component="th" scope="row">
                  {forecast.date}
                </TableCell>
                <TableCell align="right">{forecast.temperatureC}</TableCell>
                <TableCell align="right">{forecast.temperatureF}</TableCell>
                <TableCell>{forecast.summary}</TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
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
          count={totalCount}
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