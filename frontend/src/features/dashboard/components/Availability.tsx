import * as React from "react";
import { useState } from "react";
import { Check } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

interface AvailabilityData {
	[dateKey: string]: string[];
}

const Checkbox = React.forwardRef<
	React.ComponentRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={`peer h-4 w-4 shrink-0 rounded border-2 border-black bg-white flex items-center justify-center aspect-square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-black data-[state=checked]:border-black${className ? ` ${className}` : ""}`}
		{...props}
	>
		<CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
			<Check className="h-3 w-3" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TIME_SLOTS = ["8:00 am", "9:00 am", "10:00 am", "11:00 am", "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm"];

export default function Availability() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [availability, setAvailability] = useState<AvailabilityData>({});
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

	const formatDateKey = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
	const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

	const handleDateClick = (day: number) => setSelectedDate(new Date(currentYear, currentMonth, day));

	const handleTimeSlotToggle = (timeSlot: string, checked: boolean) => {
		if (!selectedDate) return;
		const dateKey = formatDateKey(selectedDate);
		const currentTimes = availability[dateKey] || [];
		setAvailability({
			...availability,
			[dateKey]: checked ? [...currentTimes, timeSlot] : currentTimes.filter((time) => time !== timeSlot),
		});
	};

	const isTimeSlotSelected = (timeSlot: string): boolean => {
		if (!selectedDate) return false;
		return availability[formatDateKey(selectedDate)]?.includes(timeSlot) || false;
	};

	const dateHasAvailability = (day: number): boolean => {
		const dateKey = formatDateKey(new Date(currentYear, currentMonth, day));
		return availability[dateKey]?.length > 0 || false;
	};

	const isDateSelected = (day: number): boolean =>
		selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear;

	const handleMonthChange = (direction: number) => {
		let newMonth = currentMonth + direction;
		let newYear = currentYear;
		if (newMonth < 0) {
			newMonth = 11;
			newYear--;
		} else if (newMonth > 11) {
			newMonth = 0;
			newYear++;
		}
		setCurrentMonth(newMonth);
		setCurrentYear(newYear);
		setSelectedDate(null);
	};

	const generateCalendarDays = () => {
		const days: (number | null)[] = [];
		const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
		for (let i = 0; i < firstDay; i++) days.push(null);
		for (let day = 1; day <= getDaysInMonth(currentMonth, currentYear); day++) days.push(day);
		return days;
	};

	const handleSubmit = async () => {
		console.log("Submitting availability:", availability);
		alert("Availability submitted successfully!");
	};

	const days = generateCalendarDays();

	return (
		<div className="max-w-4xl space-y-6">
			<h1 className="text-3xl font-bold text-gray-900">Your Availability</h1>

			<div className="bg-white p-6 rounded-lg shadow-sm">
				<div className="mb-8 space-y-2">
					<p className="text-gray-700">Please select all the times you're available to meet for an interview. We'll use this information to schedule your interview.</p>
					<p className="text-gray-700">• Select a day, fill in available times, and then repeat process for all available days.</p>
				</div>

				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<button onClick={() => handleMonthChange(-1)} className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">←</button>
						<h2 className="text-xl font-semibold text-gray-800">{MONTHS[currentMonth]} {currentYear}</h2>
						<button onClick={() => handleMonthChange(1)} className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">→</button>
					</div>

					<div className="grid grid-cols-7 gap-1">
						{["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
							<div key={i} className="text-center text-sm font-medium text-gray-600 py-2">
								{day}
							</div>
						))}
						{days.map((day, i) => (
							<div key={i}>
								{day === null ? null : (
									<button
										onClick={() => handleDateClick(day)}
										className={`w-full py-2 rounded-full text-sm transition-colors ${
											isDateSelected(day)
												? "bg-black text-white font-semibold"
												: dateHasAvailability(day)
												? "bg-gray-100 text-gray-700 hover:bg-gray-200"
												: "text-gray-700 hover:bg-gray-100"
										}`}
									>
										{day}
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			{selectedDate && (
				<div className="bg-white p-6 rounded-lg shadow-sm">
					<label className="block text-sm font-medium text-gray-700 mb-4">Available times (select all that apply)</label>
					<div className="grid grid-cols-2 gap-4">
						{TIME_SLOTS.map((timeSlot) => (
							<label key={timeSlot} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
								<Checkbox checked={isTimeSlotSelected(timeSlot)} onCheckedChange={(checked) => handleTimeSlotToggle(timeSlot, checked === true)} />
								<span className="text-sm text-gray-700">{timeSlot}</span>
							</label>
						))}
					</div>
				</div>
			)}

			<button onClick={handleSubmit} disabled={Object.keys(availability).length === 0} className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
				Submit Availability
			</button>
		</div>
	);
}

