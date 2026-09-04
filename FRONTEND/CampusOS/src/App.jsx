import { Routes, Route } from 'react-router-dom'
import Layout from './Components/Layout'
import Home from './Pages/Home'
import ClassSchedule from './Pages/ClassSchedule'
import Rooms from './Pages/Rooms'
import Events from './Pages/Events'
import Announcements from './Pages/Announcements'
import Assignments from './Pages/Assignments'

// APP ROUTES, ALL PAGES RENDER INSIDE THE SIDEBAR LAYOUT
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="schedule" element={<ClassSchedule />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="events" element={<Events />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="assignments" element={<Assignments />} />
      </Route>
    </Routes>
  )
}

export default App
