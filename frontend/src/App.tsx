import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import StatusDashboard from '@/components/StatusDashboard'
import Home from '@/components/Home'
<<<<<<< HEAD
import SignupForm from "@/components/SignupForm";
import SigninForm from '@/components/SigninForm';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/home" element={<Home />} />
				<Route path="/status" element={<StatusDashboard />} />
				<Route path="/signup" element={<SignupForm />} />
				<Route path="/signin" element={<SigninForm />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Router>
	);
=======
import Navbar from '@/components/Navbar'
import TwoFactorAuth from './components/TwoFactorAuth'

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
            <Route path="/twofactorauth" element={<TwoFactorAuth/>} />
          </Routes>
        </main>
      </Router>
    </div>
  )
>>>>>>> 2b04651 (issue-7)
}

export default App;
