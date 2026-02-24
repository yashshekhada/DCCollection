import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartSizeEntry {
    size: string;
    qty: number;
    price: number; // price for this size (base + extra)
}

export interface CartItem {
    id: string; // unique: productId + "-" + colorName
    productId: number;
    productName: string;
    designCode?: string;
    colorName: string;
    colorHex: string;
    sizes: CartSizeEntry[];
    imageUrl: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    cartCount: number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "dc_cart_v2";

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem(CART_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: Omit<CartItem, "id">) => {
        const id = `${item.productId}-${item.colorName}`;
        setCartItems(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing) {
                // Merge sizes: add new sizes or update qty
                const updatedSizes = [...existing.sizes];
                item.sizes.forEach(newSize => {
                    const idx = updatedSizes.findIndex(s => s.size === newSize.size);
                    if (idx >= 0) {
                        updatedSizes[idx] = { ...updatedSizes[idx], qty: updatedSizes[idx].qty + newSize.qty };
                    } else {
                        updatedSizes.push(newSize);
                    }
                });
                return prev.map(i => i.id === id ? { ...i, sizes: updatedSizes } : i);
            }
            return [...prev, { ...item, id }];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => setCartItems([]);

    // Total number of items (sum of all qtys)
    const cartCount = cartItems.reduce((acc, item) =>
        acc + item.sizes.reduce((s, sz) => s + sz.qty, 0), 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, clearCart,
            cartCount, isCartOpen,
            openCart: () => setIsCartOpen(true),
            closeCart: () => setIsCartOpen(false),
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
};
