import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Plus, Image as ImageIcon, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl } from "@/lib/utils";

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    link_url: string;
}

const BannerList = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    const [newTitle, setNewTitle] = useState("");
    const [newSubtitle, setNewSubtitle] = useState("");
    const [newLink, setNewLink] = useState("/shop");
    const [newImage, setNewImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<number | null>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch("/api/banners");
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            toast.error("Failed to load banners");
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
            setNewImage(data.url);
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    
    const handleEdit = (banner: Banner) => {
        setEditingBannerId(banner.id);
        setNewTitle(banner.title);
        setNewSubtitle(banner.subtitle || "");
        setNewLink(banner.link_url || "/shop");
        setNewImage(banner.image_url);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingBannerId(null);
        setNewTitle("");
        setNewSubtitle("");
        setNewLink("/shop");
        setNewImage(null);
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newImage) {
            toast.error("Banner image and title are required");
            return;
        }

        try {
            const url = editingBannerId 
                ? `/api/banners/${editingBannerId}`
                : "/api/banners";
            
            const method = editingBannerId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    subtitle: newSubtitle.trim(),
                    link_url: newLink.trim(),
                    image_url: newImage
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to ${editingBannerId ? 'update' : 'create'} banner`);
            }

            toast.success(`Banner ${editingBannerId ? 'updated' : 'created'} successfully`);
            handleCancelEdit();
            fetchBanners();
        } catch (error: any) {
            toast.error(error.message);
        }
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;

        try {
            const res = await fetch(`/api/banners/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete banner");

            toast.success("Banner deleted");
            setBanners(banners.filter((b) => b.id !== id));
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Hero Banners</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{editingBannerId ? "Edit Banner" : "Add New Banner"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Main Title</label>
                                <Input
                                    placeholder="E.g. Summer Collection 2026"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtitle / Tagline</label>
                                <Input
                                    placeholder="E.g. Discover the latest trends..."
                                    value={newSubtitle}
                                    onChange={(e) => setNewSubtitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Button Link</label>
                                <Input
                                    placeholder="/shop"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium block">Banner Image (16:9 recommended)</label>
                                <div className="flex items-center gap-2">
                                    {newImage && (
                                        <div className="h-10 w-20 relative rounded overflow-hidden border">
                                            <img src={getImageUrl(newImage)} alt="Preview" className="object-cover w-full h-full" />
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
                        </div>

                        
                        <div className="flex gap-2">
                            <Button type="submit" className="w-full sm:w-auto">
                                {editingBannerId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                {editingBannerId ? "Update Banner" : "Add Banner"}
                            </Button>
                            {editingBannerId && (
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Subtitle</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <div className="h-12 w-20 rounded overflow-hidden border">
                                            <img src={getImageUrl(banner.image_url)} alt={banner.title} className="object-cover w-full h-full" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{banner.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{banner.subtitle}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">{banner.link_url}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(banner)}
                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(banner.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {banners.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No banners found. Create one above to show on the homepage.
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

export default BannerList;
