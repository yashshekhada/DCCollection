const fs = require('fs');

let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

const ComponentStr = `const ProductCard = ({ product, activeColor, index }: { product: Product, activeColor: string, index: number }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    // Gather images: main image + variant images (1 per color typically, or all)
    const images = [product.image_url];
    if (activeColor === 'All' && product.variants && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
            if (v.media && v.media.length > 0) {
                const imgMedia = v.media.find((m: any) => m.type === 'image');
                if (imgMedia && !images.includes(imgMedia.url)) {
                    images.push(imgMedia.url);
                }
            }
        });
    }

    const validImages = images.filter(Boolean);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeColor === 'All' && validImages.length > 1 && isHovered) {
            interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % validImages.length);
            }, 1000); // changes every 1s on hover
        } else if (!isHovered) {
            setCurrentImageIndex(0); // reset when not hovering
        }
        return () => clearInterval(interval);
    }, [activeColor, validImages.length, isHovered]);

    const currentImage = validImages[currentImageIndex] || product.image_url;

    return (
        <motion.a
            href={\`/product/\${product.id}\${activeColor !== 'All' ? '?color=' + activeColor : ''}\`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group flex flex-col cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-muted border border-border/50">
                {currentImage ? (
                    <img
                        src={getImageUrl(currentImage)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm bg-gray-100">
                        No Image
                    </div>
                )}
                
                {/* Dots indicator for variants if hovering */}
                {activeColor === 'All' && validImages.length > 1 && (
                    <div className="absolute bottom-2 left-0 w-full flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {validImages.map((_, dotIdx) => (
                            <div 
                                key={dotIdx} 
                                className={\`h-1 w-1.5 rounded-full transition-all \${currentImageIndex === dotIdx ? 'bg-white w-3' : 'bg-white/50'}\`} 
                            />
                        ))}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none">
                    {/* View Details Text is covered slightly by dots, let's keep it simple or remove */}
                </div>

                {product.category && (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
                        {product.category}
                    </span>
                )}
            </div>
            
            <div>
                {product.design_code && (
                    <p className="text-[11px] font-mono text-muted-foreground mb-0.5">
                        {product.design_code}
                    </p>
                )}
                <h3 className="font-medium text-sm text-foreground leading-snug group-hover:underline">
                    {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {product.is_on_sale && product.sale_price ? (
                        <>
                            <span className="text-sm font-semibold text-red-600">
                                ₹{Number(product.sale_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
    );
};
`;

const replaceIndex = content.indexOf('const Shop = () => {');
if (replaceIndex !== -1 && !content.includes('ProductCard = ({ product')) {
    content = content.slice(0, replaceIndex) + ComponentStr + '\n' + content.slice(replaceIndex);
}

// Replace the inner mapping
const mapRegex = /<motion\.a[\s\S]*?<\/motion\.a>/g;
// We only want to replace the FIRST big motion.a map inside the products loop
if (content.match(/products\.map\(\(product,\s*i\)\s*=>/)) {
    // A bit tricky with regex, let's do safe replace by targetting 'className="group cursor-pointer flex flex-col"'
    const startStr = '{products.map((product, i) => (';
    const idx = content.indexOf(startStr);
    if (idx !== -1) {
       const substring = content.slice(idx);
       const endMatch = substring.match(/<\/motion\.a>\s*\)\)\s*\}/);
       if (endMatch) {
            const endIdx = idx + endMatch.index + endMatch[0].length;
            const fullMap = content.slice(idx, endIdx);
            
            content = content.replace(fullMap, '{products.map((product, i) => (\n                            <ProductCard key={product.id} product={product} activeColor={activeColor} index={i} />\n                        ))}');
       }
    }
}

fs.writeFileSync('src/pages/Shop.tsx', content);
console.log("Updated Shop.tsx successfully");
