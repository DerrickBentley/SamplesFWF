import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import type { Forecast } from '../api/weather';
import { createForecast, updateForecast } from '../api/weather';
import { normalizeServerBody } from '../utils/normalizeServerBody';
import { mapServerErrors, FieldErrors } from '../utils/serverErrorUtils';

interface ForecastEditorProps {
  open: boolean;
  initial?: Forecast | null;
  onClose: () => void;
  onSaved: (saved: Forecast) => void;
}

export default function ForecastEditor({ open, initial, onClose, onSaved }: ForecastEditorProps) {
  const [date, setDate] = useState('');
  const [temperatureC, setTemperatureC] = useState<number | ''>('');
  const [summary, setSummary] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // touched flags to control when validation messages appear
  const [touchedDate, setTouchedDate] = useState(false);
  const [touchedTemp, setTouchedTemp] = useState(false);
  const [touchedSummary, setTouchedSummary] = useState(false);

  // server / form errors keyed by field
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isEdit = Boolean(initial);

  // ref to ensure focus moves into the dialog when opened
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setDate(initial?.date ?? new Date().toISOString().slice(0, 10)); // yyyy-MM-dd
      setTemperatureC(initial?.temperatureC ?? '');
      setSummary(initial?.summary ?? '');
      setTouchedDate(false);
      setTouchedTemp(false);
      setTouchedSummary(false);
      setFieldErrors({});
      setSaving(false);

      // Blur any active element first to avoid aria-hidden focus issues
      try {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active instanceof HTMLElement)) {
          active.blur();
        }
      } catch {
        // ignore if blur isn't allowed
      }

      // Focus the date input after render; use setTimeout to ensure the input is mounted.
      setTimeout(() => {
        dateInputRef.current?.focus();
      }, 0);
    }
  }, [open, initial]);

  const temperatureF = useMemo(() => {
    if (temperatureC === '') return '';
    return String(Math.round(32 + (Number(temperatureC) / 0.5556)));
  }, [temperatureC]);

  // Client-side validation rules (mirror server)
  const validateDate = (value: string) => {
    if (!value || value.trim() === '') return { valid: false, message: 'Date is required.' };
    // Expect yyyy-MM-dd (date input will already produce this, but validate)
    const parts = value.split('-');
    if (parts.length !== 3) return { valid: false, message: 'Date must be in yyyy-MM-dd format.' };
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return { valid: false, message: 'Invalid date.' };
    return { valid: true, message: '' };
  };

  const validateTemp = (value: number | '') => {
    if (value === '' || value === null) return { valid: false, message: 'Temperature is required.' };
    if (!Number.isFinite(Number(value))) return { valid: false, message: 'Temperature must be a number.' };
    const num = Number(value);
    if (num < -150 || num > 150) return { valid: false, message: 'Temperature must be between -150 and 150.' };
    return { valid: true, message: '' };
  };

  const validateSummary = (value: string) => {
    if (!value) return { valid: true, message: '' };
    if (value.length > 500) return { valid: false, message: 'Summary must be 500 characters or less.' };
    return { valid: true, message: '' };
  };

  const dateValidation = validateDate(date);
  const tempValidation = validateTemp(temperatureC);
  const summaryValidation = validateSummary(summary);

  const formValid = dateValidation.valid && tempValidation.valid && summaryValidation.valid;

  const handleSave = async () => {
    // mark touched so client validation messages show
    setTouchedDate(true);
    setTouchedTemp(true);
    setTouchedSummary(true);
    setFieldErrors({});

    if (!formValid) return;

    setSaving(true);
    try {
      const payload: Forecast = {
        date,
        temperatureC: typeof temperatureC === 'string' ? parseInt(String(temperatureC), 10) : (temperatureC as number),
        temperatureF: Number(temperatureF) || 0,
        summary: summary ?? null
      };

      const saved = isEdit ? await updateForecast(payload) : await createForecast(payload);
      onSaved(saved);
      onClose();
    } catch (err: any) {
      // structured error { status, body } thrown by api helper OR plain Error
      const serverRaw = err?.body ?? err?.message ?? err;
      const mapped = mapServerErrors(serverRaw);

      // log for debugging
      // eslint-disable-next-line no-console
      console.error('Server validation error', err);

      setFieldErrors(mapped);

      // If no field errors, surface generic message in form (try to show meaningful text)
      if (!mapped.date && !mapped.temperatureC && !mapped.summary) {
        const body = normalizeServerBody(serverRaw);
        const fallback =
          (body && (body.detail || body.title || body.message)) ??
          (typeof body === 'string' ? body : undefined) ??
          String(err);
        setFieldErrors((prev) => ({ ...prev, form: [String(fallback)] }));
      }
    } finally {
      setSaving(false);
    }
  };

  // helper to show server or local validation message
  const firstFieldError = (field: keyof FieldErrors, localMessage: string) => {
    const key = field as 'date' | 'temperatureC' | 'summary' | 'form';
    const serverMsgs = fieldErrors[key];
    if (serverMsgs && serverMsgs.length > 0) return serverMsgs.join(' ');
    return localMessage || undefined;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Forecast' : 'New Forecast'}</DialogTitle>
      <DialogContent>
        {fieldErrors.form && fieldErrors.form.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.form.join(' ')}</Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.25 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={() => setTouchedDate(true)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={(touchedDate && !dateValidation.valid) || Boolean(fieldErrors.date)}
              helperText={touchedDate ? firstFieldError('date', dateValidation.message) : ''}
              inputRef={(el) => { dateInputRef.current = el; }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Temp (C)"
              type="number"
              value={temperatureC}
              onChange={(e) => {
                const v = e.target.value;
                setTemperatureC(v === '' ? '' : Number(v));
              }}
              onBlur={() => setTouchedTemp(true)}
              fullWidth
              error={(touchedTemp && !tempValidation.valid) || Boolean(fieldErrors.temperatureC)}
              helperText={touchedTemp ? firstFieldError('temperatureC', tempValidation.message) : ''}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Temp (F)"
              value={temperatureF}
              fullWidth
              disabled
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Summary"
              value={summary ?? ''}
              onChange={(e) => setSummary(e.target.value)}
              onBlur={() => setTouchedSummary(true)}
              fullWidth
              multiline
              minRows={2}
              error={(touchedSummary && !summaryValidation.valid) || Boolean(fieldErrors.summary)}
              helperText={touchedSummary ? firstFieldError('summary', summaryValidation.message) : ''}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={!formValid || saving} variant="contained">
          {saving ? <CircularProgress size={18} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}