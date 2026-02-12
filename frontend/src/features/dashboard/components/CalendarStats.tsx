interface CalendarStat {
	title: string;
	count: number;
}

interface CalendarStatsProps {
	stats: CalendarStat[];
}

export default function CalendarStats({ stats }: CalendarStatsProps) {
	return (
		<section className="mb-10 bg-white p-6 rounded-lg shadow-md">
			<h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, Name!</h1>
			<h2 className="text-xl font-semibold text-gray-800 mb-4">Your calendar at a glance</h2>
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
