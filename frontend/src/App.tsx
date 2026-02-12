import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import Dashboard from '@/features/dashboard/Dashboard'
import JoinATeam from '@/features/candidate/components/JoinATeam'
import CreateOrJoinTeam from '@/features/auth/CreateOrJoinTeam'
import Availability from '@/features/dashboard/components/Availability'
import { AuthProvider } from '@/provider/AuthProvider'

function App() {
	return (
		<AuthProvider>
			<Router>
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
					<Route path="/interviewer-availability" element={<Availability />} />

					{/* Dashboard */}
					<Route path="/dashboard" element={<Dashboard />} />
					
					{/* Catch-all - must be last */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
