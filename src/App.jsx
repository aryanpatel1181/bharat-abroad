import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Chatbot from './components/Chatbot'

function App() {
  return (
    <Routes>
      <Route path="/" element={<><Home /><Chatbot /></>} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App