import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
}

interface AuthContextType {
    user: AdminUser | null;
    login: (userData: AdminUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("adminInfo");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const login = (userData: AdminUser) => {
        setUser(userData);
        localStorage.setItem("adminInfo", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("adminInfo");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
