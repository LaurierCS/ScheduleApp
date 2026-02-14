import { useState } from "react";
import {
	DashboardSidebar,
	DashboardHeader,
	CalendarStats,
	InterviewScheduleSection,
	Availability,
} from "./components";
import { AdminSettings } from "../admin/components";

export default function Dashboard() {
	const [activePage, setActivePage] = useState<string>("dashboard");

	return (
		<div className="flex h-screen pt-20">
			<DashboardSidebar activePage={activePage} onPageChange={setActivePage} />

			{/* Main Content Area */}
			<main className="flex-1 p-8 overflow-auto">
				<DashboardHeader />
				{activePage === "dashboard" ? (
					<>
						<CalendarStats />
						<InterviewScheduleSection />
					</>
				) : activePage === "admin-settings" ? (
					<AdminSettings />
				) : activePage === "availability" ? (
					<Availability />
				) : null}
			</main>
		</div>
	);
}
