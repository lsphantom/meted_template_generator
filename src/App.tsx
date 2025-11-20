import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Container, AppBar, Toolbar, Typography } from '@mui/material'
import LessonBuilder from './pages/LessonBuilder'
import './App.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1f7cf6',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="absolute">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 0, textAlign: 'center', width: '100%' }}>
              COMET - MetEd Lesson Template Generator
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth={false} sx={{ mt: 12, mb: 4, px: 2 }}>
          <Routes>
            <Route path="/" element={<LessonBuilder />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  )
}

export default App
