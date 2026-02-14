import { useState, useEffect, useContext } from "react";
import { User } from "lucide-react";
import { AuthContext } from "@/features/auth/services/AuthContext";
import { authenticatedFetch } from "@/features/auth/utils/authClient";

interface Meeting {
	_id: string;
	title: string;
	startTime: string;
	endTime: string;
	interviewerIds: Array<{ _id: string; name: string; email: string }>;
	candidateId: string;
	status: string;
}

interface InterviewDisplay {
	id: string;
	role: string;
	interviewer: string;
	date: string;
	startTime: Date;
}

export default function InterviewScheduleSection() {
	const auth = useContext(AuthContext);
	const user = auth?.user;

	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("This week");
	const tabs = ["Today", "Tomorrow", "This week", "Next week"];

	useEffect(() => {
		const fetchMeetings = async () => {
			if (!user?.id) return;

			try {
				setIsLoading(true);
				const response = await authenticatedFetch(`/meetings/user/${user.id}`);

				if (!response.ok) {
					throw new Error("Failed to fetch meetings");
				}

				const data = await response.json();
				setMeetings(data.data || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load meetings");
			} finally {
				setIsLoading(false);
			}
		};

		fetchMeetings();
	}, [user?.id]);

	// Format date for display: "Thursday, Oct 9, 2:00 PM"
	const formatDisplayDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	// Transform meetings to interview display format
	const transformMeetings = (meetingsList: Meeting[]): InterviewDisplay[] => {
		return meetingsList.map((meeting) => ({
			id: meeting._id,
			role: meeting.title || "Interview",
			interviewer: meeting.interviewerIds.map((i) => i.name).join(", ") || "TBD",
			date: formatDisplayDate(meeting.startTime),
			startTime: new Date(meeting.startTime),
		}));
	};

	const interviews = transformMeetings(meetings);

	// Filter interviews based on active tab
	const getFilteredInterviews = (): InterviewDisplay[] => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const endOfWeek = new Date(today);
		endOfWeek.setDate(today.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);
		const endOfNextWeek = new Date(today);
		endOfNextWeek.setDate(today.getDate() + 13);
		endOfNextWeek.setHours(23, 59, 59, 999);

		switch (activeTab) {
			case "Today":
				return interviews.filter((interview) => {
					const interviewDate = new Date(interview.startTime);
					return interviewDate >= today && interviewDate < tomorrow;
				});

			case "Tomorrow":
				return interviews.filter((interview) => {
					const interviewDate = new Date(interview.startTime);
					const endOfTomorrow = new Date(tomorrow);
					endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
					return interviewDate >= tomorrow && interviewDate < endOfTomorrow;
				});

			case "This week":
				return interviews.filter((interview) => {
					const interviewDate = new Date(interview.startTime);
					return interviewDate >= today && interviewDate <= endOfWeek;
				});

			case "Next week":
				return interviews.filter((interview) => {
					const interviewDate = new Date(interview.startTime);
					return interviewDate > endOfWeek && interviewDate <= endOfNextWeek;
				});

			default:
				return interviews;
		}
	};

	const filteredInterviews = getFilteredInterviews();

	if (isLoading) {
		return (
			<section className="bg-white p-6 rounded-lg shadow-md">
				<div className="animate-pulse">
					<div className="h-6 w-48 bg-gray-200 rounded mb-4" />
					<div className="flex border-b border-gray-200 mb-6 space-x-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-8 w-20 bg-gray-200 rounded" />
						))}
					</div>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
								<div className="h-8 w-8 bg-gray-200 rounded-full" />
								<div className="space-y-2">
									<div className="h-4 w-48 bg-gray-200 rounded" />
									<div className="h-3 w-32 bg-gray-200 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Schedule</h2>
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-700">Failed to load interview schedule: {error}</p>
				</div>
			</section>
		);
	}

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
				{filteredInterviews.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<p>No interviews scheduled for {activeTab.toLowerCase()}</p>
					</div>
				) : (
					<div className="space-y-4">
						{filteredInterviews.map((interview) => (
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
				)}
			</div>
		</section>
	);
}
