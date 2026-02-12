import { User } from "lucide-react";

export default function DashboardHeader() {
	return (
		<header className="flex justify-end mb-8 bg-white p-6 rounded-lg shadow-md">
			<div className="flex items-center space-x-2 p-2 pl-5 pr-10 bg-white rounded-full shadow-sm border border-gray-200">
				<User className="h-6 w-6 text-gray-500" />
				<div className="flex flex-col text-sm">
					<span className="font-semibold text-gray-800">Name</span>
					<span className="text-gray-500">Interviewer</span>
				</div>
			</div>
		</header>
	);
}
