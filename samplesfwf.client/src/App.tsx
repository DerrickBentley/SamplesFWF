import './App.css';
import NavBar from './components/NavBar';
import { Container, Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      {/* Toolbar here acts as an invisible spacer equal to AppBar height */}
      <Toolbar />
      <Container component="main" sx={{ flex: '1 1 auto', py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}