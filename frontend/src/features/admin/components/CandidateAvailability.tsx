import { useState } from "react";
import { Search, User, ChevronRight } from "lucide-react";
import CandidateCalendar from "./CandidateCalendar";
import { Candidate, statusConfig } from "../types/index";

const mockCandidates: Candidate[] = [
	{
		id: "1",
		name: "Aisha Patel",
		email: "aisha.patel@email.com",
		role: "Software Engineer",
		department: "Engineering",
		status: "submitted",
		availability: [
			{
				day: "Mon", date: "Jan 13",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Tue", date: "Jan 14",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Wed", date: "Jan 15",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: false },
				],
			},
			{
				day: "Thu", date: "Jan 16",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Fri", date: "Jan 17",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: false },
				],
			},
		],
	},
	{
		id: "2",
		name: "Marcus Chen",
		email: "marcus.chen@email.com",
		role: "Academic Coordinator",
		department: "Academics",
		status: "submitted",
		availability: [
			{
				day: "Mon", date: "Jan 13",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: false },
				],
			},
			{
				day: "Tue", date: "Jan 14",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Wed", date: "Jan 15",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: false },
				],
			},
			{
				day: "Thu", date: "Jan 16",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Fri", date: "Jan 17",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: true },
				],
			},
		],
	},
	{
		id: "3",
		name: "Sofia Reyes",
		email: "sofia.reyes@email.com",
		role: "Software Engineer",
		department: "Engineering",
		status: "pending",
		availability: [],
	},
	{
		id: "4",
		name: "James Okafor",
		email: "james.okafor@email.com",
		role: "Software Engineer",
		department: "Engineering",
		status: "interviewed",
		availability: [
			{
				day: "Mon", date: "Jan 13",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: false },
				],
			},
			{
				day: "Tue", date: "Jan 14",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: false },
				],
			},
			{
				day: "Wed", date: "Jan 15",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Thu", date: "Jan 16",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Fri", date: "Jan 17",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: true },
				],
			},
		],
	},
	{
		id: "5",
		name: "Priya Nair",
		email: "priya.nair@email.com",
		role: "Academic Coordinator",
		department: "Academics",
		status: "submitted",
		availability: [
			{
				day: "Mon", date: "Jan 13",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Tue", date: "Jan 14",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: false },
				],
			},
			{
				day: "Wed", date: "Jan 15",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: false },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: true },
				],
			},
			{
				day: "Thu", date: "Jan 16",
				slots: [
					{ time: "9:00 AM", available: true },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: false },
					{ time: "1:00 PM", available: false },
					{ time: "2:00 PM", available: true },
					{ time: "3:00 PM", available: false },
				],
			},
			{
				day: "Fri", date: "Jan 17",
				slots: [
					{ time: "9:00 AM", available: false },
					{ time: "10:00 AM", available: true },
					{ time: "11:00 AM", available: true },
					{ time: "1:00 PM", available: true },
					{ time: "2:00 PM", available: false },
					{ time: "3:00 PM", available: true },
				],
			},
		],
	},
];

export default function CandidateAvailability() {
	const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [viewingAvailability, setViewingAvailability] = useState(false);

	const filtered = mockCandidates.filter((c) => {
		const matchesSearch =
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.email.toLowerCase().includes(search.toLowerCase()) ||
			c.role.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = filterStatus === "all" || c.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	if (viewingAvailability && selectedCandidate) {
		return (
			<CandidateCalendar
				candidate={selectedCandidate}
				onBack={() => setViewingAvailability(false)}
			/>
		);
	}

	return (
		<div className="max-w-3xl">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Candidate Availability</h1>
				<p className="text-gray-500 text-base mt-1">
					{mockCandidates.length} candidates total
				</p>
			</div>

			{/* Search */}
			<div className="relative mb-4">
				<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Search candidates..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
				/>
			</div>

			{/* Filter Tabs */}
			<div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
				{["all", "submitted", "pending", "interviewed"].map((status) => (
					<button
						key={status}
						onClick={() => setFilterStatus(status)}
						className={`flex-1 py-2.5 text-sm font-medium rounded-md capitalize transition-colors ${
							filterStatus === status
								? "bg-white text-gray-900 shadow-sm"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						{status}
					</button>
				))}
			</div>

			{/* Candidate Cards */}
			<div className="flex flex-col gap-3">
				{filtered.map((candidate) => (
					<button
						key={candidate.id}
						onClick={() => {
							setSelectedCandidate(candidate);
							setViewingAvailability(true);
						}}
						className="w-full text-left p-3 rounded-xl border transition-all bg-white border-gray-200 text-gray-900 hover:border-gray-300 hover:shadow-sm"
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
								<User size={20} className="text-gray-500" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-semibold text-base truncate">{candidate.name}</p>
								<p className="text-sm truncate mt-0.5 text-gray-500">
									{candidate.role} · {candidate.department}
								</p>
								<p className="text-sm truncate text-gray-400">
									{candidate.email}
								</p>
							</div>
							<div className="flex items-center gap-3 flex-shrink-0">
								<span className="text-sm text-gray-400">
									{candidate.availability.length > 0
										? `${candidate.availability.reduce((acc, d) => acc + d.slots.filter((s) => s.available).length, 0)} open slots`
										: "No availability yet"}
								</span>
								<span className={`text-sm px-3 py-1.5 rounded-full font-medium ${statusConfig[candidate.status].color}`}>
									{statusConfig[candidate.status].label}
								</span>
								<ChevronRight size={18} className="text-gray-400" />
							</div>
						</div>
					</button>
				))}

				{filtered.length === 0 && (
					<div className="text-center py-12 text-gray-400 text-base">
						No candidates found
					</div>
				)}
			</div>
		</div>
	);
}