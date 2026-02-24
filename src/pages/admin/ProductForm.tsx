import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Product, ProductVariant } from "@/types/product";
import { X, Plus, Check, ImageIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

const SIZES = ["N/A", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

interface UiSize {
    size: string;
    enabled: boolean;
    extra_price: number;
}

interface UiVariant {
    color_name: string;
    color_hex: string;
    sizes: UiSize[];
    media: any[];
}

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        image_url: "",
        variants: []
    });

    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uiVariants, setUiVariants] = useState<UiVariant[]>([]);

    // Category Creation State
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchProductDetails();
        }
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const res = await fetch(`https://thedeepcollection.com/api/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData(data);

                // Group variants by color for the UI
                if (data.variants && data.variants.length > 0) {
                    const grouped: UiVariant[] = [];
                    data.variants.forEach((v: any) => {
                        let group = grouped.find(g => g.color_name === v.color_name);
                        if (!group) {
                            group = {
                                color_name: v.color_name,
                                color_hex: v.color_hex,
                                sizes: SIZES.map(s => ({ size: s, enabled: false, extra_price: 0 })),
                                media: v.media || []
                            };
                            grouped.push(group);
                        }
                        if (v.size) {
                            const sizeObj = group.sizes.find(s => s.size === v.size);
                            if (sizeObj) {
                                sizeObj.enabled = true;
                                sizeObj.extra_price = v.extra_price || 0;
                            }
                        }
                    });
                    setUiVariants(grouped);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load product details");
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch("https://thedeepcollection.com/api/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" || name === "stock" ? parseFloat(value) : value,
        }));
    };

    const handleCategoryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, category: value }));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Category name cannot be empty");
            return;
        }

        setCreatingCategory(true);
        try {
            const response = await fetch("https://thedeepcollection.com/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName }),
            });

            if (response.ok) {
                const newCat = await response.json();
                setCategories((prev) => [...prev, newCat]);
                setFormData((prev) => ({ ...prev, category: newCat.name }));
                toast.success("Category created!");
                setIsCreatingCategory(false);
                setNewCategoryName("");
            } else {
                toast.error("Failed to create category");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error("Error creating category");
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = isEditing
                ? `/api/products/${id}`
                : "/api/products";

            const method = isEditing ? "PUT" : "POST";

            const payloadVariants = uiVariants.flatMap(uiVar => {
                const activeSizes = uiVar.sizes.filter(s => s.enabled);
                if (activeSizes.length === 0) {
                    return [{ color_name: uiVar.color_name, color_hex: uiVar.color_hex, size: 'N/A', extra_price: 0, media: uiVar.media }];
                }
                return activeSizes.map(sizeObj => ({
                    color_name: uiVar.color_name,
                    color_hex: uiVar.color_hex,
                    size: sizeObj.size,
                    extra_price: sizeObj.extra_price,
                    media: uiVar.media
                }));
            });

            const payload = {
                ...formData,
                variants: payloadVariants
            };

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(`Product ${isEditing ? "updated" : "created"} successfully`);
                navigate("/admin/products");
            } else {
                toast.error("Failed to save product");
            }
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Error saving product");
        }
    };

    // --- Variants Logic ---

    const addVariant = () => {
        setUiVariants(prev => [
            ...prev,
            {
                color_name: "",
                color_hex: "#000000",
                sizes: SIZES.map(s => ({ size: s, enabled: false, extra_price: 0 })),
                media: []
            }
        ]);
    };

    const removeVariant = (index: number) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants.splice(index, 1);
            return newVariants;
        });
    }

    const handleVariantChange = (index: number, field: keyof UiVariant, value: any) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants[index] = { ...newVariants[index], [field]: value };
            return newVariants;
        });
    };

    const handleSizeToggle = (variantIndex: number, sizeIndex: number, enabled: boolean) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].sizes[sizeIndex].enabled = enabled;
            return newVariants;
        });
    };

    const handleExtraPriceChange = (variantIndex: number, sizeIndex: number, price: number) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].sizes[sizeIndex].extra_price = price;
            return newVariants;
        });
    };

    const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file); // multer uses 'file' typically

        try {
            const response = await fetch("https://thedeepcollection.com/api/upload", {
                method: "POST",
                body: uploadData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Image uploaded! Server returned:", data);

                setUiVariants(prev => {
                    const newVariants = [...prev];
                    // Create a deep copy of the specific variant we are modifying!
                    const targetVariant = { ...newVariants[index] };
                    const currentMedia = [...targetVariant.media];

                    currentMedia.push({ url: data.url, type: 'image' });
                    targetVariant.media = currentMedia;
                    newVariants[index] = targetVariant;

                    console.log("Updated UI variants for media:", targetVariant.media);
                    return newVariants;
                });

                toast.success("Image uploaded successfully");
            } else {
                toast.error("Image upload failed");
                console.error("Upload failed with status:", response.status);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const removeVariantImage = (variantIndex: number, mediaIndex: number) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            const targetVariant = { ...newVariants[variantIndex] };
            const currentMedia = [...targetVariant.media];

            currentMedia.splice(mediaIndex, 1);
            targetVariant.media = currentMedia;
            newVariants[variantIndex] = targetVariant;

            return newVariants;
        });
    }


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
                {isEditing ? "Edit Product" : "Add New Product"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Base Price</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Base Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="category">Category</Label>
                                {isCreatingCategory ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="New Category Name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                        />
                                        <Button type="button" size="icon" onClick={handleCreateCategory} disabled={creatingCategory}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => setIsCreatingCategory(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Select onValueChange={handleCategoryChange} value={formData.category}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.name}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setIsCreatingCategory(true)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Variants Builder */}
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Colors & Sizes Variants</CardTitle>
                        <Button type="button" onClick={addVariant} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Add Variant
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {uiVariants.length === 0 && (
                            <div className="text-center text-muted-foreground py-4 border rounded-md bg-muted/20">
                                No variants added. The product will be sold without color/size options.
                            </div>
                        )}

                        {uiVariants.map((variant, index) => (
                            <div key={index} className="p-4 border rounded-md space-y-4 relative bg-card">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-red-500"
                                    onClick={() => removeVariant(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Color Name</Label>
                                        <Input
                                            placeholder="e.g. Red, Blue"
                                            value={variant.color_name}
                                            onChange={(e) => handleVariantChange(index, 'color_name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color Hex</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={variant.color_hex}
                                                onChange={(e) => handleVariantChange(index, 'color_hex', e.target.value)}
                                                className="w-12 p-1 h-10"
                                            />
                                            <Input
                                                value={variant.color_hex}
                                                onChange={(e) => handleVariantChange(index, 'color_hex', e.target.value)}
                                                className="flex-1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t mt-4">
                                    <Label>Available Sizes & Extra Pricing</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {variant.sizes.map((sizeObj, sizeIndex) => (
                                            <div key={sizeIndex} className={`flex flex-col gap-2 p-3 border rounded-md transition-colors ${sizeObj.enabled ? 'bg-secondary/20 border-primary/30' : 'bg-muted/10 opacity-70 border-dashed'}`}>
                                                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={sizeObj.enabled}
                                                        onChange={(e) => handleSizeToggle(index, sizeIndex, e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    Size {sizeObj.size}
                                                </label>
                                                {sizeObj.enabled && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-muted-foreground shrink-0">+₹</span>
                                                        <Input
                                                            type="number"
                                                            step="1"
                                                            className="h-8 text-sm px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            placeholder="0"
                                                            value={sizeObj.extra_price}
                                                            onChange={(e) => handleExtraPriceChange(index, sizeIndex, parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Variant Images */}
                                <div className="space-y-2 pt-2 border-t mt-4">
                                    <Label>Images for this Color & Size</Label>

                                    <div className="flex flex-wrap gap-4 items-center mt-2">
                                        {variant.media?.map((m, mIndex) => (
                                            <div key={mIndex} className="relative group w-20 h-20 rounded-md border overflow-hidden">
                                                <img
                                                    src={getImageUrl(m.url)}
                                                    alt="Variant Image"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="w-8 h-8 rounded-full"
                                                        onClick={() => removeVariantImage(index, mIndex)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="relative w-20 h-20 rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                                            <ImageIcon className="w-6 h-6 mb-1" />
                                            <span className="text-[10px]">Upload</span>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                                onChange={(e) => handleVariantImageUpload(index, e)}
                                                disabled={uploading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2 mt-8">
                    <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={uploading} size="lg">
                        {uploading ? "Uploading..." : isEditing ? "Update Product" : "Save Product"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Assuming Trash2 is needed, adding it here if missed
import { Trash2 } from "lucide-react";

export default ProductForm;
