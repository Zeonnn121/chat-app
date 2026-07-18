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

import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext'; // ✅ named import

const JoinCreateRoom = () => {
  const [detail,setDetail] = useState({
    roomId : "",
    userName: "",
  })

    const {setRoomId,setCurrentUser,setConnected} = useChatContext()
  const navigate = useNavigate()
  function handleFormInputChange(event){
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    })
  }
  function validateJoinForm() {
      if (!detail.roomId.trim()) {
        toast.error("Room ID is required")
        return false
      }
      if (!detail.userName.trim()) {
        toast.error("User name is required to join")
        return false
      }
      return true
  }

  function validateCreateForm() {
      if (!detail.roomId.trim()) {
        toast.error("Room ID is required")
        return false
      }
      return true
  }
  async function JoinChat(){
    if (!validateJoinForm()) return

    const trimmedRoomId = detail.roomId.trim()
    const trimmedUserName = detail.userName.trim()

    console.log('Joining room with:', { roomId: trimmedRoomId, userName: trimmedUserName })

    try {
      const room = await JoinChatAPI(trimmedRoomId)
      console.log('Join API response:', room)

      const resolvedRoomId = room?.roomId || trimmedRoomId
      toast.success("joined..")
      setCurrentUser(trimmedUserName)
      setRoomId(resolvedRoomId)
      setConnected(true)
      navigate("/chat", { state: { roomId: resolvedRoomId, currentUser: trimmedUserName } })
    } catch (error) {
      console.error('Join room failed:', error)
      if (error.response?.status === 400) {
        toast.error(error.response.data || 'Room not found')
      } else {
        toast.error('Unable to join room right now')
      }
    }
  }
  async function createRoom(){
    if (!validateCreateForm()) return

    const trimmedRoomId = detail.roomId.trim()
    const trimmedUserName = detail.userName.trim() || 'Guest'

    console.log('Creating room with:', { roomId: trimmedRoomId, userName: trimmedUserName })

    try {
      const response = await createRoomApi(trimmedRoomId)
      console.log('Create room response:', response)
      const resolvedRoomId = response?.roomId || trimmedRoomId
      toast.success("Room created successfully")
      setCurrentUser(trimmedUserName)
      setRoomId(resolvedRoomId)
      setConnected(true)
      navigate("/chat", { state: { roomId: resolvedRoomId, currentUser: trimmedUserName } })
    } catch (error) {
      console.error('Create room failed:', error)
      if (error.response?.status === 400) {
        toast.error("room already exists!")
      } else {
        toast.error('Unable to create room right now')
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
          
          </Box>

          <Divider sx={{ my: 0 }} />

          <Stack spacing={1.5}>
            <TextField onChange={ handleFormInputChange} value={detail.userName} name='userName'  id="user-name" label="Your name" variant="outlined" fullWidth size="medium" />
            <TextField name='roomId' onChange={handleFormInputChange}value={detail.roomId} id="room-id" label="Room ID (or new)" variant="outlined" fullWidth size="medium" />
          </Stack>

          {/* Actions: responsive horizontal on sm+, stacked on xs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>
            <Button onClick={JoinChat}variant="contained" color="secondary" fullWidth disableElevation>
              Join Room
            </Button>
            <Button variant="outlined" onClick={createRoom} color="primary" fullWidth>
              Create Room
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

export default JoinCreateRoom
