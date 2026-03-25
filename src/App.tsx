import { GoogleGenAI, Type } from "@google/genai";
import React, { useState, useEffect, createContext, useContext } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart as PieChartIcon, 
  Bell, 
  Settings, 
  LogOut,
  Plus,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Filter,
  Calendar,
  DollarSign,
  Target,
  Mail,
  History
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
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const safeFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    if (contentType && contentType.includes("application/json")) {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    }
    const error: any = new Error(errorMessage);
    error.status = res.status;
    throw error;
  }
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return null;
};

const safeFormat = (dateStr: any, formatStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";
  return format(date, formatStr);
};

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
      const data = await safeFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
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
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0F1115] text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

// --- Components ---

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Wallet, label: "Transactions", path: "/transactions" },
    { icon: Target, label: "Budgets", path: "/budgets" },
    { icon: Sparkles, label: "AI Insights", path: "/insights" },
    { icon: Mail, label: "Notifications", path: "/notifications" },
  ];

  return (
    <div className="w-64 bg-[#0F1115] text-white h-screen flex flex-col border-r border-white/5">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight leading-none uppercase">Finance AI</span>
          <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mt-1">Smart Advisor</span>
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
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
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
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs">
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
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
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
  const [email, setEmail] = useState("mishrahitesh90616@gmail.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (success) navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#151619] border border-white/5 p-10 rounded-[32px] shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Finance AI</h2>
          <p className="text-gray-500 mt-2 text-sm text-center">Enterprise-grade AI Financial Advisor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
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
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const DashboardHome = () => {
  const { token, logout } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { "Authorization": `Bearer ${token}` };
        const [tData, bData, iData] = await Promise.all([
          safeFetch("/api/transactions", { headers }),
          safeFetch("/api/budgets", { headers }),
          safeFetch("/api/insights", { headers })
        ]);
        setTransactions(tData || []);
        setBudgets(bData || []);
        setInsights(iData || []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        if (err.status === 401 || err.status === 403) {
          toast.error("Session expired. Please sign in again.");
          logout();
        } else {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, logout]);

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  const totalIncome = transactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const categoryData = transactions
    .filter(t => t.type === "Expense")
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const trendData = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], t) => {
      const date = format(new Date(t.date), "MMM d");
      const existing = acc.find(item => item.date === date);
      if (existing) {
        if (t.type === "Income") existing.income += t.amount;
        else existing.expense += t.amount;
      } else {
        acc.push({ 
          date, 
          income: t.type === "Income" ? t.amount : 0, 
          expense: t.type === "Expense" ? t.amount : 0 
        });
      }
      return acc;
    }, []);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Balance", value: `$${balance.toLocaleString()}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Monthly Income", value: `$${totalIncome.toLocaleString()}`, icon: ArrowUpRight, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Monthly Expenses", value: `$${totalExpense.toLocaleString()}`, icon: ArrowDownLeft, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
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
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cash Flow Trends</h3>
              <p className="text-sm text-gray-400">Income vs Expenses over time</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h3>
          <div className="flex-1 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs font-bold text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {transactions.slice(-5).reverse().map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    t.type === "Income" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  )}>
                    {t.type === "Income" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.description}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.category} • {safeFormat(t.date, "MMM d")}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  t.type === "Income" ? "text-emerald-600" : "text-red-600"
                )}>
                  {t.type === "Income" ? "+" : "-"}${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Preview */}
        <div className="bg-[#0F1115] text-white p-8 rounded-[40px] shadow-2xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                AI Smart Insights
              </h3>
              <Link to="/insights" className="text-xs font-bold text-emerald-500 hover:underline">Full Report</Link>
            </div>
            
            <div className="space-y-4">
              {insights.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No insights generated yet.</p>
                  <button className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold">Generate Now</button>
                </div>
              ) : (
                insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        insight.type === "Alert" ? "bg-red-500" : "bg-emerald-500"
                      )}></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{insight.type}</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">{insight.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionsView = () => {
  const { token, logout } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ amount: "", type: "Expense", category: "Dining", description: "", date: format(new Date(), "yyyy-MM-dd") });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    safeFetch("/api/transactions", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(data => setTransactions(data || []))
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          toast.error("Session expired. Please sign in again.");
          logout();
        } else {
          toast.error("Failed to load transactions");
        }
      });
  }, [token, logout]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await safeFetch("/api/transactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTx, amount: parseFloat(newTx.amount) })
      });
      setTransactions([...transactions, data]);
      setShowAddModal(false);
      setNewTx({ amount: "", type: "Expense", category: "Dining", description: "", date: format(new Date(), "yyyy-MM-dd") });
      toast.success("Transaction added successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Transactions</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Description</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Date</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Type</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.slice().reverse().map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/80 transition-all">
                <td className="px-8 py-6 font-bold text-gray-900">{t.description}</td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full uppercase tracking-wider">{t.category}</span>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{safeFormat(t.date, "MMM d, yyyy")}</td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    t.type === "Income" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>{t.type}</span>
                </td>
                <td className={cn(
                  "px-8 py-6 font-bold",
                  t.type === "Income" ? "text-emerald-600" : "text-red-600"
                )}>
                  {t.type === "Income" ? "+" : "-"}${t.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Add Transaction</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</label>
                  <select 
                    value={newTx.type}
                    onChange={e => setNewTx({...newTx, type: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
                  <input 
                    type="number"
                    required
                    value={newTx.amount}
                    onChange={e => setNewTx({...newTx, amount: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <input 
                  type="text"
                  required
                  value={newTx.category}
                  onChange={e => setNewTx({...newTx, category: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                  placeholder="e.g., Dining, Rent, Salary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <input 
                  type="text"
                  required
                  value={newTx.description}
                  onChange={e => setNewTx({...newTx, description: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                  placeholder="What was this for?"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const BudgetsView = () => {
  const { token, logout } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: "", amount: "", period: "Monthly" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { "Authorization": `Bearer ${token}` };
        const [bData, tData] = await Promise.all([
          safeFetch("/api/budgets", { headers }),
          safeFetch("/api/transactions", { headers })
        ]);
        setBudgets(bData || []);
        setTransactions(tData || []);
      } catch (err: any) {
        if (err.status === 401 || err.status === 403) {
          toast.error("Session expired. Please sign in again.");
          logout();
        } else {
          toast.error("Failed to load budget data");
        }
      }
    };
    fetchData();
  }, [token, logout]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await safeFetch("/api/budgets", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...newBudget, amount: parseFloat(newBudget.amount) })
      });
      setBudgets([...budgets, data]);
      setShowAddModal(false);
      setNewBudget({ category: "", amount: "", period: "Monthly" });
      toast.success("Budget set successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSpent = (category: string) => {
    return transactions
      .filter(t => t.category === category && t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Budget Management</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Set New Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {budgets.map((budget) => {
          const spent = getSpent(budget.category);
          const percent = Math.min((spent / budget.amount) * 100, 100);
          const isOver = spent > budget.amount;

          return (
            <motion.div 
              key={budget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{budget.category}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{budget.period}</p>
                  </div>
                </div>
                {isOver && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-500">Progress</span>
                  <span className={cn(isOver ? "text-red-500" : "text-emerald-500")}>
                    {percent.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isOver ? "bg-red-500" : percent > 80 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent</span>
                  <span className="text-lg font-bold text-gray-900">${spent.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget</span>
                  <span className="text-lg font-bold text-gray-900">${budget.amount.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Set Budget</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <input 
                  type="text"
                  required
                  value={newBudget.category}
                  onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                  placeholder="e.g., Dining, Shopping, Travel"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
                  <input 
                    type="number"
                    required
                    value={newBudget.amount}
                    onChange={e => setNewBudget({...newBudget, amount: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Period</label>
                  <select 
                    value={newBudget.period}
                    onChange={e => setNewBudget({...newBudget, period: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? "Setting..." : "Set Budget"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const InsightsView = () => {
  const { token, logout } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    safeFetch("/api/insights", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(data => setInsights(data || []))
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          toast.error("Session expired. Please sign in again.");
          logout();
        } else {
          toast.error("Failed to load insights");
        }
      });
  }, [token, logout]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [transactions, budgets] = await Promise.all([
        safeFetch("/api/transactions", { headers }),
        safeFetch("/api/budgets", { headers })
      ]);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Act as a Senior Financial Advisor. Analyze the following financial data and provide 3-4 actionable insights.
        
        Transactions: ${JSON.stringify(transactions)}
        Budgets: ${JSON.stringify(budgets)}
        
        Focus on:
        1. Spending patterns (e.g., "You spend X% on Y category").
        2. Budget utilization (e.g., "You are close to exceeding Z budget").
        3. Savings strategies.
        4. Anomalies or overspending.
        
        Return the response in JSON format with an array of insights, each having:
        - type: "Recommendation" | "Alert" | "Strategy"
        - content: string (the insight message)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["type", "content"]
                }
              }
            },
            required: ["insights"]
          }
        }
      });

      const aiData = JSON.parse(response.text);
      
      // Save generated insights to backend
      const savedInsights = await safeFetch("/api/insights", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ insights: aiData.insights })
      });

      setInsights([...savedInsights, ...insights]);
      toast.success("AI Insights generated!");
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      toast.error(err.message || "Failed to generate AI insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">AI Financial Insights</h2>
          <p className="text-gray-500 mt-1">Personalized recommendations powered by Nexus AI</p>
        </div>
        <button 
          onClick={generateInsights}
          disabled={loading}
          className="px-8 py-3 bg-[#0F1115] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 text-emerald-500" />
          {loading ? "Analyzing..." : "Generate New Insights"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {insights.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest">No insights yet. Click generate to start.</p>
          </div>
        ) : (
          insights.map((insight, i) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-all"
            >
              <div className={cn(
                "p-4 rounded-2xl",
                insight.type === "Alert" ? "bg-red-50 text-red-500" : 
                insight.type === "Recommendation" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
              )}>
                {insight.type === "Alert" ? <AlertCircle className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      insight.type === "Alert" ? "bg-red-50 text-red-600" : 
                      insight.type === "Recommendation" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>{insight.type}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{safeFormat(insight.timestamp, "MMM d, h:mm a")}</span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 font-medium leading-relaxed">
                  <ReactMarkdown>{insight.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const NotificationsView = () => {
  const { token, logout } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    safeFetch("/api/notifications", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(data => setLogs(data || []))
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          toast.error("Session expired. Please sign in again.");
          logout();
        } else {
          toast.error("Failed to load notifications");
        }
      });
  }, [token, logout]);

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
          logs.slice().reverse().map((log, i) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-all"
            >
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500">
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
                      <Route path="/transactions" element={<><Header title="Financial Transactions" /><TransactionsView /></>} />
                      <Route path="/budgets" element={<><Header title="Budget Tracking" /><BudgetsView /></>} />
                      <Route path="/insights" element={<><Header title="AI Financial Advisor" /><InsightsView /></>} />
                      <Route path="/notifications" element={<><Header title="System Notifications" /><NotificationsView /></>} />
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
