import { useState } from "react";
import {
	DashboardSidebar,
	DashboardHeader,
	CalendarStats,
	InterviewScheduleSection,
	Availability,
} from "./components";
import {
	AdminSettings,
	AddTeamMembers,
} from "../admin/components";

export default function Dashboard() {
	const [activePage, setActivePage] = useState<string>("dashboard");

	const renderPage = () => {
		switch (activePage) {
			case "dashboard":
				return (
					<>
						<CalendarStats />
						<InterviewScheduleSection />
					</>
				);
			case "availability":
				return <Availability />;
			case "admin-settings":
				return <AdminSettings />;
			case "add-team-members":
				return <AddTeamMembers />;
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col h-screen">
			<DashboardHeader onPageChange={setActivePage} />

			<div className="flex flex-1 overflow-hidden">
				<DashboardSidebar activePage={activePage} onPageChange={setActivePage} />

				<main className="flex-1 p-8 overflow-auto bg-gray-50">
					{renderPage()}
				</main>
			</div>
		</div>
	);
}
