import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Flame,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const links = [
        { name: "Dashboard", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: "Products", path: "/products", icon: <Package className="w-5 h-5" /> },
        { name: "Orders", path: "/orders", icon: <ShoppingCart className="w-5 h-5" /> },
        { name: "Users", path: "/users", icon: <Users className="w-5 h-5" /> },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path: string) =>
        path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

    const Sidebar = () => (
        <aside className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-10 px-2">
                <Flame className="w-6 h-6 text-yellow-500" />
                <div>
                    <p className="font-heading font-bold text-sm leading-tight">Sakhi Fragrance</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin Panel</p>
                </div>
            </div>
            <nav className="flex flex-col gap-1 flex-1">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.path)
                                ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        {link.icon}
                        {link.name}
                    </Link>
                ))}
            </nav>
            {/* User info + logout */}
            <div className="mt-auto border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 px-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm font-semibold">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-[11px] text-white/40 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            {/* Desktop sidebar */}
            <div className="hidden md:flex flex-col w-64 shrink-0 bg-[#111111] border-r border-white/[0.06] p-6">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <div className="relative w-64 bg-[#111111] p-6 flex flex-col h-full z-10">
                        <button className="absolute top-4 right-4 text-white/60" onClick={() => setMobileOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0f0f0f]">
                    <button
                        className="md:hidden text-white/60 hover:text-white transition-colors"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="md:hidden flex items-center gap-2">
                        <Flame className="w-5 h-5 text-yellow-500" />
                        <span className="font-heading font-bold text-sm">Admin</span>
                    </div>
                    <div className="hidden md:block" />
                    <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 font-medium">Admin</span>
                        <span className="text-sm text-white/60">{user?.name}</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
