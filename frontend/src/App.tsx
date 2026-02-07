import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import StatusDashboard from '@/components/StatusDashboard'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import {
	SignupForm,
	SigninForm,
	NewPasswordMade,
	TwoFactorAuth,
	NewPassword,
	ForgotPassword,
} from '@/features/auth/components'
import AdminDashboard2 from '@/components/dashboards/AdminDashboard2'
import JoinATeam from '@/components/JoinATeam'
import CreateOrJoinTeam from '@/components/CreateOrJoinTeam'
import InterviewerAvailability from '@/components/InterviewerAvailability'
import { AuthProvider } from '@/provider/AuthProvider'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import InterviewerDashboard from '@/components/dashboards/InterviewerDashboard'
import CandidateDashboard from '@/components/dashboards/CandidateDashboard'
import AdminSettings from './components/AdminSettings'

function App() {
	return (
		<AuthProvider>
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Welcome />} />
					<Route path="/home" element={<Home />} />
					<Route path="/status" element={<StatusDashboard />} />
					<Route path="/signup" element={<SignupForm />} />
					<Route path="/signin" element={<SigninForm />} />
					<Route path="/joinateam" element={<JoinATeam />} />
					<Route path="/create-or-join-team" element={<CreateOrJoinTeam />} />
					<Route path="/new-password-made" element={<NewPasswordMade />} />
					<Route path="/2fa" element={<TwoFactorAuth />} />
					<Route path="/new-password" element={<NewPassword />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />
					<Route path="/interviewer-availability" element={<InterviewerAvailability />} />
					<Route path="/admin-settings" element={<AdminSettings />} />
					
					{/* Role-Based Dashboards - Protected */}
					<Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
					<Route path="/admin/dashboard2" element={<AdminDashboard2 />} />
					<Route path="/interviewer/dashboard" element={<ProtectedRoute><InterviewerDashboard /></ProtectedRoute>} />
					<Route path="/candidate/dashboard" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
					
					{/* Catch-all - must be last */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
