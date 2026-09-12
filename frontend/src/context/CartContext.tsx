import React, { useState, useEffect, useContext } from 'react'

type CartItem = {
    productId: number;
    qty: number;
}
type CartContextValue = {
    items: CartItem[];
    addItem: (productId: number) => void;
    setQty: (productId: number, qty: number) => void;
    removeItem: (productId: number) => void;
}

const CART_STORAGE_KEY = 'cart';

const CartContext = React.createContext<CartContextValue | null>(null);

const readCart = (): CartItem[] => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
export const CartProvider = ({ children } : { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => readCart());

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (productId: number) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.productId === productId);
            if (existing) {
                return prev.map((item) =>
                    item.productId === productId ? { ...item, qty: item.qty + 1 } : item
                );
            };
            return [...prev, { productId, qty: 1 }]
        })
    };
    const setQty = (productId: number, qty: number) => {
        setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, qty: qty } : item)))
    };

    const removeItem = (productId: number) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId))
    };

    return (
        <CartContext.Provider value={{ items, addItem, setQty, removeItem }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart() must be used within CartProvider');
    return ctx;
}