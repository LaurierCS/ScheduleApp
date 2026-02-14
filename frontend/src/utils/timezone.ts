/**
 * Timezone conversion utilities
 * Handles conversion between local time strings and ISO timestamps
 */

/**
 * Parse a time string like "8:00 am" or "2:30 pm" into hours and minutes
 * @param timeString - Time string in format like "8:00 am"
 * @returns Object with hours (0-23) and minutes (0-59)
 */
export function parseTimeString(timeString: string): { hours: number; minutes: number } {
	const cleanTime = timeString.toLowerCase().trim();
	const isPM = cleanTime.includes("pm");
	const isAM = cleanTime.includes("am");

	// Remove am/pm and trim
	const timePart = cleanTime.replace(/[ap]m/, "").trim();
	const [hoursStr, minutesStr] = timePart.split(":");

	let hours = parseInt(hoursStr, 10);
	const minutes = parseInt(minutesStr, 10) || 0;

	// Convert to 24-hour format
	if (isPM && hours !== 12) {
		hours += 12;
	} else if (isAM && hours === 12) {
		hours = 0;
	}

	return { hours, minutes };
}

/**
 * Combine a date from calendar selection with a time string
 * @param date - Date object (from calendar selection)
 * @param timeString - Time string like "8:00 am"
 * @returns Date object with combined date and time in local timezone
 */
export function combineDateAndTime(date: Date, timeString: string): Date {
	const { hours, minutes } = parseTimeString(timeString);

	const result = new Date(date);
	result.setHours(hours, minutes, 0, 0);

	return result;
}

/**
 * Convert a Date object to ISO 8601 timestamp string
 * @param date - Date object
 * @returns ISO 8601 string (e.g., "2024-01-15T14:30:00.000Z")
 */
export function toISOTimestamp(date: Date): string {
	return date.toISOString();
}

/**
 * Format a Date object for display
 * @param date - Date object or ISO string
 * @returns Formatted string like "Thursday, Jan 15, 2:00 PM"
 */
export function formatDisplayDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;

	return d.toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Format a Date object for display with date only
 * @param date - Date object or ISO string
 * @returns Formatted string like "Thursday, Jan 15"
 */
export function formatDisplayDateOnly(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;

	return d.toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
}

/**
 * Add hours to a date
 * @param date - Date object
 * @param hours - Number of hours to add
 * @returns New Date object
 */
export function addHours(date: Date, hours: number): Date {
	const result = new Date(date);
	result.setHours(result.getHours() + hours);
	return result;
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns boolean
 */
export function isToday(date: Date | string): boolean {
	const d = typeof date === "string" ? new Date(date) : date;
	const today = new Date();

	return (
		d.getDate() === today.getDate() &&
		d.getMonth() === today.getMonth() &&
		d.getFullYear() === today.getFullYear()
	);
}

/**
 * Get the start of the day
 * @param date - Date object
 * @returns Date set to midnight (00:00:00)
 */
export function startOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

/**
 * Get the end of the day
 * @param date - Date object
 * @returns Date set to 23:59:59
 */
export function endOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(23, 59, 59, 999);
	return result;
}
