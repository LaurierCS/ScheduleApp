import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/features/auth/services/AuthContext";
import { UserRole } from "@/features/auth/types/authTypes";
import LcsLogo from "@/assets/LCS_Icon_Black_SVG.svg";

interface DashboardHeaderProps {
	onPageChange?: (page: string) => void;
}

export default function DashboardHeader({ onPageChange }: DashboardHeaderProps) {
	const auth = useContext(AuthContext);
	const user = auth?.user;
	const isLoading = auth?.isLoading;
	const navigate = useNavigate();

	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getRoleDisplay = (role?: UserRole) => {
		if (role === UserRole.CANDIDATE) return "Applicant";
		return role || "User";
	};

	const handleLogout = async () => {
		setMenuOpen(false);
		await auth?.logout();
		navigate("/signin");
	};

	const handleSettings = () => {
		setMenuOpen(false);
		onPageChange?.("admin-settings");
	};

	if (isLoading || !user) {
		return (
			<header className="flex justify-between items-center bg-white px-8 py-4 shadow-lg border-b border-gray-100">
				<img src={LcsLogo} alt="LCS Logo" className="h-8 w-auto" />
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
		<header className="flex justify-between items-center bg-white px-8 py-4 shadow-lg border-b border-gray-100">
			<img src={LcsLogo} alt="LCS Logo" className="h-12 w-auto" />

			<div className="relative" ref={menuRef}>
				<button
					onClick={() => setMenuOpen(!menuOpen)}
					className="flex items-center space-x-2 p-2 pl-5 pr-4 bg-white rounded-full shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
				>
					{user.profileImage ? (
						<img
							src={user.profileImage}
							alt={user.name}
							className="h-6 w-6 rounded-full object-cover"
						/>
					) : (
						<User className="h-6 w-6 text-gray-500" />
					)}
					<div className="flex flex-col text-sm text-left">
						<span className="font-semibold text-gray-800">{user.name}</span>
						<span className="text-gray-500 capitalize">{getRoleDisplay(user.role)}</span>
					</div>
					<ChevronDown
						size={16}
						className={`text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{menuOpen && (
					<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
						<div className="px-4 py-2 border-b border-gray-100">
							<p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
							<p className="text-xs text-gray-500 truncate">{user.email}</p>
						</div>
						{user.role !== UserRole.CANDIDATE && (
							<button
								onClick={handleSettings}
								className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
							>
								<Settings size={15} className="text-gray-400" />
								Admin Settings
							</button>
						)}
						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
						>
							<LogOut size={15} className="text-red-400" />
							Sign Out
						</button>
					</div>
				)}
			</div>
		</header>
	);
}
