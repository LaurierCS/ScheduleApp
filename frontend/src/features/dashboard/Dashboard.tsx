import { useState } from "react";
import {
	DashboardSidebar,
	DashboardHeader,
	CalendarStats,
	InterviewScheduleSection,
	Availability,
} from "./components";
import { AdminSettings } from "../admin/components";
import AddInterviewers from "../admin/components/AddInterviewers";
import CandidateAvailability from "../admin/components/CandidateAvailability";
import { useContext } from "react";
import { AuthContext } from "@/features/auth/services/AuthContext";
import { UserRole } from "@/features/auth/types/authTypes";

export default function Dashboard() {
	const [activePage, setActivePage] = useState<string>("dashboard");
	const auth = useContext(AuthContext);
	const isCandidate = auth?.user?.role === UserRole.CANDIDATE;

	return (
		<div className="flex flex-col h-screen">
			<DashboardHeader />
			
			{/* Content Area with Sidebar */}
			<div className="flex flex-1 overflow-hidden">
				<DashboardSidebar activePage={activePage} onPageChange={setActivePage} />

				{/* Main Content Area */}
				<main className="flex-1 p-8 overflow-auto">
					{activePage === "dashboard" ? (
						<>
							<CalendarStats />
							<InterviewScheduleSection />
						</>
					) : activePage === "admin-settings" ? (
						<AdminSettings />
					) : activePage === "availability" ? (
						<Availability />
					) : activePage === "add-interviewers" && !isCandidate ? (
						<AddInterviewers />
					) : activePage === "candidate-availability" && !isCandidate ? (
						<CandidateAvailability />
					) : null}
				</main>
			</div>
		</div>
	);
}