import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import StatusDashboard from '@/components/StatusDashboard'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import SignupForm from "@/components/SignupForm";
import SigninForm from '@/components/SigninForm';
import InterviewerSchedule from '@/components/interviewerSchedule';
import JoinATeam from '@/components/JoinATeam';
import CreateOrJoinTeam from './components/CreateOrJoinTeam';
import NewPasswordMade from '@/components/NewPasswordMade';
import TwoFactorAuth from '@/components/TwoFactorAuth'
import NewPassword from './components/NewPassword';
import ForgotPassword from '@/components/ForgotPassword';
import InterviewerAvailability from './components/InterviewerAvailability';
import { AuthProvider } from './contexts/AuthContext';
import AdminDashboard from './components/dashboards/AdminDashboard';
import InterviewerDashboard from './components/dashboards/InterviewerDashboard';
import CandidateDashboard from './components/dashboards/CandidateDashboard';

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Welcome />} />
					<Route path="/home" element={<Home />} />
					<Route path="/status" element={<StatusDashboard />} />
					<Route path="/signup" element={<SignupForm />} />
					<Route path="/signin" element={<SigninForm />} />
					<Route path="/interviewer-schedule" element={<InterviewerSchedule />} />
					<Route path="/joinateam" element={<JoinATeam />} />
					<Route path="/create-or-join-team" element={<CreateOrJoinTeam />} />
					<Route path="/new-password-made" element={<NewPasswordMade />} />
					<Route path="/2fa" element={<TwoFactorAuth />} />
					<Route path="/new-password" element={<NewPassword />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />
					<Route path="/interviewer-availability" element={<InterviewerAvailability />} />
					
					{/* Role-Based Dashboards */}
					<Route path="/admin/dashboard" element={<AdminDashboard />} />
					<Route path="/interviewer/dashboard" element={<InterviewerDashboard />} />
					<Route path="/candidate/dashboard" element={<CandidateDashboard />} />
					
					{/* Catch-all - must be last */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
