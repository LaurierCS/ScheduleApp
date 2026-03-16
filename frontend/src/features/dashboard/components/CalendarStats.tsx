import { useContext, useEffect, useState } from "react";
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

interface CalendarStat {
	title: string;
	count: number;
}

export default function CalendarStats() {
	const auth = useContext(AuthContext);
	const user = auth?.user;

	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchMeetings = async () => {
			if (!user?.id) return;

			try {
				setIsLoading(true);
				const endpoint = `/meetings/user/${user.id}`;
				const response = await authenticatedFetch(endpoint);

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

	// Calculate stats based on meetings
	const calculateStats = (): CalendarStat[] => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const endOfToday = new Date(today);
		endOfToday.setHours(23, 59, 59, 999);

		const endOfWeek = new Date(today);
		endOfWeek.setDate(today.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		const endOfNextWeek = new Date(today);
		endOfNextWeek.setDate(today.getDate() + 13);
		endOfNextWeek.setHours(23, 59, 59, 999);

		const todayCount = meetings.filter((m) => {
			const meetingDate = new Date(m.startTime);
			return meetingDate >= today && meetingDate <= endOfToday;
		}).length;

		const thisWeekCount = meetings.filter((m) => {
			const meetingDate = new Date(m.startTime);
			return meetingDate >= today && meetingDate <= endOfWeek;
		}).length;

		const nextWeekCount = meetings.filter((m) => {
			const meetingDate = new Date(m.startTime);
			return meetingDate > endOfWeek && meetingDate <= endOfNextWeek;
		}).length;

		return [
			{ title: "Today's Interviews", count: todayCount },
			{ title: "This week's interviews", count: thisWeekCount },
			{ title: "Next 7 days", count: nextWeekCount },
		];
	};

	const stats = calculateStats();

	if (isLoading) {
		return (
			<section className="mb-10 bg-white p-6 rounded-lg shadow-md">
				<div className="animate-pulse">
					<div className="h-8 w-64 bg-gray-200 rounded mb-4" />
					<div className="h-6 w-48 bg-gray-200 rounded mb-4" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div key={i} className="border border-gray-200 rounded-lg p-4">
								<div className="h-4 w-24 bg-gray-200 rounded mb-1" />
								<div className="h-8 w-12 bg-gray-200 rounded" />
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="mb-10 bg-white p-6 rounded-lg shadow-md">
				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Welcome back, {user?.name || "User"}!
				</h1>
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-700">Failed to load calendar stats: {error}</p>
				</div>
			</section>
		);
	}

	return (
		<section className="mb-10 bg-white p-6 rounded-lg shadow-md">
			<h1 className="text-3xl font-bold text-gray-900 mb-4">
				Welcome back, {user?.name || "User"}!
			</h1>
			<h2 className="text-xl font-semibold text-gray-800 mb-4">
				Your calendar at a glance
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{stats.map((stat, index) => (
					<div key={index} className="border border-gray-200 rounded-lg p-4 text-left">
						<p className="text-gray-600 text-sm mb-1">{stat.title}</p>
						<p className="text-3xl font-bold text-gray-900">{stat.count}</p>
					</div>
				))}
			</div>
		</section>
	);
}
