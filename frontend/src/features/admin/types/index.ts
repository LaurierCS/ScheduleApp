export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface DayAvailability {
    day: string;
    date: string;
    slots: TimeSlot[];
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: "pending" | "submitted" | "interviewed";
    availability: DayAvailability[];
}

export const statusConfig = {
    submitted: { label: "Submitted", color: "bg-green-100 text-green-700" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    interviewed: { label: "Interviewed", color: "bg-blue-100 text-blue-700" },
};