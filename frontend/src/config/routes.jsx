import React from 'react'
import { Route, Routes } from 'react-router-dom'
import App from '../App.jsx'
import ChatPage from '../components/ChatPage.jsx'
const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/chat' element={<ChatPage/>} />
             <Route path='/about' element={<h1>This is about page</h1>} />
              <Route path='*' element={<h1>page not found</h1>} />
        </Routes>
    )
}

export default AppRoutes