# Schedule App 📅⏰

<div align="center">
  <img src="https://img.shields.io/badge/react-19.0.0-61DAFB?style=flat-square&logo=react" alt="React 19.0.0"/>
  <img src="https://img.shields.io/badge/node->=16.0.0-339933?style=flat-square&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/typescript-5.7.2-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5.7.2"/>
  <img src="https://img.shields.io/badge/mongodb-6.14.2-47A248?style=flat-square&logo=mongodb" alt="MongoDB 6.14.2"/>
  <img src="https://img.shields.io/badge/express-4.19.2-000000?style=flat-square&logo=express" alt="Express 4.19.2"/>
  <img src="https://img.shields.io/badge/tailwindcss-3.0.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS 3.0.0"/>
  <img src="https://img.shields.io/badge/vite-6.2.0-646CFF?style=flat-square&logo=vite" alt="Vite 6.2.0"/>
</div>

<hr>

## 🚀 Setup Guide

This document outlines the steps to set up and run the Schedule App on your local machine.

<details open>
<summary><b>📋 Prerequisites</b></summary>

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **pnpm** (v8 or higher)
- **MongoDB Community Edition** [download here](https://www.mongodb.com/try/download/community)

</details>

<details open>
<summary><b>💻 Installation Steps</b></summary>

### 1. Install Node.js

- Download and install from [nodejs.org](https://nodejs.org/en/download/)
- Verify installation: `node --version`

### 2. Install pnpm

```bash
npm install -g pnpm
```

### 3. Install MongoDB

- Follow the download link: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
- Download the appropriate version for your operating system
- Follow the installation wizard
- Add MongoDB to your path (if not added automatically)
- Start MongoDB service:
  - Windows: `net start mongodb` (or through services)
  - Mac/Linux: `sudo systemctl start mongod`

### 4. Clone the Repository

```bash
git clone <repository-url>
cd scheduleapp
```

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Configure Environment Variables

The backend already has a `.env` file with default development settings. You can modify these if needed:

```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/scheduleapp
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 7. Run the Application

Development mode (runs both frontend and backend):

```bash
pnpm dev
```

Run frontend only:

```bash
pnpm frontend
```

Run backend only:

```bash
pnpm backend
```

</details>

<details>
<summary><b>🔍 Application Structure</b></summary>

```
scheduleapp/
├── frontend/               # React frontend (Vite + TypeScript)
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── assets/         # Static assets
│   │   └── lib/            # Utilities and helpers
├── backend/                # Express backend (TypeScript)
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose data models
│   │   └── routes/         # API routes
└── package.json            # Root package.json with scripts
```

</details>

<details>
<summary><b>🧪 Status Dashboard</b></summary>

The application includes a status dashboard that shows:

- Frontend status (React, Tailwind)
- Backend connection
- MongoDB connection status

If MongoDB shows as "pending", try clicking the "refresh status" button on the dashboard.

</details>

<details>
<summary><b>🔧 Troubleshooting</b></summary>

### MongoDB Connection Issues

If MongoDB status shows as "pending" or "error":

1. Ensure MongoDB service is running
2. Check if you can connect to MongoDB using Mongo shell:
   ```bash
   mongosh mongodb://localhost:27017/scheduleapp
   ```
3. Verify the MongoDB URI in `backend/.env`

### Port Conflicts

If you encounter port conflicts:
- Frontend default port: 5173
- Backend default port: 5000

You can change these in:
- Backend port: Modify `PORT` in `backend/.env`
- Frontend port: Modify `vite.config.ts` in the frontend directory

</details>

<hr>

<div align="center">
  <p>Made with ❤️ using the MERN stack</p>
</div>
