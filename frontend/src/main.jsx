import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './config/routes.jsx'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { ChatProvider } from './context/ChatContext.jsx'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0b0f14',
      paper: '#121821'
    },
    primary: { main: '#7aa2f7' },
    secondary: { main: '#89dceb' }
  },
  shape: { borderRadius: 12 }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Toaster toastOptions={{
          style: { background: '#1a2230', color: '#e5e7eb' }
        }} />
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
        
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
