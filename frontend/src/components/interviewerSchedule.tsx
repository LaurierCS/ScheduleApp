import { useState } from "react";
import { CalendarDays, LayoutDashboard, User } from "lucide-react";
import CalendarCard from "@/components/ui/CalendarCard";

export default function InterviewerSchedule() {
	const [activeTab, setActiveTab] = useState("This week");

	const tabs = ["Today", "Tomorrow", "This week", "Next week"];

    // TODO: add a feature that will dynamically display the interviews today, this week, next 7 days, by keeping track of current date
	const calendarStats = [
		{ title: "Today's Interviews", count: 2 },
		{ title: "This week's interviews", count: 3 },
		{ title: "Next 7 days", count: 5 }
	];

    // list containing the upcoming interviews, uses the CalendarCard componenet to allow for dynamically added interviews
    // add an object to this list an it will appear as a new interview
    // TODO: create a system that will schedule interviews and connect it to this list 
	const interviews = [
		{
			id: 1,
			role: "Frontend Developer",
			interviewer: "Interviewer #2",
			date: "Monday, Jan 15, 2:00 PM"
		},
		{
			id: 2,
			role: "Backend Developer", 
			interviewer: "Interviewer #3",
			date: "Tuesday, Jan 16, 10:00 AM"
		},
		{
			id: 3,
			role: "Full Stack Developer",
			interviewer: "Interviewer #1", 
			date: "Wednesday, Jan 17, 3:30 PM"
		},
        {
            id: 4,
            role: "Frontend Developer",
            interviewer: "Interviewer #4",
            date: "Thursday, Jan 18, 12:30 PM"
        }
	];

	return (

        // left side bar 
		<div className="flex h-screen bg-gray-100">
			<aside className="w-64 bg-white p-6 shadow-md flex flex-col">
				<div className="mb-10 text-2xl font-bold text-gray-800">LOGO</div>
				<nav className="space-y-4">
					<a
						href="#"
						className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-200"
					>
						<CalendarDays size={20} />
						<span>Availability</span>
					</a>
					<a
						href="#"
						className="flex items-center space-x-3 p-3 rounded-lg bg-blue-100 text-blue-700 font-semibold"
					>
						<LayoutDashboard size={20} />
						<span>Dashboard</span>
					</a>
				</nav>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 p-8 overflow-auto">

				{/* Header / Top Right */}
				<header className="flex justify-end mb-8 bg-white p-6 rounded-lg shadow-md">
					<div className="flex items-center space-x-2 p-2 bg-white rounded-full shadow-sm border border-gray-200">
						<User className="h-6 w-6 text-gray-500" />
						<div className="flex flex-col text-sm">
							<span className="font-semibold text-gray-800">Name</span>
							<span className="text-gray-500">Interviewer</span>
						</div>
					</div>
				</header>

				{/* Calendar at a glance */}
				<section className="mb-10 bg-white p-6 rounded-lg shadow-md">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, Name!</h1>
					<h2 className="text-xl font-semibold text-gray-800 mb-4">Your calendar at a glance</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{calendarStats.map((stat, index) => (
							<CalendarCard
								key={index}
								title={stat.title}
								count={stat.count}
							/>
						))}
					</div>
				</section>

				{/* Interview Schedule Section */}
				<section className="bg-white p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Schedule</h2>
					{/* Tabs */}
					<div className="flex border-b border-gray-200 mb-6">
						{tabs.map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`pb-2 px-4 ${
									activeTab === tab
										? "text-blue-700 font-semibold border-b-2 border-blue-700"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								{tab}
							</button>
						))}
					</div>

					{/* Interviews List */}
					<div>
						<h3 className="text-lg font-medium text-gray-700 mb-4">Interviews</h3>
						<div className="space-y-4">
							{interviews.map((interview) => (
								<div
									key={interview.id}
									className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
								>
									<User className="h-8 w-8 text-gray-400" />
									<div>
										<p className="font-medium text-gray-800">
											{interview.role} | with {interview.interviewer}
										</p>
										<p className="text-sm text-gray-500">{interview.date}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
