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
	const currentDate = new Date().getDate(); // get current date

	// Function to extract day number from date string
	const getDayFromDate = (dateString: string): number => {
		const match = dateString.match(/(\d+)/);
		return match ? parseInt(match[1]) : 0;
	};

	// list containing the upcoming interviews, uses the CalendarCard componenet to allow for dynamically added interviews
	// add an object to this list an it will appear as a new interview
	const interviews = [
		{
			id: 1,
			role: "Frontend Developer",
			interviewer: "Interviewer #2",
			date: "Thursday, Oct 9, 2:00 PM",
		},
		{
			id: 2,
			role: "Backend Developer",
			interviewer: "Interviewer #3",
			date: " Thursday, Oct 9, 4:00 PM",
		},
		{
			id: 3,
			role: "Full Stack Developer",
			interviewer: "Interviewer #1",
			date: "Saturday, Oct 10, 3:30 PM",
		},
		{
			id: 4,
			role: "Full Stack Developer",
			interviewer: "Interviewer #2",
			date: "Monday, Oct 20, 3:30 PM",
		},
		{
			id: 5,
			role: "Full Stack Developer",
			interviewer: "Interviewer #4",
			date: "monday, Oct 11, 3:30 PM",
		},
	];

	// TODO: create a system that will schedule interviews and connect it to this list

	// Function to categorize interviews based on current date
	const categorizeInterviews = (interviewsList: typeof interviews) => {
		// create a list with all interviews happening today
		const todayInterviews = interviewsList.filter((interview) => {
			const interviewDay = getDayFromDate(interview.date);
			return interviewDay === currentDate;
		});

		// create a list with all interviews happening this week
		const thisWeekInterviews = interviewsList.filter((interview) => {
			const interviewDay = getDayFromDate(interview.date);
			return interviewDay >= currentDate && interviewDay <= currentDate + 6;
		});

		// create a list with all interviews happening in the next 7 days
		const next7DaysInterviews = interviewsList.filter((interview) => {
			const interviewDay = getDayFromDate(interview.date);
			return interviewDay >= currentDate && interviewDay <= currentDate + 7;
		});

		// return these three in a json format - will become stats
		return {
			today: todayInterviews.length,
			thisWeek: thisWeekInterviews.length,
			next7Days: next7DaysInterviews.length,
		};
	};

	const stats = categorizeInterviews(interviews);

	const calendarStats = [
		{ title: "Today's Interviews", count: stats.today },
		{ title: "This week's interviews", count: stats.thisWeek },
		{ title: "Next 7 days", count: stats.next7Days },
	];

	return (
		<div className="flex h-screen pt-20">
			<DashboardSidebar activePage={activePage} onPageChange={setActivePage} />

			{/* Main Content Area */}
			<main className="flex-1 p-8 overflow-auto">
				<DashboardHeader />
				{activePage === "dashboard" ? (
					<>
						<CalendarStats stats={calendarStats} />
						<InterviewScheduleSection
							interviews={interviews}
							getDayFromDate={getDayFromDate}
							currentDate={currentDate}
						/>
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
