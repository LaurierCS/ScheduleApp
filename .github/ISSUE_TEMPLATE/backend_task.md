---
name: "🔧 Backend API Task"
about: "Use this template to define a backend API endpoint task."
title: "[BE Task] "
labels: ["backend", "api"]
assignees: ''

---

## 🎯 Summary  
Describe the API endpoint being implemented.

> **Example:** Create `/api/availability/add` to allow interviewers and candidates to submit their availability.

---

## ✅ Acceptance Criteria  
Define the requirements for this task.

- [ ] Create a `POST /api/availability/add` endpoint  
- [ ] Validate input (date, time, user ID)  
- [ ] Store data in the database  
- [ ] Return confirmation response  

---

## 🔧 API Specifications  
Provide details on request and response formats.

> **Request Format:**  
> ```json
> {
>   "user_id": "12345",
>   "date": "2025-03-10",
>   "time_slot": "10:00 AM - 11:00 AM"
> }
> ```
> **Response Format:**  
> ```json
> {
>   "message": "Availability added successfully"
> }
> ```

---

## 🗂️ Database Considerations  
Mention how this data should be stored.

> **Example:** Add a new `availability` table in PostgreSQL with `user_id`, `date`, and `time_slot`.

---

## 🚀 Additional Notes  
Any extra context, related tasks, or dependencies.

---

### ⚡ Priority Level  
- [ ] 🔥 High Priority  
- [ ] ⚡ Medium Priority  
- [ ] 🐢 Low Priority  
