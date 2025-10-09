import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import StatusDashboard from '@/components/StatusDashboard'
import Home from '@/components/Home'
import SignupForm from "@/components/SignupForm";
import SigninForm from '@/components/SigninForm';
import JoinATeam from '@/components/JoinATeam';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/home" element={<Home />} />
				<Route path="/status" element={<StatusDashboard />} />
				<Route path="/signup" element={<SignupForm />} />
				<Route path="/signin" element={<SigninForm />} />
				<Route path="/joinateam" element={<JoinATeam />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Router>
	);
}

export default App;
