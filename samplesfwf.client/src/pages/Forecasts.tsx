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
  Typography,
  Button,
  IconButton,
  Stack,
  LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getForecasts } from '../api/weather';
import type { PaginatedForecasts, Forecast } from '../api/weather';
import ForecastEditor from '../components/ForecastEditor';

export default function Forecasts() {
  const [items, setItems] = useState<Forecast[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInitial, setEditorInitial] = useState<Forecast | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
      // Move to first page when the effective search term changes
      setPage(0);
    }, 350);

    return () => {
      clearTimeout(handle);
    };
  }, [query]);

  const fetchPage = async (p = page, pageSize = rowsPerPage, q = debouncedQuery) => {
    setLoading(true);
    try {
      const data: PaginatedForecasts = await getForecasts(p, pageSize, q);
      setItems(data.items);
      setTotalCount(data.totalCount);
    } catch {
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchPage();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedQuery]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openNew = () => {
    setEditorInitial(null);
    setEditorOpen(true);
  };

  const openEdit = (f: Forecast) => {
    setEditorInitial(f);
    setEditorOpen(true);
  };

  const handleSaved = async (_saved: Forecast) => {
    // after save, re-fetch the first page to show created/updated item
    await fetchPage(0, rowsPerPage, debouncedQuery);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" id="tableLabel">
            Weather forecast
          </Typography>
        </Stack>

        <Button startIcon={<AddIcon />} variant="contained" onClick={openNew}>
          New
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mb: 2 }}>
        This component demonstrates fetching data from the server.
      </Typography>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
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

        {/* Keep the search input in the DOM while fetching so focus is preserved.
            Show a subtle loading indicator rather than unmounting the page. */}
        {loading && <LinearProgress sx={{ mt: 1 }} />}
      </Paper>

      <TableContainer component={Paper}>
        <Table aria-labelledby="tableLabel">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Temp. (C)</TableCell>
              <TableCell align="right">Temp. (F)</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell align="center">Actions</TableCell>
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
                <TableCell align="center">
                  <IconButton size="small" onClick={() => openEdit(forecast)} aria-label="Edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {loading ? 'Loading...' : 'No results'}
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

      <ForecastEditor
        open={editorOpen}
        initial={editorInitial ?? undefined}
        onClose={() => setEditorOpen(false)}
        onSaved={handleSaved}
      />
    </Box>
  );
}