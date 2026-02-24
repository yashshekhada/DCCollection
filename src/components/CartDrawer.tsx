import { useCart } from "@/contexts/CartContext";
import { X, ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";

const WHATSAPP_NUMBER = "919924560900";

const CartDrawer = () => {
    const { cartItems, removeFromCart, clearCart, isCartOpen, closeCart } = useCart();

    // Grand total across all items and all sizes
    const grandTotal = cartItems.reduce((acc, item) =>
        acc + item.sizes.reduce((s, sz) => s + sz.price * sz.qty, 0), 0);

    const buildWhatsAppMessage = () => {
        if (cartItems.length === 0) return "";
        const lines = cartItems.map((item, i) => {
            const codePart = item.designCode ? ` [*${item.designCode}*]` : "";
            const sizeLines = item.sizes
                .map(sz => `   ▸ ${sz.size} × ${sz.qty} = ₹${(sz.price * sz.qty).toLocaleString("en-IN")}`)
                .join("\n");
            const itemTotal = item.sizes.reduce((s, sz) => s + sz.price * sz.qty, 0);
            return `*${i + 1}. ${item.productName}*${codePart} (${item.colorName})\n${sizeLines}\n   _Subtotal: ₹${itemTotal.toLocaleString("en-IN")}_`;
        });
        const msg = `*Hello! I'm interested in ordering:*\n\n${lines.join("\n\n")}\n\n*🛒 Grand Total: ₹${grandTotal.toLocaleString("en-IN")}*\n\nPlease confirm availability. Thank you!`;
        return encodeURIComponent(msg);
    };

    const handleWhatsApp = () => {
        const msg = buildWhatsAppMessage();
        if (!msg) return;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    };

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            Inquiry Cart
                            {cartItems.length > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground font-normal">
                                    ({cartItems.length} product{cartItems.length !== 1 ? "s" : ""})
                                </span>
                            )}
                        </h2>
                    </div>
                    <button onClick={closeCart} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <p className="text-sm">Your cart is empty.</p>
                            <p className="text-xs text-center opacity-70">
                                Browse products, set quantities per size, and add them here.
                            </p>
                        </div>
                    ) : (
                        cartItems.map(item => {
                            const itemTotal = item.sizes.reduce((s, sz) => s + sz.price * sz.qty, 0);
                            return (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-border bg-card overflow-hidden"
                                >
                                    {/* Product header row */}
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 border-b border-border">
                                        {/* Thumbnail */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                                            {item.imageUrl ? (
                                                <img
                                                    src={getImageUrl(item.imageUrl)}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-5 h-5 opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Name + code + color */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm leading-tight truncate">{item.productName}</p>
                                            {item.designCode && (
                                                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                                    Code: {item.designCode}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span
                                                    className="w-3 h-3 rounded-full border border-white/30 shrink-0 inline-block"
                                                    style={{ backgroundColor: item.colorHex }}
                                                />
                                                <span className="text-xs text-muted-foreground">{item.colorName}</span>
                                            </div>
                                        </div>
                                        {/* Remove button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 p-1"
                                            title="Remove product"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Sizes breakdown */}
                                    <div className="px-3 py-2 space-y-1.5">
                                        {/* Column headers */}
                                        <div className="grid grid-cols-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/50">
                                            <span>Size</span>
                                            <span className="text-center">Qty</span>
                                            <span className="text-right">Unit Price</span>
                                            <span className="text-right">Total</span>
                                        </div>
                                        {item.sizes.map(sz => (
                                            <div key={sz.size} className="grid grid-cols-4 text-sm items-center">
                                                <span className="font-medium">{sz.size}</span>
                                                <span className="text-center text-muted-foreground">× {sz.qty}</span>
                                                <span className="text-right text-muted-foreground text-xs">
                                                    ₹{sz.price.toLocaleString("en-IN")}
                                                </span>
                                                <span className="text-right font-medium">
                                                    ₹{(sz.price * sz.qty).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        ))}
                                        {/* Item subtotal */}
                                        <div className="flex justify-between items-center pt-2 mt-1 border-t border-border/50">
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Subtotal</span>
                                            <span className="font-bold text-sm">₹{itemTotal.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer with grand total + actions */}
                {cartItems.length > 0 && (
                    <div className="border-t border-border shrink-0">
                        {/* Grand Total */}
                        <div className="flex items-center justify-between px-6 py-4 bg-muted/30">
                            <span className="text-base font-bold uppercase tracking-wide">Grand Total</span>
                            <span className="text-xl font-bold text-foreground">
                                ₹{grandTotal.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="px-6 pb-6 space-y-3">
                            <Button
                                onClick={handleWhatsApp}
                                className="w-full py-6 text-base gap-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Send Inquiry on WhatsApp
                            </Button>
                            <button
                                onClick={clearCart}
                                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors py-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
