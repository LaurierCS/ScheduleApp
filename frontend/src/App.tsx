import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import StatusDashboard from '@/components/StatusDashboard'
import Home from '@/components/Home'
import Navbar from '@/components/Navbar'

function App() {
  return (
    <div className="min-h-screen dark bg-background text-foreground">
      <Router>
        <Navbar />
        <main className="pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/status" element={<StatusDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </div>
  )
}

export default App
