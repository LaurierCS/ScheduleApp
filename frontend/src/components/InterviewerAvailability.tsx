import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilityData {
	[dateKey: string]: string[]; // dateKey format: "YYYY-MM-DD", value: array of time slots
}

export default function InterviewerAvailability() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [availability, setAvailability] = useState<AvailabilityData>({});
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

	// Time slots from 8am to 11pm
	const timeSlots = [
		"8:00 am",
		"9:00 am",
		"10:00 am",
		"11:00 am",
		"12:00 pm",
		"1:00 pm",
		"2:00 pm",
		"3:00 pm",
		"4:00 pm",
		"5:00 pm",
		"6:00 pm",
		"7:00 pm",
		"8:00 pm",
		"9:00 pm",
		"10:00 pm",
		"11:00 pm",
	];

	// Get days in month
	const getDaysInMonth = (month: number, year: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	// Get first day of month (0 = Sunday, 1 = Monday, etc.)
	const getFirstDayOfMonth = (month: number, year: number) => {
		return new Date(year, month, 1).getDay();
	};

	// Format date as YYYY-MM-DD
	const formatDateKey = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// Get month name
	const getMonthName = (month: number) => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		return months[month];
	};

	// Handle date selection
	const handleDateClick = (day: number) => {
		const date = new Date(currentYear, currentMonth, day);
		setSelectedDate(date);
	};

	// Handle time slot toggle
	const handleTimeSlotToggle = (timeSlot: string, checked: boolean) => {
		if (!selectedDate) return;

		const dateKey = formatDateKey(selectedDate);
		const currentTimes = availability[dateKey] || [];

		if (checked) {
			setAvailability({
				...availability,
				[dateKey]: [...currentTimes, timeSlot],
			});
		} else {
			setAvailability({
				...availability,
				[dateKey]: currentTimes.filter((time) => time !== timeSlot),
			});
		}
	};

	// Check if time slot is selected for current date
	const isTimeSlotSelected = (timeSlot: string): boolean => {
		if (!selectedDate) return false;
		const dateKey = formatDateKey(selectedDate);
		return availability[dateKey]?.includes(timeSlot) || false;
	};

	// Check if date has availability
	const dateHasAvailability = (day: number): boolean => {
		const date = new Date(currentYear, currentMonth, day);
		const dateKey = formatDateKey(date);
		return availability[dateKey]?.length > 0 || false;
	};

	// Handle submit
	const handleSubmit = async () => {
		// TODO: Connect to backend API
		console.log("Submitting availability:", availability);
		
		// Example API call structure:
		// const response = await apiFetch('/availability', {
		//   method: 'POST',
		//   headers: { 'Content-Type': 'application/json' },
		//   body: JSON.stringify(availability)
		// });
		
		alert("Availability submitted successfully!");
	};

	// Generate calendar days
	const daysInMonth = getDaysInMonth(currentMonth, currentYear);
	const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
	const days: (number | null)[] = [];

	// Add empty cells for days before the first day of the month
	for (let i = 0; i < firstDay; i++) {
		days.push(null);
	}

	// Add all days of the month
	for (let day = 1; day <= daysInMonth; day++) {
		days.push(day);
	}

	const isDateSelected = (day: number): boolean => {
		if (!selectedDate) return false;
		return (
			selectedDate.getDate() === day &&
			selectedDate.getMonth() === currentMonth &&
			selectedDate.getFullYear() === currentYear
		);
	};

	// Navigation functions
	const goToPreviousMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(currentYear - 1);
		} else {
			setCurrentMonth(currentMonth - 1);
		}
		setSelectedDate(null);
	};

	const goToNextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}
		setSelectedDate(null);
	};

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
				{/* Back Button */}
				<Link
					to="/interviewer-schedule"
					className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
				>
					<ArrowLeft size={20} />
					<span>Back to Dashboard</span>
				</Link>

				{/* Instructions */}
				<div className="mb-8 space-y-2">
					<p className="text-gray-700">
						Please select all the times you're available to meet for an interview. We'll use this information to schedule your interview.
					</p>
					<p className="text-gray-700">
						• Select a day, fill in available times, and then repeat process for all available days.
					</p>
				</div>

				{/* Calendar */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<button
							onClick={goToPreviousMonth}
							className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
						>
							←
						</button>
						<h2 className="text-xl font-semibold text-gray-800">
							{getMonthName(currentMonth)} {currentYear}
						</h2>
						<button
							onClick={goToNextMonth}
							className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
						>
							→
						</button>
					</div>

					{/* Calendar Grid */}
					<div className="grid grid-cols-7 gap-1">
						{/* Day headers */}
						{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
							<div
								key={index}
								className="text-center text-sm font-medium text-gray-600 py-2"
							>
								{day}
							</div>
						))}

						{/* Calendar days */}
						{days.map((day, index) => {
							if (day === null) {
								return <div key={index} className="py-2"></div>;
							}

							const isSelected = isDateSelected(day);
							const hasAvailability = dateHasAvailability(day);

							return (
								<button
									key={index}
									onClick={() => handleDateClick(day)}
									className={`py-2 rounded-full text-sm transition-colors ${
										isSelected
											? "bg-black text-white font-semibold"
											: hasAvailability
											? "bg-gray-100 text-gray-700 hover:bg-gray-200"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									{day}
								</button>
							);
						})}
					</div>
				</div>

				{/* Time Slot Selector */}
				{selectedDate && (
					<div className="mb-8">
						<label className="block text-sm font-medium text-gray-700 mb-4">
							Available times (select all that apply)
						</label>
						<div className="grid grid-cols-2 gap-4">
							{timeSlots.map((timeSlot) => (
								<label
									key={timeSlot}
									className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
								>
									<Checkbox
										checked={isTimeSlotSelected(timeSlot)}
										onCheckedChange={(checked) =>
											handleTimeSlotToggle(timeSlot, checked === true)
										}
									/>
									<span className="text-sm text-gray-700">{timeSlot}</span>
								</label>
							))}
						</div>
					</div>
				)}

				{/* Submit Button */}
				<button
					onClick={handleSubmit}
					disabled={Object.keys(availability).length === 0}
					className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
				>
					Submit Availability
				</button>
			</div>
		</div>
	);
}

