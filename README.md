# 🚆 Kochi Metro Rail (KMRL) Web Application

A comprehensive, full-stack **Metro Management System** designed for Kochi Metro Rail Limited (KMRL). This application serves as an **AI-Driven Train Induction Planning & Scheduling System** while providing a user-friendly interface for regular customers, station masters, and metro officers.

---

## ✨ Key Features

### 👥 Multi-Role Authentication System
- **Customer:** Route planning, checking live services, fare calculation, wallet recharge, and booking tickets.
- **Station Master:** Specialized dashboard to manage station operations, post live announcements/news, and monitor activities.
- **KMRL Officer:** Overview of all stations and lines, advanced reporting, overall system management.

### 💳 Ticket Booking & Payments
- Book tickets with station-to-station fare calculation based on distance.
- Secure payment gateway integration using **Stripe**.
- Generates **QR Code** for scanning at terminals.
- Automatic **PDF Ticket** generation and email delivery.

### 📍 Maps & Navigation
- Interactive map visualization via **Leaflet**.
- Find Metro functionality allowing users to estimate time, routes, and fare between 20 real Kochi Metro stations.

### 📰 Real-Time Updates & News
- Centralized news management system for announcements, maintenance alerts, and system information.
- Station Masters can post live alerts to automatically notify customers.

### ⚙️ Admin & Monitoring
- Comprehensive activity logging for important backend actions.
- Role-based access control protecting critical API routes.

---

## 🛠️ Technology Stack

**Frontend:**
- **React (v18)** powered by **Vite**
- **React Router** for declarative navigation
- **React Leaflet** for map components
- **Axios** for API requests
- **Hugeicons** for modern, lightweight iconography

**Backend:**
- **Node.js** & **Express** Server
- **MongoDB** with **Mongoose** ORM
- **JSON Web Tokens (JWT)** & **bcryptjs** for secure authentication
- **PDFKit** for automated ticket generation
- **QRCode** for ticket scanning endpoints

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance (Local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Kochi-Metro-Rail
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory with the following configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/kmrl_metro
   JWT_SECRET=your_jwt_secret_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing the Application

The application automatically provisions default users on the first run for testing purposes.

### Default Accounts

| Role | Username | Password |
| :--- | :--- | :--- |
| **Customer** | `testuser` | `Test@1234` |

Create the accont and Use this Amazing Interface.......

Navigate to `http://localhost:5173` in your browser to start exploring the system.

---

## 📁 System Architecture

```text
Kochi-Metro-Rail/
├── backend/                  # Express RESTful API
│   ├── config/               # DB and env configurations
│   ├── middleware/           # Auth and Activity logger middleware
│   ├── models/               # Mongoose definitions (User, Station, News, Booking, Activity)
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Main server entry point
│
└── frontend/                 # React SPA
    └── src/
        ├── components/       # Reusable UI elements (Layout, Chatbot, VideoBackground)
        ├── pages/            # View components (Dashboards, Auth, Ticketing)
        ├── styles/           # CSS modules and global styles
        └── App.jsx           # Routing configuration
```

## 📄 License
This interactive portfolio and full-stack project is designed as an implementation prototype for the Kochi Metro Rail operations.
