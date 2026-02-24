import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShoppingBag, Check } from "lucide-react";
import { Product, ProductVariant } from "@/types/product";
import { getImageUrl } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// Size display order
const SIZES = ["N/A", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, openCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [sizeQtys, setSizeQtys] = useState<Record<string, number>>({});
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    useEffect(() => {
        fetch(`https://thedeepcollection.com/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.variants && data.variants.length > 0) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const colorParam = urlParams.get('color');

                    let initialColor = data.variants[0].color_name;
                    if (colorParam && data.variants.some((v: any) => v.color_name === colorParam)) {
                        initialColor = colorParam;
                    }

                    setSelectedColor(initialColor);
                    setSizeQtys({});
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col pt-24 items-center justify-center">
                <Navbar />
                <div className="animate-pulse space-y-4">
                    <div className="w-64 h-8 bg-gray-200 rounded"></div>
                    <div className="w-48 h-6 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col pt-24 items-center justify-center">
                <Navbar />
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
            </div>
        );
    }

    // Group by color
    const availableVariantsForColor = product.variants?.filter(v => v.color_name === selectedColor) || [];

    const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color_name))).map(colorName => {
        return product.variants?.find(v => v.color_name === colorName);
    }).filter(Boolean) as ProductVariant[];

    const availableSizes = availableVariantsForColor.map(v => v.size).filter(Boolean) as string[];

    // Media for selected color
    const allMediaForColor = availableVariantsForColor
        .flatMap(v => v.media || [])
        .filter((m, index, self) => self.findIndex(t => t.url === m.url) === index);

    const displayMedia = allMediaForColor.length > 0
        ? allMediaForColor
        : product.image_url ? [{ url: getImageUrl(product.image_url), type: 'image' }] : [];

    const activeMedia = displayMedia[activeMediaIndex] || displayMedia[0];

    const basePrice = Number(product.is_on_sale && product.sale_price ? product.sale_price : product.price);

    const getPriceForSize = (size: string) => {
        const variant = availableVariantsForColor.find(v => v.size === size);
        return basePrice + Number(variant?.extra_price || 0);
    };

    const adjustQty = (size: string, delta: number) => {
        setSizeQtys(prev => {
            const current = prev[size] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [size]: next };
        });
    };

    const totalQtySelected = Object.values(sizeQtys).reduce((a, b) => a + b, 0);

    const handleAddToCart = () => {
        if (!product) return;

        const selectedVariant = uniqueColors.find(v => v.color_name === selectedColor);
        const colorHex = selectedVariant?.color_hex || "#000000";
        const imageUrl = displayMedia[0]?.url || product.image_url || "";

        // No sizes available on product (no-variant product)
        if (availableSizes.length === 0) {
            addToCart({
                productId: product.id,
                productName: product.name,
                designCode: product.design_code || "",
                colorName: selectedColor || "",
                colorHex,
                sizes: [{ size: "N/A", qty: 1, price: basePrice }],
                imageUrl,
            });
            toast.success("Added to cart!", { action: { label: "View Cart", onClick: openCart } });
            return;
        }

        const selectedSizeEntries = availableSizes
            .filter(size => (sizeQtys[size] || 0) > 0)
            .map(size => ({ size, qty: sizeQtys[size], price: getPriceForSize(size) }));

        if (selectedSizeEntries.length === 0) {
            toast.error("Please add at least one size quantity");
            return;
        }

        addToCart({
            productId: product.id,
            productName: product.name,
            designCode: product.design_code || "",
            colorName: selectedColor || "",
            colorHex,
            sizes: selectedSizeEntries,
            imageUrl,
        });

        toast.success("Added to cart!", { action: { label: "View Cart", onClick: openCart } });
        setSizeQtys({});
    };

    const hasVariants = uniqueColors.length > 0;
    const hasSizes = availableSizes.length > 0 && !(availableSizes.length === 1 && availableSizes[0] === "N/A");

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="container mx-auto px-6 py-24 flex-1">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Media Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-[3/4] md:aspect-square bg-muted rounded-xl overflow-hidden border border-border/50">
                            {activeMedia ? (
                                activeMedia.type === 'youtube' ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={activeMedia.url.includes('watch?v=')
                                            ? activeMedia.url.replace('watch?v=', 'embed/')
                                            : activeMedia.url}
                                        title={`${product.name} video`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <img
                                        src={getImageUrl(activeMedia.url)}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                                    No Image Available
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {displayMedia.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {displayMedia.map((m, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMediaIndex(idx)}
                                        className={`shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${activeMediaIndex === idx ? 'border-foreground shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        {m.type === 'youtube' ? (
                                            <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-500">
                                                <div className="text-[10px] font-bold">VIDEO</div>
                                            </div>
                                        ) : (
                                            <img src={getImageUrl(m.url)} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col pt-4">
                        {product.category && (
                            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 border border-border px-3 py-1 rounded-full w-fit">
                                {product.category}
                            </span>
                        )}

                        {product.design_code && (
                            <p className="text-sm font-mono text-muted-foreground mb-2">Code: {product.design_code}</p>
                        )}

                        <h1 className="text-3xl md:text-4xl font-heading mb-4 text-foreground">{product.name}</h1>

                        <div className="text-2xl mb-8 flex items-center gap-3">
                            <span className="font-semibold text-foreground">
                                ₹{basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            {product.is_on_sale && product.sale_price && (
                                <span className="text-lg text-muted-foreground line-through">
                                    ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                            )}
                            {product.is_on_sale && product.sale_price && (
                                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded uppercase tracking-wider">Sale</span>
                            )}
                        </div>

                        <p className="text-muted-foreground leading-relaxed mb-10 whitespace-pre-wrap">
                            {product.description || "No description available."}
                        </p>

                        {/* Color Selection */}
                        {hasVariants && (
                            <div className="mb-6">
                                <span className="block text-sm font-semibold uppercase tracking-wider mb-4">
                                    Color: <span className="text-muted-foreground ml-2 font-normal">{selectedColor}</span>
                                </span>
                                <div className="flex flex-wrap gap-4">
                                    {uniqueColors.map((variant, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedColor(variant.color_name);
                                                setActiveMediaIndex(0);
                                                setSizeQtys({});
                                            }}
                                            className={`group relative w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === variant.color_name
                                                ? 'border-foreground border-[3px] scale-110 shadow-md'
                                                : 'border-transparent shadow-sm hover:scale-105'}`}
                                            title={variant.color_name}
                                        >
                                            <div
                                                className="w-full h-full rounded-full border border-gray-200"
                                                style={{ backgroundColor: variant.color_hex }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Quantity Steppers */}
                        {hasSizes && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-semibold uppercase tracking-wider">Select Sizes & Quantity</span>
                                    {totalQtySelected > 0 && (
                                        <button
                                            onClick={() => setSizeQtys({})}
                                            className="text-xs text-muted-foreground hover:text-foreground underline"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {SIZES.map(size => {
                                        const isAvailable = availableSizes.includes(size);
                                        if (!isAvailable) return null;
                                        const qty = sizeQtys[size] || 0;
                                        const extra = getPriceForSize(size) - basePrice;

                                        return (
                                            <div
                                                key={size}
                                                className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${qty > 0
                                                        ? 'border-foreground bg-foreground/5'
                                                        : 'border-border bg-transparent'
                                                    }`}
                                            >
                                                {/* Size label */}
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-semibold text-sm w-10 ${qty > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {size}
                                                    </span>
                                                    {extra > 0 && (
                                                        <span className="text-xs text-muted-foreground">+₹{extra}</span>
                                                    )}
                                                </div>

                                                {/* - qty + stepper */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustQty(size, -1)}
                                                        disabled={qty === 0}
                                                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg leading-none transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        −
                                                    </button>
                                                    <span className={`w-6 text-center font-semibold text-sm tabular-nums ${qty > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustQty(size, 1)}
                                                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg leading-none transition-colors hover:bg-muted"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <Button
                            onClick={handleAddToCart}
                            disabled={hasSizes && totalQtySelected === 0}
                            className="w-full py-6 text-base tracking-wide flex items-center justify-center gap-3"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {totalQtySelected > 0
                                ? `Add to Cart (${totalQtySelected} pcs)`
                                : "Add to Cart"}
                        </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetail;
