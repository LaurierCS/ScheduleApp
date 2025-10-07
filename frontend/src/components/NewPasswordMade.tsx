import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NewPasswordMade() {
	const navigate = useNavigate();

	// login button
	const handleLogin = () => {
		navigate("/signin");
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
			
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="w-full max-w-lg p-8 flex flex-col items-center justify-center">
					{/* Main header */}
					<div className="text-center mb-6">
						<h3 className="text-3xl font-medium">Congratulations!</h3>
					</div>

					{/* text */}
					<div className="text-center mb-8">
						<p className="text-gray-600 text-base">
							Your password has been updated successfully.
						</p>
					</div>

					{/* image */}
					<div className="mb-12 flex justify-center">
						<img 
							src="/frat_boi_dug.svg" 
							alt="Success illustration" 
							className="w-48 h-48 object-contain animate-bounce-gentle"
						/>
					</div>

					{/* Login button */}
					<Button
						onClick={handleLogin}
						className="w-full rounded-full hover:bg-opacity-90 h-12 text-base bg-black text-white"
					>
						Login
					</Button>
				</div>
			</div>
		</>
	);
}