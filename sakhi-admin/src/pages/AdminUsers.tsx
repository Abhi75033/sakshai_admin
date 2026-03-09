import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Users, Shield, User } from "lucide-react";

import { API } from "../config";

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API}/users`, {
                    headers: { Authorization: `Bearer ${currentUser?.token}` },
                });
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            } catch (_) {
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser?.token]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-heading font-bold text-white">Users</h1>
                <p className="text-white/40 text-sm mt-0.5">{users.length} registered customers</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No users found</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                {["User", "Email", "Role", "Joined"].map((h) => (
                                    <th key={h} className="px-5 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${u.role === "admin" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/8 text-white/60"}`}>
                                                {u.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <p className="text-white/90 font-medium text-sm">{u.name}</p>
                                                <p className="text-white/30 text-xs">{u._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-white/60 text-sm">{u.email}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.role === "admin"
                                            ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                                            : "bg-white/8 text-white/50 border border-white/10"
                                            }`}>
                                            {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {u.role === "admin" ? "Admin" : "Customer"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-white/30 text-xs">
                                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
