const fs = require('fs');

let content = fs.readFileSync('src/pages/Shop.tsx', 'utf8');

const regex = /href=\{\`\/product\/\$\{product\.id\}\`\}/g;
const replacement = `href={\`/product/\${product.id}\${activeColor !== 'All' ? '?color=' + activeColor : ''}\`}`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/pages/Shop.tsx', content);
    console.log("Updated Shop.tsx links");
} else {
    console.log("Regex didn't match. Using sed");
    const child_process = require('child_process');
    child_process.execSync("sed -i '' 's/href={`\\/product\\/${product.id}`}/href={`\\/product\\/${product.id}${activeColor !== \\'All\\' ? \\'?color=\\' + activeColor : \\'\\'}`}/g' src/pages/Shop.tsx");
}
