import React, { useState, useEffect, createContext, useContext } from "react";
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  Bell,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Mail,
  History,
  Send,
  Filter,
  MoreVertical,
  Paperclip,
  UserPlus
} from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "motion/react";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Auth Context ---
const AuthContext = createContext<any>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Protected Route ---
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const safeFormat = (dateStr: any, formatStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";
  return format(date, formatStr);
};

// --- Components ---

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["Admin", "Agent", "Customer"] },
    { icon: Ticket, label: "Tickets", path: "/tickets", roles: ["Admin", "Agent", "Customer"] },
    { icon: PlusCircle, label: "New Ticket", path: "/new", roles: ["Customer"] },
    { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["Admin", "Agent"] },
    { icon: Mail, label: "Notifications", path: "/notifications", roles: ["Admin", "Agent"] },
    { icon: ShieldCheck, label: "Admin", path: "/admin", roles: ["Admin"] },
  ].filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <div className="w-64 bg-[#0F1115] text-white h-screen flex flex-col border-r border-white/5">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight leading-none">NEXUS AI</span>
          <span className="text-[10px] text-orange-500 font-bold tracking-widest uppercase mt-1">Smart Support</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-gray-500 group-hover:text-white")} />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 font-bold text-xs">
              {user.fullName[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate">{user.fullName}</span>
              <span className="text-[10px] text-gray-500 uppercase font-bold">{user.role}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-500" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const Header = ({ title }: { title: string }) => {
  return (
    <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tickets, customers..." 
            className="pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 w-72 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

// --- Views ---

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("agent@nexus.ai");
  const [password, setPassword] = useState("agent123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (success) navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#151619] border border-white/5 p-10 rounded-[32px] shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your Nexus AI account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Demo Accounts: <br/>
            <span className="text-orange-500/80 font-bold">admin@nexus.ai / admin123 (Admin)</span><br/>
            <span className="text-orange-500/80">agent@nexus.ai / agent123 (Agent)</span><br/>
            <span className="text-orange-500/80">alice@example.com / cust123 (Customer)</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const DashboardHome = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { "Authorization": `Bearer ${token}` };
      const [sRes, tRes] = await Promise.all([
        fetch("/api/analytics", { headers }),
        fetch("/api/tickets", { headers })
      ]);
      setStats(await sRes.json());
      setRecentTickets(await tRes.json());

      if (user.role === "Admin") {
        const aRes = await fetch("/api/agents", { headers });
        setAgents(await aRes.json());
      }
    };
    fetchData();
  }, [token, user.role]);

  if (!stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Tickets", value: stats.totalTickets, icon: Ticket, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Resolved Today", value: stats.resolvedToday, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Avg Resolution", value: stats.avgResolutionTime, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "SLA Compliance", value: stats.slaCompliance, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ticket Volume Trends</h3>
              <p className="text-sm text-gray-400">Daily incoming support requests</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="#f97316" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#f97316', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Workload or Recent Activity */}
        {user.role === "Admin" ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Agent Workload</h3>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              {agents.map((agent) => (
                <div key={agent.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{agent.fullName}</span>
                    <span className="text-xs font-bold text-orange-500">{agent.workload} Active</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${Math.min((agent.workload / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900">Priority Tickets</h3>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">Live</span>
            </div>
            <div className="space-y-5 flex-1 overflow-y-auto pr-2">
              {recentTickets.map((ticket, i) => (
                <Link 
                  key={ticket.id} 
                  to={`/tickets/${ticket.id}`}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100"
                >
                  <div className={cn(
                    "w-2.5 h-2.5 mt-2 rounded-full shadow-sm",
                    ticket.priority === "High" || ticket.priority === "Critical" ? "bg-red-500 animate-pulse" : "bg-orange-500"
                  )} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{ticket.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ticket.customerName}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{safeFormat(ticket.createdAt, "h:mm a")}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            <Link to="/tickets" className="w-full mt-8 py-4 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all text-center">
              View All Tickets
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const CreateTicket = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      toast.success("Ticket created and AI-analyzed!");
      navigate(`/tickets/${data.id}`);
    } catch (err) {
      toast.error("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Ticket</h2>
        <p className="text-gray-500 mt-1">Our AI will automatically classify, prioritize, and summarize your request.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ticket Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Cannot access billing dashboard"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none text-gray-900 font-medium"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Description</label>
            <textarea 
              rows={8}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the issue in detail. Include error messages if any..."
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none text-gray-900 font-medium resize-none"
            />
          </div>
          
          <div className="flex items-center gap-4 pt-4">
             <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
               <Paperclip className="w-6 h-6" />
             </button>
             <button 
              onClick={handleCreate}
              disabled={loading || !formData.title || !formData.description}
              className="flex-1 py-5 bg-[#0F1115] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-30 shadow-xl shadow-black/10"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-orange-500 p-8 rounded-[40px] text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">AI Smart Assist</h3>
              </div>
              <p className="text-orange-100 text-sm leading-relaxed mb-8">
                Nexus AI will automatically notify the correct department and assign a priority based on your description.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Classification", desc: "Auto-categorize bugs vs features" },
                  { label: "SLA Prediction", desc: "Estimated resolution time" },
                  { label: "Smart Routing", desc: "Assign to the best available agent" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-orange-200" />
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-orange-100 opacity-70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">SLA Policy</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-500">CRITICAL</span>
                <span className="text-xs font-bold text-red-600">4 Hours</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-500">HIGH</span>
                <span className="text-xs font-bold text-orange-600">12 Hours</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-500">MEDIUM</span>
                <span className="text-xs font-bold text-blue-600">24 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketList = () => {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/tickets", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.json()).then(setTickets);
  }, [token]);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tickets</h2>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tickets.length} Active</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {user.role === "Customer" && (
            <Link to="/new" className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
              <PlusCircle className="w-4 h-4" />
              New Ticket
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ticket Details</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Priority</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">SLA Deadline</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence>
              {tickets.map((ticket, i) => (
                <motion.tr 
                  key={ticket.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50/80 transition-all cursor-pointer group"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-base">{ticket.title}</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">{ticket.category}</span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{ticket.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                      ticket.status === "Open" ? "bg-blue-50 text-blue-600" : 
                      ticket.status === "InProgress" ? "bg-orange-50 text-orange-600" :
                      "bg-green-50 text-green-600"
                    )}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                      ticket.priority === "High" || ticket.priority === "Critical" ? "bg-red-50 text-red-600" : 
                      ticket.priority === "Medium" ? "bg-orange-50 text-orange-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                        {ticket.customerName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{ticket.customerName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-600">{safeFormat(ticket.slaDueDate, "MMM d")}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{safeFormat(ticket.slaDueDate, "h:mm a")}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="p-2 hover:bg-white rounded-xl transition-all inline-block shadow-sm opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TicketDetail = () => {
  const { token, user } = useAuth();
  const { id } = useLocation().pathname.split('/').pop() as any;
  const [ticket, setTicket] = useState<any>(null);
  const [suggestedReply, setSuggestedReply] = useState<string>("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [comment, setComment] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { "Authorization": `Bearer ${token}` };
      const tRes = await fetch(`/api/tickets/${id}`, { headers });
      const tData = await tRes.json();
      setTicket(tData);

      if (user.role === "Admin") {
        const aRes = await fetch("/api/agents", { headers });
        setAgents(await aRes.json());
      }
    };
    fetchData();
  }, [id, token, user.role]);

  const handleAssign = async (agentId: string) => {
    setAssigning(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/assign`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ agentId })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTicket(data);
      toast.success("Ticket assigned successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleResolve = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/resolve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTicket(data);
      toast.success("Ticket resolved successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Comment added successfully");
      setComment("");
      // Refresh ticket to show update time
      const tRes = await fetch(`/api/tickets/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setTicket(await tRes.json());
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const generateReply = async () => {
    setLoadingReply(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/suggest-reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSuggestedReply(data.reply);
    } catch (err) {
      toast.error("Failed to generate reply");
    } finally {
      setLoadingReply(false);
    }
  };

  if (!ticket || ticket.error) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest py-20">Ticket not found or loading...</div>;

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/tickets" className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
            <ChevronRight className="w-6 h-6 rotate-180 text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{ticket.title}</h2>
              <span className={cn(
                "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                ticket.priority === "High" || ticket.priority === "Critical" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
              )}>
                {ticket.priority} Priority
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ticket #{ticket.id}</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Created {safeFormat(ticket.createdAt, "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {user.role === "Admin" && (
            <div className="relative group">
              <button className="px-8 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {ticket.assignedAgentId ? "Reassign Agent" : "Assign Agent"}
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest p-3 border-b border-gray-50">Select Agent</p>
                <div className="max-h-64 overflow-y-auto">
                  {agents.map(agent => (
                    <button 
                      key={agent.id}
                      onClick={() => handleAssign(agent.id)}
                      disabled={assigning}
                      className={cn(
                        "w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-between group/item",
                        ticket.assignedAgentId === agent.id && "bg-orange-50"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{agent.fullName}</span>
                        <span className="text-[10px] text-gray-400">{agent.workload} Active Tickets</span>
                      </div>
                      {ticket.suggestedAgentId === agent.id && (
                        <Sparkles className="w-4 h-4 text-orange-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {user.role !== "Customer" && ticket.status !== "Resolved" && (
            <button 
              onClick={handleResolve}
              className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
            >
              Resolve Ticket
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Summary Card */}
          {ticket.summary && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-500 p-8 rounded-[40px] text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">AI Smart Summary</h3>
                  </div>
                  {user.role === "Admin" && ticket.suggestedAgentId && !ticket.assignedAgentId && (
                    <div className="bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
                      <UserPlus className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase">AI Recommended: {agents.find(a => a.id === ticket.suggestedAgentId)?.fullName}</span>
                    </div>
                  )}
                </div>
                <p className="text-lg font-medium leading-relaxed italic">"{ticket.summary}"</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-bold uppercase">Sentiment:</span>
                    <span className="text-[10px] font-bold uppercase text-orange-200">{ticket.sentiment}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-bold uppercase">Category:</span>
                    <span className="text-[10px] font-bold uppercase text-orange-200">{ticket.category}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              Original Request
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg font-medium">{ticket.description}</p>
            
            <div className="mt-10 pt-10 border-t border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  AI Suggested Response
                </h3>
                <button 
                  onClick={generateReply}
                  disabled={loadingReply}
                  className="flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-widest"
                >
                  <History className="w-4 h-4" />
                  {suggestedReply ? "Regenerate" : "Generate Now"}
                </button>
              </div>

              {loadingReply ? (
                <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                </div>
              ) : suggestedReply ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-orange-50 p-8 rounded-[32px] border border-orange-100"
                >
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">{suggestedReply}</p>
                  <div className="mt-8 flex gap-4">
                    <button 
                      onClick={() => {
                        setComment(suggestedReply);
                        setSuggestedReply("");
                      }}
                      className="px-6 py-3 bg-orange-500 text-white text-xs font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      Use this Response
                    </button>
                    <button className="px-6 py-3 bg-white border border-orange-200 text-orange-600 text-xs font-bold rounded-2xl hover:bg-orange-100 transition-all">
                      Copy to Clipboard
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">AI Ready</p>
                  <p className="text-gray-400 text-xs mt-1">Click generate to get a professional response suggestion.</p>
                </div>
              )}
            </div>
          </div>

          {/* Discussion */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 px-4">Discussion</h3>
            <div className="space-y-4">
              {/* Original Message */}
              <div className="flex gap-4 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 font-bold text-sm shrink-0">
                  {ticket.customerName[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{ticket.customerName}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{safeFormat(ticket.createdAt, "MMM d, h:mm a")}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{ticket.description}</p>
                </div>
              </div>

              {/* Reply Form */}
              <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 font-bold text-sm shrink-0">
                    {user.fullName[0]}
                  </div>
                  <form onSubmit={handleAddComment} className="flex-1 space-y-4">
                    <textarea 
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none text-sm font-medium"
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                         <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                           <Paperclip className="w-5 h-5" />
                         </button>
                         {user.role !== "Customer" && (
                           <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-orange-500 transition-all uppercase tracking-widest">
                             <ShieldCheck className="w-4 h-4" />
                             Internal Note
                           </button>
                         )}
                      </div>
                      <button type="submit" className="px-6 py-2.5 bg-[#0F1115] text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10">
                        <Send className="w-4 h-4" />
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* SLA Card */}
          <div className="bg-[#0F1115] text-white p-8 rounded-[40px] shadow-2xl shadow-black/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  SLA Status
                </h3>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">Active</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-3">
                    <span className="text-gray-400 uppercase tracking-widest">Time Remaining</span>
                    <span className="text-orange-500">1h 42m</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                    ></motion.div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Deadline</p>
                    <p className="text-sm font-bold">{safeFormat(ticket.slaDueDate, "MMM d")}</p>
                    <p className="text-[10px] font-bold text-gray-400">{safeFormat(ticket.slaDueDate, "h:mm a")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Policy</p>
                    <p className="text-sm font-bold">Standard</p>
                    <p className="text-[10px] font-bold text-gray-400">24h Resolution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Profile</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 font-bold text-xl shadow-sm">
                {ticket.customerName.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{ticket.customerName}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Member</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              {[
                { label: "Email", value: "alice@example.com", icon: Mail },
                { label: "Company", value: "Acme Global", icon: LayoutDashboard },
                { label: "Member Since", value: "Jan 2024", icon: Clock }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <item.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold text-gray-700">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-10 py-4 border border-gray-100 text-gray-500 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <History className="w-4 h-4" />
              View Ticket History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/notifications", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.json()).then(setLogs);
  }, [token]);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Notification Logs</h2>
        <p className="text-gray-500 mt-1">Audit trail of all system-generated emails and alerts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <Mail className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest">No notifications yet</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-all"
            >
              <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{log.subject}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">To: {log.recipient}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{safeFormat(log.timestamp, "MMM d, h:mm a")}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-sm text-gray-600 font-medium leading-relaxed italic">"{log.content}"</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans antialiased text-gray-900 bg-[#F8F9FA]">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <Routes>
                      <Route path="/" element={<><Header title="Dashboard Overview" /><DashboardHome /></>} />
                      <Route path="/tickets" element={<><Header title="Ticket Management" /><TicketList /></>} />
                      <Route path="/tickets/:id" element={<><Header title="Ticket Details" /><TicketDetail /></>} />
                      <Route path="/new" element={<ProtectedRoute roles={["Customer"]}><Header title="Create Ticket" /><CreateTicket /></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute roles={["Admin", "Agent"]}><Header title="Notification Logs" /><NotificationCenter /></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute roles={["Admin", "Agent"]}><Header title="System Analytics" /><div className="p-8">Analytics View (WIP)</div></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><Header title="Admin Console" /><div className="p-8">Admin View (WIP)</div></ProtectedRoute>} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </div>
      </Router>
    </AuthProvider>
  );
}
