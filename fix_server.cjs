const fs = require('fs');

let content = fs.readFileSync('server/server.js', 'utf8');

const regex = /app\.get\('\/api\/products',\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?db\.all\(sql,\s*params,\s*\(err,\s*rows\)\s*=>\s*\{[\s\S]*?res\.json\(rows\);\s*\}\);\s*\}\);/m;

const replacement = `app.get('/api/products', (req, res) => {
    const { search, category, color } = req.query;
    let sql = "SELECT p.id, p.name, p.description, p.price, p.image_url, p.category, p.stock, p.created_at, p.design_code, p.is_on_sale, p.sale_price FROM products p";
    if (color) {
        sql = "SELECT DISTINCT p.id, p.name, p.description, p.price, COALESCE((SELECT url FROM product_variant_media m JOIN product_variants pv ON pv.id = m.variant_id WHERE pv.product_id = p.id AND pv.color_name = ? AND m.type = 'image' LIMIT 1), p.image_url) as image_url, p.category, p.stock, p.created_at, p.design_code, p.is_on_sale, p.sale_price FROM products p JOIN product_variants v ON p.id = v.product_id";
    }

    let conditions = [];
    let params = [];

    if (color) {
        params.push(color); // For the subquery
    }

    if (category) {
        conditions.push("p.category = ?");
        params.push(category);
    }
    if (search) {
        conditions.push("(p.name LIKE ? OR p.design_code LIKE ?)");
        params.push(\`%\${search}%\`);
        params.push(\`%\${search}%\`);
    }
    if (color) {
        conditions.push("v.color_name = ?");
        params.push(color);
    }

    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY p.created_at DESC";

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});`;

content = content.replace(regex, replacement);
fs.writeFileSync('server/server.js', content);
console.log("Updated server.js");
