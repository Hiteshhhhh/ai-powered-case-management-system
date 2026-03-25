import { GoogleGenAI, Type } from "@google/genai";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Types & Interfaces (Clean Architecture) ---

export type Role = "User" | "Admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: "Monthly" | "Yearly";
}

export interface AIInsight {
  id: string;
  userId: string;
  content: string;
  type: "Recommendation" | "Alert" | "Strategy";
  timestamp: string;
}

export interface NotificationLog {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
}

// --- In-Memory Repositories (Simulation) ---

let users: User[] = [
  { 
    id: "user_1", 
    fullName: "Hitesh Mishra", 
    email: "mishrahitesh90616@gmail.com", 
    passwordHash: bcrypt.hashSync("password123", 10), 
    role: "User", 
    createdAt: new Date().toISOString() 
  }
];

let transactions: Transaction[] = [
  { id: "t1", userId: "user_1", amount: 5000, type: "Income", category: "Salary", description: "Monthly Salary", date: "2026-03-01T10:00:00Z" },
  { id: "t2", userId: "user_1", amount: 1200, type: "Expense", category: "Rent", description: "Apartment Rent", date: "2026-03-02T10:00:00Z" },
  { id: "t3", userId: "user_1", amount: 450, type: "Expense", category: "Dining", description: "Dinner with friends", date: "2026-03-05T20:00:00Z" },
  { id: "t4", userId: "user_1", amount: 150, type: "Expense", category: "Transport", description: "Fuel", date: "2026-03-07T15:00:00Z" },
  { id: "t5", userId: "user_1", amount: 300, type: "Expense", category: "Dining", description: "Weekend Brunch", date: "2026-03-10T11:00:00Z" },
  { id: "t6", userId: "user_1", amount: 800, type: "Expense", category: "Shopping", description: "New Clothes", date: "2026-03-15T14:00:00Z" },
  { id: "t7", userId: "user_1", amount: 200, type: "Expense", category: "Utilities", description: "Electricity Bill", date: "2026-03-18T09:00:00Z" },
];

let budgets: Budget[] = [
  { id: "b1", userId: "user_1", category: "Dining", amount: 500, period: "Monthly" },
  { id: "b2", userId: "user_1", category: "Shopping", amount: 1000, period: "Monthly" },
  { id: "b3", userId: "user_1", category: "Transport", amount: 300, period: "Monthly" },
];

let aiInsights: AIInsight[] = [];
let notificationLogs: NotificationLog[] = [];

// --- Services (Business Logic) ---

class NotificationService {
  static async sendEmail(recipient: string, subject: string, content: string) {
    const log: NotificationLog = {
      id: Math.random().toString(36).substr(2, 9),
      recipient,
      subject,
      content,
      timestamp: new Date().toISOString()
    };
    notificationLogs.push(log);
    console.log(`[EMAIL SENT] To: ${recipient} | Subject: ${subject}`);
    return true;
  }

  static async checkBudgetsAndNotify(userId: string) {
    const userTransactions = transactions.filter(t => t.userId === userId);
    const userBudgets = budgets.filter(b => b.userId === userId);
    const user = users.find(u => u.id === userId);
    if (!user) return;

    for (const budget of userBudgets) {
      const spent = userTransactions
        .filter(t => t.category === budget.category && t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (spent > budget.amount) {
        await this.sendEmail(
          user.email,
          `Budget Exceeded: ${budget.category}`,
          `Alert: You have spent $${spent} on ${budget.category}, which exceeds your budget of $${budget.amount}.`
        );
      } else if (spent > budget.amount * 0.8) {
        await this.sendEmail(
          user.email,
          `Budget Warning: ${budget.category}`,
          `Warning: You have spent $${spent} on ${budget.category}, reaching 80% of your $${budget.amount} budget.`
        );
      }
    }
  }
}

// --- Express App & Middleware ---

const app = express();
app.use(express.json());

const JWT_SECRET = "enterprise_financial_advisor_secure_secret_2026";

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log(`[AUTH] No token provided for ${req.url}`);
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error(`[AUTH] Token verification failed for ${req.url}:`, err.message);
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

// --- API Routes ---

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Auth
app.post("/api/auth/login", async (req, res) => {
  console.log("Login attempt:", req.body.email);
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    console.log("Login failed for:", email);
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.fullName }, JWT_SECRET);
  console.log("Login successful for:", email);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
});

// Transactions
app.get("/api/transactions", authenticateToken, (req: any, res) => {
  const userTransactions = transactions.filter(t => t.userId === req.user.id);
  res.json(userTransactions);
});

app.post("/api/transactions", authenticateToken, async (req: any, res) => {
  const { amount, type, category, description, date } = req.body;
  const newTransaction: Transaction = {
    id: Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    amount,
    type,
    category,
    description,
    date: date || new Date().toISOString()
  };
  transactions.push(newTransaction);
  
  // Trigger budget check
  await NotificationService.checkBudgetsAndNotify(req.user.id);
  
  res.status(201).json(newTransaction);
});

// Budgets
app.get("/api/budgets", authenticateToken, (req: any, res) => {
  const userBudgets = budgets.filter(b => b.userId === req.user.id);
  res.json(userBudgets);
});

app.post("/api/budgets", authenticateToken, (req: any, res) => {
  const { category, amount, period } = req.body;
  const newBudget: Budget = {
    id: Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    category,
    amount,
    period
  };
  budgets.push(newBudget);
  res.status(201).json(newBudget);
});

// AI Insights
app.get("/api/insights", authenticateToken, (req: any, res) => {
  const userInsights = aiInsights.filter(i => i.userId === req.user.id);
  res.json(userInsights);
});

app.post("/api/insights", authenticateToken, (req: any, res) => {
  const { insights } = req.body;
  if (!Array.isArray(insights)) return res.status(400).json({ error: "Invalid insights" });
  
  const formattedInsights = insights.map((i: any) => ({
    ...i,
    id: Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    timestamp: new Date().toISOString()
  }));
  
  aiInsights.push(...formattedInsights);
  res.status(201).json(formattedInsights);
});

// Notifications
app.get("/api/notifications", authenticateToken, (req: any, res) => {
  // Only Admin or the user themselves (if we filtered by recipient email)
  const logs = notificationLogs.filter(l => l.recipient === req.user.email);
  res.json(logs);
});

// API 404 Handler
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

// --- Vite Integration ---

import fs from "fs";

async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath);

  if (!isProduction || !hasDist) {
    console.log("Starting in DEVELOPMENT mode (using Vite middleware)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode (serving static files)");
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Financial Advisor running at http://localhost:${PORT}`);
  });
}

startServer();
