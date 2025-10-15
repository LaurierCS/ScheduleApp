# Schedule App API Documentation

## Base URL

`http://localhost:3000/api`

## Authentication

Most endpoints require authentication (except where noted as Public).

## System Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Health check | Public |
| GET | `/test` | Test endpoint | Public |
| GET | `/status` | System status check | Public |
| GET | `/status/db` | Database connection status | Public |
| GET | `/env-check` | Environment variables check | Admin |
| GET | `/db-status` | MongoDB connection details | Admin |

## Auth Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login a user | Public |
| GET | `/auth/me` | Get current user profile | Private |
| POST | `/auth/logout` | Logout a user | Private |
| POST | `/auth/refresh-token` | Refresh access token | Public (with refresh token) |
| POST | `/auth/forgot-password` | Send password reset email | Public |
| POST | `/auth/reset-password` | Reset password with token | Public (with reset token) |

## User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | Get all users (paginated) | Admin |
| POST | `/users` | Create a new user | Admin |
| GET | `/users/:id` | Get user by ID | Admin, Own User |
| PUT | `/users/:id` | Update user | Admin, Own User |
| DELETE | `/users/:id` | Delete user | Admin, Own User |

## Team Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/teams` | Get all teams | Admin |
| POST | `/teams` | Create a new team | Admin |
| GET | `/teams/:id` | Get team by ID | Admin, Team Members |
| PUT | `/teams/:id` | Update team | Admin, Team Owner |
| DELETE | `/teams/:id` | Delete team | Admin, Team Owner |
| GET | `/teams/:id/members` | Get team members | Admin, Team Members |
| POST | `/teams/:id/members` | Add member to team | Admin, Team Owner |
| DELETE | `/teams/:id/members/:userId` | Remove member from team | Admin, Team Owner |

## Interviewer Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/interviewers` | Get all interviewers (paginated) | Admin |
| POST | `/interviewers` | Create a new interviewer | Admin |
| GET | `/interviewers/:id` | Get interviewer by ID | Admin, Own User |
| PUT | `/interviewers/:id` | Update interviewer | Admin, Own User |
| DELETE | `/interviewers/:id` | Delete interviewer | Admin |
| GET | `/interviewers/:id/availability` | Get interviewer availability | Admin, Own User |

## Candidate Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/candidates` | Get all candidates (paginated) | Admin, Interviewers |
| POST | `/candidates` | Create a new candidate | Admin |
| GET | `/candidates/:id` | Get candidate by ID | Admin, Interviewer, Own User |
| PUT | `/candidates/:id` | Update candidate | Admin, Own User |
| DELETE | `/candidates/:id` | Delete candidate | Admin |
| GET | `/candidates/:id/availability` | Get candidate availability | Admin, Interviewer, Own User |

## Group Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/groups` | Get all groups (paginated) | Admin |
| POST | `/groups` | Create a new group | Admin |
| GET | `/groups/:id` | Get group by ID | Admin, Team Members |
| PUT | `/groups/:id` | Update group | Admin |
| DELETE | `/groups/:id` | Delete group | Admin |
| GET | `/groups/:id/members` | Get group members | Admin, Team Members |
| POST | `/groups/:id/members` | Add member to group | Admin |
| DELETE | `/groups/:id/members/:userId` | Remove member from group | Admin |

## Availability Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/availability` | Get availability for date range and user(s) | Private |
| POST | `/availability` | Create/update availability | Private |
| GET | `/availability/:id` | Get availability by ID | Admin, Owner, Team Members |
| PUT | `/availability/:id` | Update availability | Admin, Owner |
| DELETE | `/availability/:id` | Delete availability | Admin, Owner |
| GET | `/availability/team/:teamId` | Get team availability | Admin, Team Members |
| GET | `/availability/matches` | Find matching availability | Admin, Team Members |

## Meeting Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/meetings` | Get all meetings (paginated) | Admin, Interviewer, Candidate |
| POST | `/meetings` | Create a new meeting | Admin |
| GET | `/meetings/:id` | Get meeting by ID | Admin, Participants |
| PUT | `/meetings/:id` | Update meeting | Admin |
| DELETE | `/meetings/:id` | Delete meeting | Admin |
| POST | `/meetings/:id/confirm` | Confirm participation | Meeting Participants |
| POST | `/meetings/:id/reschedule` | Request rescheduling | Meeting Participants |
| GET | `/meetings/user/:userId` | Get user meetings | Admin, Own User |
| GET | `/meetings/team/:teamId` | Get team meetings | Admin, Team Members |

## Schedule Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/schedules/generate` | Auto-generate optimal schedule | Admin |
| GET | `/schedules/team/:teamId` | Get team schedule | Admin, Team Members |
| GET | `/schedules/conflicts` | Check for scheduling conflicts | Admin |
| POST | `/schedules/optimize` | Optimize existing schedule | Admin |
| POST | `/schedules/publish/:teamId` | Publish schedule for a team | Admin |
