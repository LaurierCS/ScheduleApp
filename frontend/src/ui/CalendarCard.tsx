interface CalendarCardProps {
	title: string;
	count: number;
	className?: string;
}

export default function CalendarCard({ title, count, className = "" }: CalendarCardProps) {
	return (
		<div className={`border border-gray-200 rounded-lg p-4 text-left ${className}`}>
			<p className="text-gray-600 text-sm mb-1">{title}</p>
			<p className="text-3xl font-bold text-gray-900">{count}</p>
		</div>
	);
}
