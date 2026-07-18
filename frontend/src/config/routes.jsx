import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Auth from '../components/Auth.jsx'
import JoinCreateRoom from '../components/JoinCreateRoom.jsx'
import ChatPage from '../components/ChatPage.jsx'
import { useChatContext } from '../context/ChatContext.jsx'

const AppRoutes = () => {
    const { user } = useChatContext()
    return (
        <Routes>
            <Route path='/' element={user ? <Navigate to='/rooms' replace /> : <Auth />} />
            <Route path='/rooms' element={user ? <JoinCreateRoom /> : <Navigate to='/' replace />} />
            <Route path='/chat' element={<ChatPage />} />
            <Route path='/about' element={<h1>This is about page</h1>} />
            <Route path='*' element={<h1>page not found</h1>} />
        </Routes>
    )
}

export default AppRoutes
