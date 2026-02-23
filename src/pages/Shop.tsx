import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getImageUrl } from "@/lib/utils";

interface Product {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
    design_code?: string;
    is_on_sale?: boolean;
    sale_price?: number;
}

interface Category {
    id: number;
    name: string;
}

interface ColorOption {
    color_name: string;
    color_hexes: string[];
}

const Shop = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<ColorOption[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeCategory = searchParams.get("category") || "All";
    const activeSearch = searchParams.get("search") || "";
    const activeColor = searchParams.get("color") || "All";

    useEffect(() => {
        // Fetch Categories
        fetch("http://localhost:3000/api/categories")
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));

        // Fetch Colors
        fetch("http://localhost:3000/api/colors")
            .then(res => res.json())
            .then(data => setColors(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        // Fetch Products based on filters
        setLoading(true);
        let url = "http://localhost:3000/api/products?";
        const params = new URLSearchParams();

        if (activeCategory !== "All") params.append("category", activeCategory);
        if (activeSearch) params.append("search", activeSearch);
        if (activeColor !== "All") params.append("color", activeColor);

        fetch(url + params.toString())
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, [activeCategory, activeSearch, activeColor]);

    const updateParam = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === "All" || value === "") {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        setSearchParams(newParams);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Header / Filter Bar */}
            <div className="pt-24 pb-8 px-6 bg-secondary/30 border-b border-border mt-16">
                <div className="container mx-auto">
                    <h1 className="font-heading text-4xl mb-2 text-foreground">
                        {activeSearch ? `Search Results for "${activeSearch}"` : (activeCategory === "All" ? "All Products" : activeCategory)}
                    </h1>
                    <p className="font-body text-muted-foreground mb-8">
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </p>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Category Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                            {["All", ...categories.map(c => c.name)].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => updateParam("category", cat)}
                                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                        ? "bg-foreground text-background"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Color Filter */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-36 md:w-44">
                                <Select value={activeColor} onValueChange={(val) => updateParam("color", val)}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="All Colors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Colors</SelectItem>
                                        {colors.map(c => (
                                            <SelectItem key={c.color_name} value={c.color_name}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-200 overflow-hidden flex"
                                                    >
                                                        {(c.color_hexes || []).map((hex, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="h-full flex-1"
                                                                style={{ backgroundColor: hex }}
                                                            />
                                                        ))}
                                                    </div>
                                                    {c.color_name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product grid */}
            <div className="container mx-auto px-6 py-12 flex-1">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] rounded-md mb-3" />
                                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                                <div className="bg-gray-200 h-4 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24">
                        <h3 className="text-2xl font-heading mb-2">No products found</h3>
                        <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
                        <button
                            onClick={() => navigate("/shop")}
                            className="text-foreground border-b border-foreground pb-0.5"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
                    >
                        {products.map((product, i) => (
                            <motion.a
                                href={`/product/${product.id}`}
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="group cursor-pointer flex flex-col"
                            >
                                {/* Image container */}
                                <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-muted border border-border/50">
                                    {product.image_url ? (
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm bg-gray-100">
                                            No Image
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                        <span className="text-white text-xs uppercase tracking-widest font-body">View Details</span>
                                    </div>
                                    {/* Category badge */}
                                    {product.category && (
                                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {product.category}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div>
                                    {product.design_code && (
                                        <p className="text-[11px] font-mono text-muted-foreground mb-0.5">
                                            {(product as any).design_code}
                                        </p>
                                    )}
                                    <h3 className="font-medium text-sm text-foreground leading-snug group-hover:underline">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {(product as any).is_on_sale && (product as any).sale_price ? (
                                            <>
                                                <span className="text-sm font-semibold text-red-600">
                                                    ₹{Number((product as any).sale_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-xs text-muted-foreground line-through">
                                                    ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Sale</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                ₹{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Shop;
