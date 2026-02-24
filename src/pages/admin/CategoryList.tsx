import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl } from "@/lib/utils";

interface Category {
    id: number;
    name: string;
    image_url: string;
}

const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [newCategoryImage, setNewCategoryImage] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setNewCategoryImage(data.url);
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName.trim(), image_url: newCategoryImage }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create category");
            }

            toast.success("Category created successfully");
            setNewCategoryName("");
            setNewCategoryImage(null);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete category");

            toast.success("Category deleted");
            setCategories(categories.filter((c) => c.id !== id));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Category Name</label>
                            <Input
                                placeholder="E.g. Tops, Dresses, Accessories..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium block">Category Image (Optional)</label>
                            <div className="flex items-center gap-2">
                                {newCategoryImage && (
                                    <div className="h-10 w-10 relative rounded overflow-hidden border">
                                        <img src={getImageUrl(newCategoryImage)} alt="Preview" className="object-cover w-full h-full" />
                                    </div>
                                )}
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                    <Button type="button" variant="outline" disabled={uploadingImage}>
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        {uploadingImage ? "Uploading..." : "Upload Image"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button type="submit">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {category.image_url ? (
                                            <div className="h-10 w-10 rounded overflow-hidden border">
                                                <img src={getImageUrl(category.image_url)} alt={category.name} className="object-cover w-full h-full" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-gray-100 border flex items-center justify-center text-gray-400">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No categories found. Create one above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default CategoryList;
