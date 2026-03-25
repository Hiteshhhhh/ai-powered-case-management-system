import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// --- Configuration & Constants ---
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "nexus-ai-secret-key-2026";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Types & Interfaces ---
interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: "Admin" | "Agent" | "Customer";
  departmentId?: number;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "Open" | "InProgress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  category: string;
  sentiment?: string;
  summary?: string;
  customerId: string;
  customerName: string;
  assignedAgentId?: string;
  suggestedAgentId?: string; // AI Suggestion
  departmentId?: number;
  createdAt: string;
  updatedAt: string;
  slaDueDate: string;
  isEscalated: boolean;
}

interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

interface NotificationLog {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
  type: string;
}

// --- In-Memory Repositories (Simulation) ---
let users: User[] = [
  { id: "admin_1", fullName: "System Admin", email: "admin@nexus.ai", passwordHash: bcrypt.hashSync("admin123", 10), role: "Admin" },
  { id: "agent_1", fullName: "Hitesh Mishra", email: "agent@nexus.ai", passwordHash: bcrypt.hashSync("agent123", 10), role: "Agent", departmentId: 1 },
  { id: "cust_1", fullName: "Alice Johnson", email: "alice@example.com", passwordHash: bcrypt.hashSync("cust123", 10), role: "Customer" }
];

let tickets: Ticket[] = [
  {
    id: "TIC-1001",
    title: "Login page is crashing on Safari",
    description: "When I try to login using Safari browser, the page goes blank and the console shows a JS error. This is critical for our users.",
    status: "Open",
    priority: "High",
    category: "Bug",
    sentiment: "Negative",
    summary: "Safari-specific login crash causing blank page.",
    customerId: "cust_1",
    customerName: "Alice Johnson",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    slaDueDate: new Date(Date.now() + 7200000).toISOString(),
    isEscalated: false
  }
];

let comments: Comment[] = [];
let notificationLogs: NotificationLog[] = [];

// --- Services ---

class NotificationService {
  static async sendEmail(recipient: string, subject: string, template: string, data: any = {}) {
    const content = template.replace(/{{(\w+)}}/g, (_, key) => data[key] || "");
    const log: NotificationLog = {
      id: Math.random().toString(36).substr(2, 9),
      recipient,
      subject,
      content,
      timestamp: new Date().toISOString(),
      type: "Email"
    };
    notificationLogs.push(log);
    console.log(`[EMAIL SENT] To: ${recipient} | Subject: ${subject}`);
    return true;
  }

  static async notifyStatusChange(ticket: Ticket, status: string) {
    await this.sendEmail(ticket.customerId, `Ticket Status Updated: ${ticket.id}`, 
      "Hello, your ticket '{{title}}' status has been updated to: {{status}}.", 
      { title: ticket.title, status });
  }

  static async notifyTicketCreated(ticket: Ticket, customer: User) {
    // Notify Customer
    await this.sendEmail(customer.email, `Ticket Created: ${ticket.id}`, 
      "Hello {{name}}, your ticket '{{title}}' has been created. Status: {{status}}.", 
      { name: customer.fullName, title: ticket.title, status: ticket.status });
    
    // Notify Admin
    await this.sendEmail("admin@nexus.ai", `New Ticket Alert: ${ticket.id}`, 
      "A new ticket '{{title}}' was created by {{customer}}. Priority: {{priority}}.", 
      { title: ticket.title, customer: customer.fullName, priority: ticket.priority });
  }

  static async notifyAssignment(ticket: Ticket, agent: User) {
    await this.sendEmail(agent.email, `Ticket Assigned: ${ticket.id}`, 
      "Hello {{name}}, you have been assigned to ticket '{{title}}'.", 
      { name: agent.fullName, title: ticket.title });
  }

  static async notifyEscalation(ticket: Ticket) {
    await this.sendEmail("admin@nexus.ai", `SLA BREACH ESCALATION: ${ticket.id}`, 
      "CRITICAL: Ticket '{{title}}' has breached SLA. Immediate action required.", 
      { title: ticket.title });
  }
}

class AIService {
  static async analyzeTicket(title: string, description: string) {
    try {
      const availableAgents = users.filter(u => u.role === "Agent").map(u => ({ id: u.id, name: u.fullName }));
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this support ticket and provide classification in JSON format.
        Title: ${title}
        Description: ${description}
        Available Agents: ${JSON.stringify(availableAgents)}
        
        Return:
        - category: (Bug, Feature, Complaint, Question)
        - priority: (Low, Medium, High, Critical)
        - summary: (One sentence summary)
        - department: (Engineering, Product, Billing, Support)
        - sentiment: (Positive, Neutral, Negative)
        - suggestedAgentId: (Pick the best agent ID from the list based on the ticket content)`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              summary: { type: Type.STRING },
              department: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              suggestedAgentId: { type: Type.STRING }
            },
            required: ["category", "priority", "summary", "department", "sentiment", "suggestedAgentId"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return null;
    }
  }

  static async suggestReply(ticket: Ticket) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a professional support response for this ticket.
        Title: ${ticket.title}
        Description: ${ticket.description}
        Category: ${ticket.category}
        Customer: ${ticket.customerName}
        
        The response should be empathetic, professional, and provide clear next steps.`,
      });
      return response.text;
    } catch (error) {
      console.error("AI Reply Error:", error);
      return "I'm sorry, I couldn't generate a reply at this time.";
    }
  }
}

// --- Express Server Setup ---

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, fullName: user.fullName }, JWT_SECRET);
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  });

  // Tickets
  app.get("/api/tickets", authenticateToken, (req: any, res) => {
    if (req.user.role === "Customer") {
      return res.json(tickets.filter(t => t.customerId === req.user.id));
    }
    if (req.user.role === "Agent") {
      // Agents only see tickets assigned to them
      return res.json(tickets.filter(t => t.assignedAgentId === req.user.id));
    }
    // Admins see everything
    res.json(tickets);
  });

  app.get("/api/tickets/:id", authenticateToken, (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets", authenticateToken, async (req: any, res) => {
    const { title, description } = req.body;
    
    // 1. AI Analysis
    const analysis = await AIService.analyzeTicket(title, description);
    
    // 2. Create Ticket
    const newTicket: Ticket = {
      id: `TIC-${1000 + tickets.length + 1}`,
      title,
      description,
      status: "Open",
      priority: analysis?.priority || "Medium",
      category: analysis?.category || "Question",
      sentiment: analysis?.sentiment,
      summary: analysis?.summary,
      suggestedAgentId: analysis?.suggestedAgentId,
      customerId: req.user.id,
      customerName: req.user.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDueDate: new Date(Date.now() + 24 * 3600000).toISOString(), // 24h SLA default
      isEscalated: false
    };
    
    tickets.push(newTicket);
    
    // 3. Notifications
    await NotificationService.notifyTicketCreated(newTicket, req.user);
    
    res.status(201).json(newTicket);
  });

  app.get("/api/agents", authenticateToken, (req: any, res) => {
    if (req.user.role !== "Admin") return res.sendStatus(403);
    const agents = users.filter(u => u.role === "Agent").map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      workload: tickets.filter(t => t.assignedAgentId === u.id && t.status !== "Closed").length
    }));
    res.json(agents);
  });

  app.post("/api/tickets/:id/resolve", authenticateToken, async (req: any, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    // Only Agent assigned or Admin can resolve
    if (req.user.role === "Agent" && ticket.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: "You are not assigned to this ticket" });
    }
    if (req.user.role === "Customer") {
      return res.status(403).json({ error: "Customers cannot resolve tickets" });
    }

    ticket.status = "Resolved";
    ticket.updatedAt = new Date().toISOString();
    
    await NotificationService.notifyStatusChange(ticket, "Resolved");
    res.json(ticket);
  });

  app.post("/api/tickets/:id/comments", authenticateToken, async (req: any, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Comment content is required" });

    // In a real app, we'd have a comments table. Here we'll just log it and maybe update ticket
    ticket.updatedAt = new Date().toISOString();
    
    // Simulate notification to the other party
    const recipient = req.user.role === "Customer" ? "Agent" : "Customer";
    await NotificationService.sendEmail(
      recipient === "Agent" ? "support@nexus.ai" : ticket.customerId,
      `New Comment on Ticket #${ticket.id}`,
      `${req.user.fullName} added a comment: "${content}"`
    );

    res.json({ message: "Comment added successfully", timestamp: new Date().toISOString() });
  });

  app.post("/api/tickets/:id/suggest-reply", authenticateToken, async (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    const reply = await AIService.suggestReply(ticket);
    res.json({ reply });
  });

  // Notifications Log (For Demo)
  app.get("/api/notifications", authenticateToken, (req, res) => {
    res.json(notificationLogs);
  });

  // Analytics
  app.get("/api/analytics", authenticateToken, (req, res) => {
    res.json({
      totalTickets: tickets.length + 153,
      resolvedToday: 12,
      avgResolutionTime: "4.2h",
      slaCompliance: "94%",
      trends: [
        { name: "Mon", tickets: 20 },
        { name: "Tue", tickets: 35 },
        { name: "Wed", tickets: 25 },
        { name: "Thu", tickets: 45 },
        { name: "Fri", tickets: 30 }
      ],
      categoryDistribution: [
        { name: "Bug", value: 45 },
        { name: "Feature", value: 25 },
        { name: "Billing", value: 20 },
        { name: "Support", value: 10 }
      ]
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
