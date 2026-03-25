# AI-Powered Financial Advisor

An enterprise-grade financial management system with AI-driven spending insights, budget tracking, and automated alerts.

## 🚀 Features

- **AI Insights**: Real-time financial analysis and actionable recommendations using Gemini AI.
- **Transaction Tracking**: Comprehensive dashboard for monitoring income and expenses.
- **Budget Management**: Set and track budgets by category with automated warnings.
- **Secure Authentication**: JWT-based authentication for secure data access.
- **Automated Alerts**: Simulated email notifications for budget breaches and warnings.
- **Modern UI**: Responsive, high-performance dashboard built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, JWT Authentication.
- **AI**: Google Gemini AI (@google/genai).
- **Database**: In-memory storage (simulated for demo).

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔐 Demo Account

| Role | Email | Password |
|------|-------|----------|
| **User** | `demo123@gmail.com` | `password123` |

## 📂 Project Structure

- `server.ts`: Express server handling authentication, transactions, and budgets.
- `src/App.tsx`: Main React application with dashboard, transactions, and AI insights.
- `src/index.css`: Tailwind CSS configuration and global styles.
