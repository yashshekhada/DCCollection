const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/BannerList.tsx', 'utf8');

// 1. Add Pencil import if not present
if (!content.includes('Pencil')) {
    content = content.replace('Trash2, Plus, Image as ImageIcon', 'Trash2, Plus, Image as ImageIcon, Pencil, X');
}

// 2. Add state for editing
const stateStr = `    const [editingBannerId, setEditingBannerId] = useState<number | null>(null);`;
if (!content.includes('editingBannerId')) {
    content = content.replace('const [uploadingImage, setUploadingImage] = useState(false);', 'const [uploadingImage, setUploadingImage] = useState(false);\n' + stateStr);
}

// 3. Edit Handler functions
const handlersStr = `
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
                ? \`/api/banners/\${editingBannerId}\`
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
                throw new Error(data.error || \`Failed to \${editingBannerId ? 'update' : 'create'} banner\`);
            }

            toast.success(\`Banner \${editingBannerId ? 'updated' : 'created'} successfully\`);
            handleCancelEdit();
            fetchBanners();
        } catch (error: any) {
            toast.error(error.message);
        }
    };
`;

if (!content.includes('handleEdit(bannerId)')) {
    // Replace handleCreate
    const handleCreateRegex = /const handleCreate = async \(e: React\.FormEvent\) => \{[\s\S]*?fetchBanners\(\);\s*\} catch \(error: any\) \{\s*toast\.error\(error\.message\);\s*\}\s*\};/;
    content = content.replace(handleCreateRegex, handlersStr);
}

// 4. Update form onSubmit
content = content.replace(/onSubmit=\{handleCreate\}/g, 'onSubmit={handleCreateOrUpdate}');

// 5. Update Card Titles and Buttons
content = content.replace('<CardTitle>Add New Banner</CardTitle>', '<CardTitle>{editingBannerId ? "Edit Banner" : "Add New Banner"}</CardTitle>');

const submitButtonRegex = /<Button type="submit" className="w-full sm:w-auto">\s*<Plus className="mr-2 h-4 w-4" \/>\s*Add Banner\s*<\/Button>/;
const editButtons = `
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
                        </div>`;

content = content.replace(submitButtonRegex, editButtons);

// 6. Add Edit button in table
const tableRowRegex = /<TableCell className="text-right">\s*<Button\s*variant="ghost"\s*size="sm"\s*onClick=\{\(\) => handleDelete\(banner\.id\)\}\s*className="text-red-500 hover:text-red-700"\s*>\s*<Trash2 className="h-4 w-4" \/>\s*<\/Button>\s*<\/TableCell>/g;
const newTableRow = `<TableCell className="text-right">
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
                                    </TableCell>`;

content = content.replace(tableRowRegex, newTableRow);

// 7. Remove absolute URLs from fetches in this file
content = content.replace(/https:\/\/thedeepcollection\.com\/api\//g, '/api/');

fs.writeFileSync('src/pages/admin/BannerList.tsx', content);
console.log("Updated BannerList.tsx successfully");
