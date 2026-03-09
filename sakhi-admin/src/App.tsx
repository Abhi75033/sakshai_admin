import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLayout from "./pages/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";

const AdminGuard = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/login" replace />;
    return <Outlet />;
};

const AppRoutes = () => {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={user?.role === "admin" ? <Navigate to="/" replace /> : <Login />} />
            <Route element={<AdminGuard />}>
                <Route element={<AdminLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<AdminProducts />} />
                    <Route path="/orders" element={<AdminOrders />} />
                    <Route path="/users" element={<AdminUsers />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => (
    <AuthProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </AuthProvider>
);

export default App;
