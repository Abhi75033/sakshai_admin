import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    ShoppingCart,
    Package,
    Users,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    Truck,
} from "lucide-react";

import { API } from "../config";

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalUsers: number;
    recentOrders: any[];
}

const StatCard = ({
    title,
    value,
    icon,
    color,
    sub,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    sub?: string;
}) => (
    <div className="glass-card p-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${color} blur-3xl opacity-20`} />
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center mb-4 border border-white/10`}>
            {icon}
        </div>
        <p className="text-3xl font-heading font-bold text-white mb-1">{value}</p>
        <p className="text-sm font-medium text-white/60">{title}</p>
        {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
);

const statusColors: Record<string, string> = {
    Processing: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Shipped: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Delivered: "bg-green-500/20 text-green-400 border border-green-500/30",
    Cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const statusIcons: Record<string, React.ReactNode> = {
    Processing: <Clock className="w-3 h-3" />,
    Shipped: <Truck className="w-3 h-3" />,
    Delivered: <CheckCircle className="w-3 h-3" />,
    Cancelled: <Clock className="w-3 h-3" />,
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalUsers: 0,
        recentOrders: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const headers = { Authorization: `Bearer ${user?.token}` };
                const [ordersRes, productsRes, usersRes] = await Promise.all([
                    fetch(`${API}/orders`, { headers }),
                    fetch(`${API}/products`),
                    fetch(`${API}/users`, { headers }),
                ]);
                const orders = await ordersRes.json();
                const products = await productsRes.json();
                const users = await usersRes.json();

                const revenue = Array.isArray(orders)
                    ? orders.reduce((s: number, o: any) => s + (o.totalPrice || 0), 0)
                    : 0;

                setStats({
                    totalOrders: Array.isArray(orders) ? orders.length : 0,
                    totalRevenue: revenue,
                    totalProducts: Array.isArray(products) ? products.length : 0,
                    totalUsers: Array.isArray(users) ? users.length : 0,
                    recentOrders: Array.isArray(orders) ? orders.slice(0, 8) : [],
                });
            } catch (_) {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user?.token]);

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            </div>
        );

    return (
        <div>
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/40 text-sm mb-8">Welcome back, {user?.name}! Here's what's happening.</p>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart className="w-6 h-6 text-blue-400" />} color="bg-blue-500" />
                <StatCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-green-400" />} color="bg-green-500" sub="All time" />
                <StatCard title="Products" value={stats.totalProducts} icon={<Package className="w-6 h-6 text-yellow-400" />} color="bg-yellow-500" />
                <StatCard title="Customers" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-purple-400" />} color="bg-purple-500" />
            </div>

            {/* Recent Orders */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <h2 className="font-heading font-semibold text-white">Recent Orders</h2>
                </div>
                {stats.recentOrders.length === 0 ? (
                    <p className="text-center text-white/30 py-8 text-sm">No orders yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="pb-3 text-white/40 font-medium text-xs uppercase tracking-wider">Order ID</th>
                                    <th className="pb-3 text-white/40 font-medium text-xs uppercase tracking-wider">Customer</th>
                                    <th className="pb-3 text-white/40 font-medium text-xs uppercase tracking-wider">Total</th>
                                    <th className="pb-3 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                                    <th className="pb-3 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 text-white/60 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="py-3 text-white/80">{order.user?.name || "—"}</td>
                                        <td className="py-3 text-white font-medium">₹{order.totalPrice}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-white/10 text-white/60"}`}>
                                                {statusIcons[order.status]}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-white/40 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
