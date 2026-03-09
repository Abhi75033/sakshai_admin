import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { ShoppingCart, ChevronDown } from "lucide-react";

import { API } from "../config";

const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

const badgeClass: Record<string, string> = {
    Processing: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
    Shipped: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
    Delivered: "bg-green-500/15 text-green-400 border border-green-500/25",
    Cancelled: "bg-red-500/15 text-red-400 border border-red-500/25",
};

const AdminOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/orders`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (_) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user?.token]);

    const handleStatusChange = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`${API}/orders/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-heading font-bold text-white">Orders</h1>
                <p className="text-white/40 text-sm mt-0.5">{orders.length} total orders</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No orders yet</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date"].map((h) => (
                                        <th key={h} className="px-5 py-4 text-white/40 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs text-white/50">#{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-5 py-4 text-white/80 whitespace-nowrap">{order.user?.name || "—"}</td>
                                        <td className="px-5 py-4 text-white/60">{order.orderItems?.length || 0} items</td>
                                        <td className="px-5 py-4 text-white font-medium whitespace-nowrap">₹{order.totalPrice}</td>
                                        <td className="px-5 py-4 text-white/50 text-xs whitespace-nowrap">{order.paymentMethod}</td>
                                        <td className="px-5 py-4">
                                            <div className="relative flex items-center gap-1.5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass[order.status] || "bg-white/10 text-white/60"}`}>
                                                    {order.status}
                                                </span>
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        disabled={updatingId === order._id}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        className="appearance-none bg-white/5 border border-white/10 text-white/50 text-xs rounded-lg px-2 py-1 pr-5 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {statusOptions.map((s) => (
                                                            <option key={s} value={s} className="bg-[#141414]">{s}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
