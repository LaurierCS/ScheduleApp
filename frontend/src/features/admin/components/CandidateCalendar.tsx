import { ArrowLeft, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { Candidate, statusConfig } from "../types/index";

interface CandidateDetailProps {
	candidate: Candidate;
	onBack: () => void;
}

export default function CandidateDetail({ candidate, onBack }: CandidateDetailProps) {
	const totalAvailable = candidate.availability.reduce(
		(acc, day) => acc + day.slots.filter((s) => s.available).length,
		0
	);

	return (
		<div className="max-w-5xl">
			{/* Back Button */}
			<button
				onClick={onBack}
				className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 text-base"
			>
				<ArrowLeft size={18} />
				<span>Back to Candidates</span>
			</button>

			{/* Candidate Header */}
			<div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
							<User size={24} className="text-gray-500" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
							<p className="text-gray-500 text-base">{candidate.email}</p>
							<p className="text-gray-400 text-sm">{candidate.role} · {candidate.department}</p>
						</div>
					</div>
					<div className="flex items-center gap-6">
						<div className="text-center">
							<p className="text-3xl font-bold text-gray-900">{totalAvailable}</p>
							<p className="text-gray-500 text-sm">Open slots</p>
						</div>
						<div className="text-center">
							<p className="text-3xl font-bold text-gray-900">{candidate.availability.length}</p>
							<p className="text-gray-500 text-sm">Days submitted</p>
						</div>
						<span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[candidate.status].color}`}>
							{statusConfig[candidate.status].label}
						</span>
					</div>
				</div>
			</div>

			{/* Availability Grid */}
			{candidate.availability.length > 0 ? (
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<div className="flex items-center gap-2 mb-5">
						<Clock size={18} className="text-gray-400" />
						<h2 className="text-base font-semibold text-gray-900">Weekly Availability</h2>
						<div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
							<span className="flex items-center gap-1.5">
								<CheckCircle size={14} className="text-green-500" /> Available
							</span>
							<span className="flex items-center gap-1.5">
								<XCircle size={14} className="text-gray-300" /> Unavailable
							</span>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr>
									<th className="text-left text-sm text-gray-400 font-medium pb-3 w-24">Time</th>
									{candidate.availability.map((day) => (
										<th key={day.day} className="text-center pb-3">
											<span className="block text-sm font-semibold text-gray-900">{day.day}</span>
											<span className="block text-xs text-gray-400">{day.date}</span>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{candidate.availability[0].slots.map((_, slotIndex) => (
									<tr key={slotIndex} className="border-t border-gray-50">
										<td className="py-2.5 text-sm text-gray-500 font-medium">
											{candidate.availability[0].slots[slotIndex].time}
										</td>
										{candidate.availability.map((day) => (
											<td key={day.day} className="py-2.5 text-center">
												{day.slots[slotIndex].available ? (
													<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 border border-green-200">
														<CheckCircle size={15} className="text-green-500" />
													</span>
												) : (
													<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-100">
														<XCircle size={15} className="text-gray-300" />
													</span>
												)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-3 text-center p-16">
					<div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center">
						<Clock size={24} className="text-yellow-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900">No availability submitted</h3>
					<p className="text-gray-500 text-base max-w-xs">
						{candidate.name} hasn't submitted their availability yet.
					</p>
				</div>
			)}
		</div>
	);
}