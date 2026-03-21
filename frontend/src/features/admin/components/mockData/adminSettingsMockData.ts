export interface Moderator {
	id: string;
	name: string;
	email: string;
	isMain?: boolean;
}

export interface Role {
	id: string;
	name: string;
}

export interface Department {
	id: string;
	name: string;
}

export const mockModerators: Moderator[] = [
	{ id: "1", name: "Jason Van-Humbeek", email: "jason@example.com", isMain: true },
	{ id: "2", name: "Vincenzo Milano", email: "vincenzo@example.com" },
];

export const mockRoles: Role[] = [
	{ id: "1", name: "Software Engineer" },
	{ id: "2", name: "Academic Coordinator" },
];

export const mockDepartments: Department[] = [
	{ id: "1", name: "Eng" },
	{ id: "2", name: "Academics" },
];

export const defaultInterviewersPerInterviewee = 2;
export const defaultMaxInterviewsPerDay = 5;
