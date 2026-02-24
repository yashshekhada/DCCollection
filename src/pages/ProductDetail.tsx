import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { Product, ProductVariant } from "@/types/product";
import { getImageUrl } from "@/lib/utils";

// Assuming sizes are consistent with what's defined in Admin
const SIZES = ["N/A", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>("M");
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    useEffect(() => {
        fetch(`http://localhost:3000/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.variants && data.variants.length > 0) {
                    setSelectedColor(data.variants[0].color_name);
                    setSelectedSize(data.variants[0].size || "N/A");
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

    // Find current variant based on color and size selection
    const availableVariantsForColor = product.variants?.filter(v => v.color_name === selectedColor) || [];
    const currentVariant = availableVariantsForColor.find(v => v.size === selectedSize) || availableVariantsForColor[0];

    // Get unique colors available
    const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color_name))).map(colorName => {
        return product.variants?.find(v => v.color_name === colorName);
    }).filter(Boolean) as ProductVariant[];

    // Available sizes for currently selected color
    const availableSizes = availableVariantsForColor.map(v => v.size).filter(Boolean) as string[];

    const displayMedia = (currentVariant?.media && currentVariant.media.length > 0)
        ? currentVariant.media
        : product.image_url ? [{ url: getImageUrl(product.image_url), type: 'image' }] : [];

    const activeMedia = displayMedia[activeMediaIndex];

    // Calculate final price based on selected size's extra price
    const basePrice = Number(product.is_on_sale && product.sale_price ? product.sale_price : product.price);
    const extraPrice = Number(currentVariant?.extra_price || 0);
    const finalPrice = basePrice + extraPrice;

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
                                        className={`shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${activeMediaIndex === idx ? 'border-foreground shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
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
                            <span className="font-semibold text-foreground">₹{finalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>

                            {product.is_on_sale && product.sale_price && (
                                <span className="text-lg text-muted-foreground line-through">₹{(Number(product.price) + extraPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            )}

                            {product.is_on_sale && product.sale_price && (
                                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded uppercase tracking-wider">Sale</span>
                            )}
                        </div>

                        <p className="text-muted-foreground leading-relaxed mb-10 whitespace-pre-wrap">
                            {product.description || "No description available."}
                        </p>

                        {/* Color Selection */}
                        {uniqueColors.length > 0 && (
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
                                                // Reset size if the new color doesn't have the currently selected size
                                                const newColorSizes = product.variants?.filter(v => v.color_name === variant.color_name).map(v => v.size);
                                                if (newColorSizes && !newColorSizes.includes(selectedSize)) {
                                                    setSelectedSize(newColorSizes[0] || "N/A");
                                                }
                                            }}
                                            className={`group relative w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === variant.color_name
                                                ? 'border-foreground border-[3px] scale-110 shadow-md'
                                                : 'border-transparent shadow-sm hover:scale-105'
                                                }`}
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

                        {/* Size Selection */}
                        {availableSizes.length > 0 && !(availableSizes.length === 1 && availableSizes[0] === "N/A") && (
                            <div className="mb-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-semibold uppercase tracking-wider">
                                        Size: <span className="text-muted-foreground ml-2 font-normal">{selectedSize}</span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                    {SIZES.map(size => {
                                        const isAvailable = availableSizes.includes(size);
                                        const isSelected = selectedSize === size;
                                        if (size === "N/A" && !isAvailable) return null; // Don't show N/A button unless it's available
                                        return (
                                            <button
                                                key={size}
                                                disabled={!isAvailable}
                                                onClick={() => isAvailable && setSelectedSize(size)}
                                                className={`py-3 rounded-md text-sm font-medium transition-all border
                                                    ${isSelected
                                                        ? 'bg-foreground text-background border-foreground shadow-md'
                                                        : isAvailable
                                                            ? 'bg-transparent text-foreground border-border hover:border-foreground/50'
                                                            : 'bg-muted/50 text-muted-foreground border-transparent opacity-50 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <Button className="w-full md:w-auto mt-auto py-6 text-base tracking-wide flex items-center justify-center disabled:opacity-50">
                            <ShoppingBag className="w-5 h-5 mr-3" />
                            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>

                        {product.stock > 0 && (
                            <p className="text-sm mt-4 text-green-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                In Stock
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetail;
