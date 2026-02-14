import { User } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "@/features/auth/services/AuthContext";
import { UserRole } from "@/features/auth/types/authTypes";

export default function DashboardHeader() {
	const auth = useContext(AuthContext);
	const user = auth?.user;
	const isLoading = auth?.isLoading;

	// Get display role text
	const getRoleDisplay = (role?: UserRole) => {
		if (role === UserRole.CANDIDATE) return "Applicant";
		return role || "User";
	};

	// Show loading state
	if (isLoading || !user) {
		return (
			<header className="flex justify-end mb-8 bg-white p-6 rounded-lg shadow-md">
				<div className="flex items-center space-x-2 p-2 pl-5 pr-10 bg-white rounded-full shadow-sm border border-gray-200">
					<div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
					<div className="flex flex-col text-sm space-y-1">
						<div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
						<div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
					</div>
				</div>
			</header>
		);
	}

	return (
		<header className="flex justify-end mb-8 bg-white p-6 rounded-lg shadow-md">
			<div className="flex items-center space-x-2 p-2 pl-5 pr-10 bg-white rounded-full shadow-sm border border-gray-200">
				{user.profileImage ? (
					<img
						src={user.profileImage}
						alt={user.name}
						className="h-6 w-6 rounded-full object-cover"
					/>
				) : (
					<User className="h-6 w-6 text-gray-500" />
				)}
				<div className="flex flex-col text-sm">
					<span className="font-semibold text-gray-800">{user.name}</span>
					<span className="text-gray-500 capitalize">{getRoleDisplay(user.role)}</span>
				</div>
			</div>
		</header>
	);
}
