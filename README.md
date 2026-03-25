# Nexus AI Support System

A production-grade, AI-powered customer support ticketing system built with React, Express, and Google Gemini AI.

## 🚀 Features

- **AI Smart Assist**: Automatic ticket classification, prioritization, and summarization using Gemini AI.
- **Smart Routing**: AI-suggested agent assignment based on ticket content and agent workload.
- **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for Admins, Agents, and Customers.
- **Real-time Notifications**: Simulated email notification system for ticket updates and SLA alerts.
- **SLA Monitoring**: Visual tracking of resolution deadlines.
- **Responsive Design**: Modern, bento-grid inspired UI built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, JWT Authentication.
- **AI**: Google Gemini AI (@google/genai).
- **Database**: In-memory storage (simulated for demo).

## 📦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd nexus-ai-support
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@nexus.ai` | `admin123` |
| **Agent** | `agent@nexus.ai` | `agent123` |
| **Customer** | `alice@example.com` | `cust123` |

## 📂 Project Structure

- `server.ts`: Express server with AI and notification logic.
- `src/App.tsx`: Main React application with all views and components.
- `src/index.css`: Tailwind CSS configuration and global styles.

## 📤 How to add to GitHub

1. **Create a new repository on GitHub**:
   Go to [github.com/new](https://github.com/new) and create a repository named `nexus-ai-support`.

2. **Initialize Git locally**:
   In your project terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Support System"
   ```

3. **Link to GitHub and Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nexus-ai-support.git
   git branch -M main
   git push -u origin main
   ```

4. **Add Secrets**:
   If you plan to deploy (e.g., to Vercel or Railway), remember to add your `GEMINI_API_KEY` to the service's environment variables.
