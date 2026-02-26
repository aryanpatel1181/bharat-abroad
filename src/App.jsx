import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Events from './pages/Events'
import SubmitEvent from './pages/SubmitEvent'
import About from './pages/About'
import Admin from './pages/Admin'
import Chatbot from './components/Chatbot'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/submit" element={<SubmitEvent />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Chatbot />
    </div>
  )
}

export default App