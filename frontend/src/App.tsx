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

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/home" element={<Home />} />
				<Route path="/status" element={<StatusDashboard />} />
				<Route path="/signup" element={<SignupForm />} />
				<Route path="/signin" element={<SigninForm />} />
				<Route path="/interviewerSchedule" element={<InterviewerSchedule />} />
				<Route path="/joinateam" element={<JoinATeam />} />
				<Route path="/create-or-join-team" element={<CreateOrJoinTeam />} />
				<Route path="/new-password-made" element={<NewPasswordMade />} />
				<Route path="/2fa" element={<TwoFactorAuth />} />
				<Route path="/new-password" element={<NewPassword />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Router>
	);
}

export default App;
