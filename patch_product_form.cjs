const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProductForm.tsx', 'utf8');

// 1. Remove SIZES constant
code = code.replace(/const SIZES = \[.*?\];\n/, '');

// 2. Modify UiSize interface
code = code.replace(/interface UiSize \{[\s\S]*?\}/, `interface UiSize {
    size: string;
    extra_price: number;
}`);

// 3. Update fetchProductDetails sizes grouping
code = code.replace(/sizes: SIZES\.map\(s => \(\{ size: s, enabled: false, extra_price: 0 \}\)\)/, `sizes: []`);

const fetchSizePushRegex = /if \(v\.size\) \{[\s\S]*?sizeObj\.extra_price = v\.extra_price \|\| 0;\n\s*\}\n\s*\}/;
code = code.replace(fetchSizePushRegex, `if (v.size && v.size !== 'N/A') {
                            if (!group.sizes.some(s => s.size === v.size)) {
                                group.sizes.push({ size: v.size, extra_price: v.extra_price || 0 });
                            }
                        }`);

// 4. Removing Stock UI
const stockUiRegex = /<div className="space-y-2">\s*<Label htmlFor="stock">Base Stock<\/Label>[\s\S]*?<\/div>/;
code = code.replace(stockUiRegex, '');

// Also change stock label from grid-cols-4 to grid-cols-2
code = code.replace(/<div className="grid grid-cols-2 md:grid-cols-4 gap-4">/, '<div className="grid grid-cols-2 gap-4">');

// 5. Update payload generation
const payloadRegex = /const payloadVariants = uiVariants\.flatMap\(uiVar => \{[\s\S]*?\}\);/;
code = code.replace(payloadRegex, `const payloadVariants = uiVariants.flatMap(uiVar => {
                if (uiVar.sizes.length === 0) {
                    return [{ color_name: uiVar.color_name, color_hex: uiVar.color_hex, size: 'N/A', extra_price: 0, media: uiVar.media }];
                }
                return uiVar.sizes.filter(s => s.size.trim() !== '').map(sizeObj => ({
                    color_name: uiVar.color_name,
                    color_hex: uiVar.color_hex,
                    size: sizeObj.size.trim(),
                    extra_price: sizeObj.extra_price,
                    media: uiVar.media
                }));
            });`);


// 6. Update addVariant to use empty sizes array
code = code.replace(/sizes: SIZES\.map\(s => \(\{ size: s, enabled: false, extra_price: 0 \}\)\)/, `sizes: []`);

// 7. Update size handlers
const sizeHandlersRegex = /const handleSizeToggle = \([\s\S]*?return newVariants;\n    \};/;
code = code.replace(sizeHandlersRegex, `    const handleAddSize = (variantIndex: number) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].sizes.push({ size: "", extra_price: 0 });
            return newVariants;
        });
    };

    const handleRemoveSize = (variantIndex: number, sizeIndex: number) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].sizes.splice(sizeIndex, 1);
            return newVariants;
        });
    };

    const handleSizeNameChange = (variantIndex: number, sizeIndex: number, name: string) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].sizes[sizeIndex].size = name;
            return newVariants;
        });
    };`);

// Update extra price handler
const extraPriceRegex = /const handleExtraPriceChange = \([\s\S]*?return newVariants;\n    \};/;
code = code.replace(extraPriceRegex, `    const handleExtraPriceChange = (variantIndex: number, sizeIndex: number, price: number) => {
        setUiVariants(prev => {
            const newVariants = [...prev];
            newVariants[variantIndex].sizes[sizeIndex].extra_price = price;
            return newVariants;
        });
    };`);

// 8. Update JSX for Sizes
const jsxSizesRegex = /<div className="space-y-3 pt-2 border-t mt-4">\s*<Label>Available Sizes.*?<\/div>\s*<\/div>/;
code = code.replace(jsxSizesRegex, `<div className="space-y-3 pt-2 border-t mt-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Variant Options / Sizes & Pricing</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddSize(index)}>
                                            <Plus className="w-3 h-3 mr-1" /> Add Option
                                        </Button>
                                    </div>
                                    {variant.sizes.length === 0 ? (
                                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                            No explicit sizes/variants added. This color will be sold as a single default option.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {variant.sizes.map((sizeObj, sizeIndex) => (
                                                <div key={sizeIndex} className="flex flex-col gap-2 p-3 border rounded-md bg-secondary/10 relative pr-8">
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:bg-red-100"
                                                        onClick={() => handleRemoveSize(index, sizeIndex)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium">Option Name (e.g. Size)</label>
                                                        <Input 
                                                            className="h-8 text-sm px-2"
                                                            placeholder="e.g. XL, 100ml, Pack of 3"
                                                            value={sizeObj.size}
                                                            onChange={(e) => handleSizeNameChange(index, sizeIndex, e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium">Extra Price (+₹)</label>
                                                        <Input
                                                            type="text"
                                                            inputMode="numeric"
                                                            className="h-8 text-sm px-2"
                                                            placeholder="0"
                                                            value={sizeObj.extra_price === 0 ? '' : sizeObj.extra_price}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                handleExtraPriceChange(index, sizeIndex, val ? parseInt(val, 10) : 0);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>`);

// Check if we removed the old double sizes property
code = code.replace(/sizes: UiSize\[\];\n\s*sizes: UiSize\[\];/, 'sizes: UiSize[];');


fs.writeFileSync('src/pages/admin/ProductForm.tsx', code);
console.log("ProductForm updated successfully");
