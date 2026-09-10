import React from 'react';
import { useState, useEffect, useContext } from "react";
import { me, login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth.ts'

import type {components} from "../types/api";

type User = components['schemas']['User'];
type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const restoreSession = async () => {
            const currentUser = await me();
            setUser(currentUser);
            setIsLoading(false)
        }
        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        const currentUser = await apiLogin({ email, password });
        setUser(currentUser);
    }

    const register = async (email: string, password: string) => {
        const currentUser = await apiRegister({ email, password });
        setUser(currentUser);
    }

    const logout = async () => {
        await apiLogout();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within a AuthProvider");
    return ctx;
}