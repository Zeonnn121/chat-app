import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import './JoinCreateRoom.css';
import toast from 'react-hot-toast';
import { createRoom as createRoomApi, JoinChatAPI } from '../services/RoomService';

import { useNavigate } from 'react-router';
import { useChatContext } from '../context/ChatContext'; // ✅ named import

const JoinCreateRoom = () => {
  const [detail,setDetail] = useState({
    roomId : "",
  })

  const {user, setRoomId, setCurrentUser, setConnected, logoutUser} = useChatContext()
  const navigate = useNavigate()
  function handleFormInputChange(event){
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    })
  }
  function validateForm() {
      if (!detail.roomId.trim()) {
        toast.error("Room ID is required")
        return false
      }
      return true
  }

  function handleLogout() {
    logoutUser()
    navigate("/")
  }

  async function JoinChat(){
    if (validateForm()){
      //join room
    try {  const room =
await JoinChatAPI(detail.roomId)
toast.success("joined..")
     setCurrentUser(user)
      setRoomId(room.roomId)
      setConnected(true)
    navigate("/chat")
    } catch (error){
      if (error.response?.status === 400){
        toast.error(error.response.data)
      }

     else {  console.log(error);

        console.log("room already exists")
     }
      }


}

  }
  async function createRoom(){
    if (validateForm()) {
      //create room
      console.log(detail)
      //call api to create room on backend
      try {
      const response = await createRoomApi(detail.roomId.trim())
      console.log(response)
      toast.success("Room created successfully")
      setCurrentUser(user)
      setRoomId(response.roomId)
      setConnected(true)
      navigate("/chat")
      } catch (error){
        console.log(error);
        if (error.response?.status === 400){
          toast.error("room already exists!")
        } else {
        console.log("error in creating the room")
        }
      }
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
              className="heading"
              sx={{ textAlign: 'center', fontWeight: 700, letterSpacing: 0.2, color: 'text.primary' }}
            >
              Join or Create a Room
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: 'center', color: 'text.secondary', mt: 0.5 }}
            >
              Logged in as <strong>{user}</strong>
            </Typography>
          </Box>

          <Divider sx={{ my: 0 }} />

          <Stack spacing={1.5}>
            <TextField name='roomId' onChange={handleFormInputChange} value={detail.roomId} id="room-id" label="Room ID (or new)" variant="outlined" fullWidth size="medium" />
          </Stack>

          {/* Actions: responsive horizontal on sm+, stacked on xs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>
            <Button onClick={JoinChat} variant="contained" color="secondary" fullWidth disableElevation>
              Join Room
            </Button>
            <Button variant="outlined" onClick={createRoom} color="primary" fullWidth>
              Create Room
            </Button>
          </Stack>

          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={handleLogout}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Log out
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default JoinCreateRoom
