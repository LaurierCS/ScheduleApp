import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/ui/Navbar'
import ProtectedRoute from '@/ui/ProtectedRoute'
import StatusDashboard from '@/ui/StatusDashboard'
import Welcome from '@/ui/Welcome'
import {
	SignupForm,
	SigninForm,
	NewPasswordMade,
	TwoFactorAuth,
	NewPassword,
	ForgotPassword,
} from '@/features/auth/components'
import AdminDashboard2 from '@/features/admin/AdminDashboard'
import JoinATeam from '@/features/candidate/JoinATeam'
import CreateOrJoinTeam from '@/features/auth/CreateOrJoinTeam'
import InterviewerAvailability from '@/features/interviewer/InterviewerAvailability'
import { AuthProvider } from '@/provider/AuthProvider'
import InterviewerDashboard from '@/features/dashboard/InterviewerDashboard'
import CandidateDashboard from '@/features/candidate/CandidateDashboard'
import AdminSettings from './features/admin/AdminSettings'

function App() {
	return (
		<AuthProvider>
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Welcome />} />
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
					<Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard2 /></ProtectedRoute>} />
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
