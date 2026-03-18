import {
	LayoutDashboard,
	Users,
	Settings,
	CalendarDays,
	Plus,
	UserPlus,
} from "lucide-react";

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

	const isAdmin = user?.role === UserRole.ADMIN;

	const navBtn = (page: string, icon: React.ReactNode, label: string) => (
		<button
			onClick={() => onPageChange?.(page)}
			className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
				activePage === page
					? "bg-blue-100 text-blue-700 font-semibold"
					: "text-gray-600 hover:bg-gray-200"
			}`}
		>
			{icon}
			<span>{label}</span>
		</button>
	);

	return (
		<aside className="w-64 bg-white p-6 shadow-md flex flex-col overflow-y-auto">
			<nav className="space-y-1 flex-1">
				{navBtn("dashboard", <LayoutDashboard size={20} />, "Dashboard")}
				{navBtn("availability", <CalendarDays size={20} />, "Manage Availability")}

				{isAdmin && (
					<>
						{navBtn("create-team", <Plus size={20} />, "Create Team")}
						{navBtn("add-team-members", <Users size={20} />, "Team Management")}
						{navBtn("admin-settings", <Settings size={20} />, "Settings")}
						<button
						onClick={() => onPageChange?.("schedule-interviews")}
						className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors font-medium ${
							activePage === "schedule-interviews"
								? "bg-gray-800 text-white"
								: "bg-black text-white hover:bg-gray-800"
						}`}
					>
						<UserPlus size={20} />
						<span>Schedule Interviews</span>
					</button>
					</>
				)}
			</nav>
		</aside>
	);
}
