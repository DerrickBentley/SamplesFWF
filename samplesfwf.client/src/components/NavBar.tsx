import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useLocation, useNavigate } from 'react-router-dom';
import { ColorModeContext } from '../colorMode';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Forecasts', path: '/forecasts' },
  { label: 'About', path: '/about' },
];

export default function NavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // settings menu anchor
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<HTMLElement | null>(null);
  const settingsOpen = Boolean(settingsAnchorEl);

  const { mode, toggleColorMode } = React.useContext(ColorModeContext);

  const getTabValue = (p: string): string | false => {
    if (p === '/') return '/';
    if (p.startsWith('/forecasts')) return '/forecasts';
    if (p.startsWith('/about')) return '/about';
    return false;
  };

  const value = getTabValue(location.pathname);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string | false) => {
    if (newValue) navigate(newValue);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value as 'light' | 'dark';
    if (selected !== mode) {
      toggleColorMode();
    }
    setSettingsAnchorEl(null);
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="div" sx={{ textDecoration: 'none', color: 'inherit' }}>
              SamplesFWF
            </Typography>

            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  edge="start"
                  aria-label="open navigation"
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>

                <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                  <Box sx={{ width: 260 }} role="presentation" onKeyDown={() => setDrawerOpen(false)}>
                    <List>
                      {navItems.map((item) => (
                        <ListItemButton
                          key={item.path}
                          selected={location.pathname.startsWith(item.path)}
                          onClick={() => handleNavClick(item.path)}
                        >
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      ))}
                    </List>
                    <Divider />
                  </Box>
                </Drawer>
              </>
            ) : (
              <Tabs
                value={value}
                onChange={handleTabChange}
                textColor="inherit"
                indicatorColor="secondary"
                aria-label="main navigation"
                sx={{ marginLeft: 2 }}
              >
                {navItems.map((item) => (
                  <Tab key={item.path} label={item.label} value={item.path} />
                ))}
              </Tabs>
            )}
          </Box>

          {/* settings: pushed to the far right */}
          <Box sx={{ ml: 'auto' }}>
            <IconButton
              color="inherit"
              aria-label="open settings"
              onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
            >
              <SettingsIcon />
            </IconButton>

            <Menu
              anchorEl={settingsAnchorEl}
              open={settingsOpen}
              onClose={() => setSettingsAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disableGutters>
                <Box sx={{ px: 2, py: 1 }}>
                  <FormControl component="fieldset">
                    <RadioGroup
                      aria-label="theme"
                      name="theme"
                      value={mode}
                      onChange={handleThemeChange}
                    >
                      <FormControlLabel
                        value="light"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LightModeIcon fontSize="small" />
                            <span>Light</span>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="dark"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DarkModeIcon fontSize="small" />
                            <span>Dark</span>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}