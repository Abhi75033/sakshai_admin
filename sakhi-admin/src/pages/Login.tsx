import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Flame, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { API } from "../config";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");
            if (data.role !== "admin") throw new Error("You do not have admin access");
            login(data);
            toast.success("Welcome back, " + data.name + "!");
            navigate("/");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            {/* Background orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-yellow-500/5 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-700/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm glass-card p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/15 flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                        <Flame className="w-7 h-7 text-yellow-400" />
                    </div>
                    <h1 className="font-heading font-bold text-2xl text-white">Admin Login</h1>
                    <p className="text-white/40 text-sm mt-1">Sakhi Fragrance House</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@sakhi.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/30 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/30 transition-all"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-xs text-white/30 mt-6">
                    Admin access only. Unauthorized access is prohibited.
                </p>
            </div>
        </div>
    );
};

export default Login;
