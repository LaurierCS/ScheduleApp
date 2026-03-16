export type Interviewer = {
  id: number;
  name: string;
  email: string;
  dept: string;
  status: "Joined" | "Invited To Join";
};

export type Interviewee = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Joined" | "Invited To Join";
};
const initialInterviewers: Interviewer[] = [
  {
    id: 1,
    name: "Chris Albon",
    email: "chris@scheduleiq.com",
    dept: "Eng",
    status: "Joined",
  },
  {
    id: 2,
    name: "Danielle Thompson",
    email: "danielle@scheduleiq.com",
    dept: "Eng",
    status: "Invited To Join",
  },
  {
    id: 3,
    name: "Sara Anderson",
    email: "sara@scheduleiq.com",
    dept: "Admin",
    status: "Invited To Join",
  },
  {
    id: 4,
    name: "Nathan Kim",
    email: "nathan@scheduleiq.com",
    dept: "Events",
    status: "Joined",
  },
  {
    id: 5,
    name: "Ava Garcia",
    email: "ava@scheduleiq.com",
    dept: "Communications",
    status: "Joined",
  },
];

const initialInterviewees: Interviewee[] = [
  {
    id: 1,
    name: "Chris Albon",
    email: "chris@scheduleiq.com",
    role: "Software Engineer",
    status: "Joined",
  },
  {
    id: 2,
    name: "Danielle Thompson",
    email: "danielle@scheduleiq.com",
    role: "Software Engineer",
    status: "Joined",
  },
  {
    id: 3,
    name: "Sara Anderson",
    email: "sara@scheduleiq.com",
    role: "VP of Finance",
    status: "Joined",
  },
  {
    id: 4,
    name: "Nathan Kim",
    email: "nathan@scheduleiq.com",
    role: "Events Director",
    status: "Joined",
  },
  {
    id: 5,
    name: "Ava Garcia",
    email: "ava@scheduleiq.com",
    role: "Admin Coordinator",
    status: "Joined",
  },
];
export {  initialInterviewers, initialInterviewees };