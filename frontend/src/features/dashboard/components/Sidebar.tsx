import { CalendarDays, LayoutDashboard, Users, Settings, Plus } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "@/features/auth/services/AuthContext";
import { UserRole } from "@/features/auth/types/authTypes";

interface DashboardSidebarProps {
	activePage?: string;
	onPageChange?: (page: string) => void;
}

export default function DashboardSidebar({ activePage = "dashboard", onPageChange }: DashboardSidebarProps) {
	const auth = useContext(AuthContext);
	const user = auth?.user;

	// Check if user is a candidate
	const isCandidate = user?.role === UserRole.CANDIDATE;

	const handleAdminSettingsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		onPageChange?.("admin-settings");
	};

	const handleAvailabilityClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		onPageChange?.("availability");
	};

	return (
		<aside className="w-64 bg-white p-6 shadow-md flex flex-col">
			<div className="mb-10 text-2xl font-bold text-gray-800">LOGO</div>
			<nav className="space-y-4">
				<button
					onClick={handleAvailabilityClick}
					className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
						activePage === "availability"
							? "bg-blue-100 text-blue-700 font-semibold"
							: "text-gray-600 hover:bg-gray-200"
					}`}
				>
					<CalendarDays size={20} />
					<span>Availability</span>
				</button>
				<button
					onClick={() => onPageChange?.("dashboard")}
					className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
						activePage === "dashboard"
							? "bg-blue-100 text-blue-700 font-semibold"
							: "text-gray-600 hover:bg-gray-200"
					}`}
				>
					<LayoutDashboard size={20} />
					<span>Dashboard</span>
				</button>

				{/* Non-candidate only navigation items */}
				{!isCandidate && (
					<>
						<a
							href="#"
							className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-200"
						>
							<Users size={20} />
							<span>Team Availability</span>
						</a>
						<a
							href="#"
							className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-200"
						>
							<Users size={20} />
							<span>Candidate Availability</span>
						</a>
						<button
							onClick={handleAdminSettingsClick}
							className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
								activePage === "admin-settings"
									? "bg-blue-100 text-blue-700 font-semibold"
									: "text-gray-600 hover:bg-gray-200"
							}`}
						>
							<Settings size={20} />
							<span>Admin Settings</span>
						</button>

						{/* Schedule Interviews Button */}
						<button className="mt-auto flex items-center justify-center space-x-2 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors">
							<Plus size={20} className="text-white" />
							<span>Schedule Interviews</span>
						</button>
					</>
				)}
			</nav>
		</aside>
	);
}
