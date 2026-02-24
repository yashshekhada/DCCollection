const fs = require('fs');

let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

const regex = /<div\s+className="relative overflow-hidden aspect-\[3\/4\] mb-4 bg-muted border border-border\/50"/g;

if(content.includes('onMouseEnter={(e) => {')){
    console.log("Already updated Shop.tsx");
} else {
    console.log("Failed to update Shop.tsx completely. Using sed to fix.");
    const child_process = require('child_process');
    child_process.execSync("sed -i '' 's/<div className=\"relative overflow-hidden aspect-\\[3\\/4\\] mb-4 bg-muted border border-border\\/50\"/<div className=\"relative overflow-hidden aspect-\\[3\\/4\\] mb-4 bg-muted border border-border\\/50\" onMouseEnter={(e) => { if (product.variants && product.variants.length > 0) { const firstVariantWithImage = product.variants.find(v => v.media && v.media.length > 0 && v.media.some((m: any) => m.type === \\'image\\')); if (firstVariantWithImage) { const hoverImg = firstVariantWithImage.media.find((m: any) => m.type === \\'image\\').url; const imgEl = e.currentTarget.querySelector(\\'img.main-prod-img\\'); if (imgEl && hoverImg) { imgEl.setAttribute(\\'data-original\\', imgEl.getAttribute(\\'src\\') || \\'\\'); imgEl.setAttribute(\\'src\\', getImageUrl(hoverImg)); } } } }} onMouseLeave={(e) => { const imgEl = e.currentTarget.querySelector(\\'img.main-prod-img\\'); if (imgEl && imgEl.getAttribute(\\'data-original\\')) { imgEl.setAttribute(\\'src\\', imgEl.getAttribute(\\'data-original\\') || \\'\\'); } }}/' src/pages/Shop.tsx");
    child_process.execSync("sed -i '' 's/className=\"w-full h-full object-cover transition-transform duration-700 group-hover:scale-105\"/className=\"w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 main-prod-img\"/' src/pages/Shop.tsx");
}

