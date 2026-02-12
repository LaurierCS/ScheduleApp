import { useState } from "react";
import { User } from "lucide-react";

interface Interview {
	id: number;
	role: string;
	interviewer: string;
	date: string;
}

interface InterviewScheduleSectionProps {
	interviews: Interview[];
	getDayFromDate: (dateString: string) => number;
	currentDate: number;
}

export default function InterviewScheduleSection({
	interviews,
	getDayFromDate,
	currentDate,
}: InterviewScheduleSectionProps) {
	const [activeTab, setActiveTab] = useState("This week");
	const tabs = ["Today", "Tomorrow", "This week", "Next week"];

	const getFilteredInterviews = (interviewsList: Interview[]) => {
		switch (activeTab) {
			case "Today":
				return interviewsList.filter((interview) => {
					const interviewDay = getDayFromDate(interview.date);
					return interviewDay === currentDate;
				});

			case "Tomorrow":
				return interviewsList.filter((interview) => {
					const interviewDay = getDayFromDate(interview.date);
					return interviewDay === currentDate + 1;
				});

			case "This week":
				return interviewsList.filter((interview) => {
					const interviewDay = getDayFromDate(interview.date);
					return interviewDay >= currentDate && interviewDay <= currentDate + 6;
				});

			case "Next week":
				return interviewsList.filter((interview) => {
					const interviewDay = getDayFromDate(interview.date);
					return interviewDay >= currentDate + 7 && interviewDay <= currentDate + 13;
				});

			default:
				return interviewsList;
		}
	};

	return (
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
					{getFilteredInterviews(interviews).map((interview) => (
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
	);
}
