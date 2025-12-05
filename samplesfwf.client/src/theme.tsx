import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export default function createAppTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#f50057' }
    },
    components: {
      MuiAppBar: {
        defaultProps: {
          elevation: 1
        }
      }
    }
  });
}