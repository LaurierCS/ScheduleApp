import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardPath } from "@/utils/navigation";

export default function EmailVerificationSuccess() {
	const navigate = useNavigate();
	const [dashboardPath, setDashboardPath] = useState<string>("");

	// Get the user role from sessionStorage and determine dashboard path
	useEffect(() => {
		const userRole = sessionStorage.getItem('signupUserRole');
		console.log('📋 EmailVerificationSuccess - signupUserRole from sessionStorage:', userRole);
		
		if (userRole) {
			const path = getDashboardPath(userRole as any);
			console.log('✅ Dashboard path determined:', path);
			setDashboardPath(path);
			// Clean up sessionStorage - do this AFTER setting dashboard path
			sessionStorage.removeItem('signupUserRole');
		} else {
			console.error('❌ No signupUserRole found in sessionStorage!');
			console.log('Available sessionStorage keys:', Object.keys(sessionStorage));
			// If no role, redirect back to signup
			setTimeout(() => {
				navigate("/signup");
			}, 500);
		}
	}, [navigate]);

	// Handle redirect to dashboard
	const handleContinue = () => {
		if (dashboardPath) {
			console.log('🚀 Navigating to dashboard:', dashboardPath);
			navigate(dashboardPath);
		} else {
			console.error('❌ No dashboard path available');
		}
	};

	return (
		<>
			<style>{`
				@keyframes bounce-gentle {
					0%, 20%, 50%, 80%, 100% {
						transform: translateY(0) scale(1);
					}
					10% {
						transform: translateY(-8px) scale(1.02);
					}
					40% {
						transform: translateY(-4px) scale(1.01);
					}
					60% {
						transform: translateY(-2px) scale(1.005);
					}
				}
				
				.animate-bounce-gentle {
					animation: bounce-gentle 2s ease-in-out infinite;
				}
			`}</style>
			
			<div className="flex flex-col items-center justify-center min-h-screen pt-20">
				<div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
					{/* Main header */}
					<div className="text-center mb-6">
						<h3 className="text-3xl font-medium">Success!</h3>
					</div>

					{/* Text */}
					<div className="text-center mb-8">
						<p className="text-gray-600 text-base">
							Your email has been verified successfully.
						</p>
					</div>

					{/* Success icon/image */}
					<div className="mb-12 flex justify-center">
						<img 
							src="/frat_boi_dug.svg" 
							alt="Success illustration" 
							className="w-48 h-48 object-contain animate-bounce-gentle"
						/>
					</div>

					{/* Continue button */}
					<Button
						onClick={handleContinue}
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base bg-black text-white"
						disabled={!dashboardPath}
					>
						{!dashboardPath ? 'Loading...' : 'Continue to Dashboard'}
					</Button>
				</div>
			</div>
		</>
	);
}
