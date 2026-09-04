import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './Components/Layout'
import Home from './Pages/Home'
import ClassSchedule from './Pages/ClassSchedule'
import Rooms from './Pages/Rooms'
import Events from './Pages/Events'
import Announcements from './Pages/Announcements'
import Assignments from './Pages/Assignments'
import SignIn from './Pages/SignIn'
import SignUp from './Pages/SignUp'

// READS THE SAVED USER SESSION
function getSavedUser() {
  const savedUser = localStorage.getItem('campus-user')

  return savedUser ? JSON.parse(savedUser) : null
}

// APP ROUTES, ALL PAGES RENDER INSIDE THE SIDEBAR LAYOUT
function App() {
  const [user, setUser] = useState(getSavedUser)

  // SAVES THE SIGNED-IN USER
  function handleSignIn(nextUser) {
    localStorage.setItem('campus-user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  // CLEARS THE SIGNED-IN USER
  function handleSignOut() {
    localStorage.removeItem('campus-user')
    setUser(null)
  }

  return (
    <Routes>
      <Route path="/" element={<Layout onSignOut={handleSignOut} user={user} />}>
        <Route index element={<Home />} />
        <Route path="schedule" element={<ClassSchedule />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="events" element={<Events />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="assignments" element={<Assignments />} />
        {/* AUTH PAGES ARE FOR SIGNED-OUT VISITORS ONLY. ANYONE ALREADY
            SIGNED IN IS SENT BACK TO THE DASHBOARD. `replace` KEEPS THEM
            OUT OF HISTORY, SO BACK DOES NOT BOUNCE BETWEEN THE TWO. */}
        <Route
          path="signin"
          element={user ? <Navigate replace to="/" /> : <SignIn onSignIn={handleSignIn} />}
        />
        <Route
          path="signup"
          element={user ? <Navigate replace to="/" /> : <SignUp onSignUp={handleSignIn} />}
        />
      </Route>
    </Routes>
  )
}

export default App
