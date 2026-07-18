import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { signupAPI, loginAPI } from '../services/AuthService';
import { useChatContext } from '../context/ChatContext';

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  const { loginUser } = useChatContext()
  const navigate = useNavigate()

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    })
  }

  function validateForm() {
    if (!detail.username.trim()) {
      toast.error("Username is required")
      return false
    }
    if (!detail.password) {
      toast.error("Password is required")
      return false
    }
    if (isSignup && detail.password !== detail.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    return true
  }

  async function handleSubmit() {
    if (!validateForm()) return
    setLoading(true)
    try {
      if (isSignup) {
        const data = await signupAPI(detail.username.trim(), detail.password)
        toast.success("Account created!")
        loginUser(data.username)
      } else {
        const data = await loginAPI(detail.username.trim(), detail.password)
        toast.success("Logged in!")
        loginUser(data.username)
      }
      navigate("/rooms")
    } catch (error) {
      console.log(error);
      if (error.response?.status === 400) {
        toast.error(error.response.data)
      } else {
        toast.error(isSignup ? "Signup failed" : "Login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    // Full-viewport container with dark background from theme
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        bgcolor: 'background.default'
      }}
    >
      {/* Polished card */}
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Box
              component="img"
              src="/chat.png"
              alt="Chat illustration"
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                mx: 'auto',
                mb: 1.5,
                boxShadow: '0 2px 10px rgba(0,0,0,0.35)'
              }}
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{ textAlign: 'center', fontWeight: 700, letterSpacing: 0.2, color: 'text.primary' }}
            >
              {isSignup ? "Create an Account" : "Welcome Back"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: 'center', color: 'text.secondary', mt: 0.5 }}
            >
              {isSignup ? "Sign up to start chatting" : "Log in to join your rooms"}
            </Typography>
          </Box>

          <Divider sx={{ my: 0 }} />

          <Stack spacing={1.5}>
            <TextField
              onChange={handleFormInputChange}
              value={detail.username}
              name='username'
              id="auth-username"
              label="Username"
              variant="outlined"
              fullWidth
              size="medium"
            />
            <TextField
              onChange={handleFormInputChange}
              value={detail.password}
              name='password'
              id="auth-password"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              size="medium"
              onKeyDown={(e) => !isSignup && e.key === 'Enter' && handleSubmit()}
            />
            {isSignup && (
              <TextField
                onChange={handleFormInputChange}
                value={detail.confirmPassword}
                name='confirmPassword'
                id="auth-confirm-password"
                label="Confirm password"
                type="password"
                variant="outlined"
                fullWidth
                size="medium"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            )}
          </Stack>

          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            fullWidth
            disableElevation
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button
              variant="text"
              size="small"
              onClick={() => setIsSignup(!isSignup)}
              sx={{ textTransform: 'none', p: 0, minWidth: 0, verticalAlign: 'baseline' }}
            >
              {isSignup ? "Log in" : "Sign up"}
            </Button>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Auth
