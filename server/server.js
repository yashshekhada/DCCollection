import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Admin Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) res.json({ message: "Login successful", user: { id: row.id, username: row.username } });
        else res.status(401).json({ error: "Invalid credentials" });
    });
});

// Image Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// =======================
// Categories
// =======================
app.get('/api/categories', (req, res) => {
    db.all("SELECT * FROM categories", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/categories', (req, res) => {
    const { name, image_url } = req.body;
    db.run("INSERT INTO categories (name, image_url) VALUES (?, ?)", [name, image_url], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID, name, image_url });
    });
});

app.delete('/api/categories/:id', (req, res) => {
    db.run("DELETE FROM categories WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

// =======================
// Colors (Grouped)
// =======================
app.get('/api/colors', (req, res) => {
    const sql = "SELECT color_name, GROUP_CONCAT(DISTINCT color_hex) as hex_codes FROM product_variants GROUP BY color_name ORDER BY color_name ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        const formattedRows = rows.map(r => ({
            color_name: r.color_name,
            color_hexes: r.hex_codes ? r.hex_codes.split(',') : []
        }));
        res.json(formattedRows);
    });
});

// =======================
// Products
// =======================
app.get('/api/products', (req, res) => {
    const { search, category, color } = req.query;
    let sql = "SELECT DISTINCT p.* FROM products p";
    if (color) sql += " LEFT JOIN product_variants v ON p.id = v.product_id";

    let conditions = [];
    let params = [];

    if (category) {
        conditions.push("p.category = ?");
        params.push(category);
    }
    if (search) {
        conditions.push("(p.name LIKE ? OR p.design_code LIKE ?)");
        params.push(`%${search}%`);
        params.push(`%${search}%`);
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
});

app.get('/api/products/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.get(sql, [req.params.id], (err, product) => {
        if (err || !product) return res.status(404).json({ error: "Not found" });
        db.all("SELECT * FROM product_variants WHERE product_id = ?", [product.id], (err, variants) => {
            if (err) return res.json(product);
            if (variants.length === 0) {
                product.variants = [];
                return res.json(product);
            }

            let variantsProcessed = 0;
            variants.forEach(v => {
                db.all("SELECT * FROM product_variant_media WHERE variant_id = ?", [v.id], (err, media) => {
                    v.media = media || [];
                    variantsProcessed++;
                    if (variantsProcessed === variants.length) {
                        product.variants = variants;
                        res.json(product);
                    }
                });
            });
        });
    });
});

app.post('/api/products', (req, res) => {
    const { name, description, price, design_code, is_on_sale, sale_price, category, stock, variants, image_url } = req.body;
    const sql = 'INSERT INTO products (name, description, price, image_url, category, stock, design_code, is_on_sale, sale_price) VALUES (?,?,?,?,?,?,?,?,?)';

    // Pick the first media URL as main image_url if not provided
    let mainImage = image_url;
    if (!mainImage && variants && variants.length > 0 && variants[0].media && variants[0].media.length > 0) {
        mainImage = variants[0].media.find(m => m.type === 'image')?.url || null;
    }

    db.run(sql, [name, description, price, mainImage, category, stock, design_code, is_on_sale ? 1 : 0, sale_price], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        const productId = this.lastID;

        if (variants && variants.length > 0) {
            variants.forEach(variant => {
                const variantSize = variant.size || 'N/A';
                const extraPrice = variant.extra_price || 0;
                db.run("INSERT INTO product_variants (product_id, color_name, color_hex, size, extra_price) VALUES (?, ?, ?, ?, ?)", [productId, variant.color_name, variant.color_hex, variantSize, extraPrice], function (err) {
                    if (err) return;
                    const variantId = this.lastID;
                    if (variant.media) {
                        variant.media.forEach(m => {
                            db.run("INSERT INTO product_variant_media (variant_id, url, type) VALUES (?, ?, ?)", [variantId, m.url, m.type]);
                        });
                    }
                });
            });
        }
        res.json({ id: productId });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, design_code, is_on_sale, sale_price, category, stock, variants, image_url } = req.body;

    let mainImage = image_url;
    if (!mainImage && variants && variants.length > 0 && variants[0].media && variants[0].media.length > 0) {
        mainImage = variants[0].media.find(m => m.type === 'image')?.url || null;
    }

    const sql = 'UPDATE products SET name=?, description=?, price=?, image_url=?, category=?, stock=?, design_code=?, is_on_sale=?, sale_price=? WHERE id=?';
    db.run(sql, [name, description, price, mainImage, category, stock, design_code, is_on_sale ? 1 : 0, sale_price, id], function (err) {
        if (err) return res.status(400).json({ error: err.message });

        db.run("DELETE FROM product_variants WHERE product_id = ?", [id], (err) => {
            if (variants && variants.length > 0) {
                variants.forEach(variant => {
                    const variantSize = variant.size || 'N/A';
                    const extraPrice = variant.extra_price || 0;
                    db.run("INSERT INTO product_variants (product_id, color_name, color_hex, size, extra_price) VALUES (?, ?, ?, ?, ?)", [id, variant.color_name, variant.color_hex, variantSize, extraPrice], function (err) {
                        if (err) return;
                        const variantId = this.lastID;
                        if (variant.media) {
                            variant.media.forEach(m => {
                                db.run("INSERT INTO product_variant_media (variant_id, url, type) VALUES (?, ?, ?)", [variantId, m.url, m.type]);
                            });
                        }
                    });
                });
            }
        });
        res.json({ message: "updated" });
    });
});

app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

// =======================
// Banners
// =======================
app.get('/api/banners', (req, res) => {
    db.all("SELECT * FROM banners ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/banners', (req, res) => {
    const { image_url, title, subtitle, link_url } = req.body;
    db.run("INSERT INTO banners (image_url, title, subtitle, link_url) VALUES (?, ?, ?, ?)", [image_url, title, subtitle, link_url], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.delete('/api/banners/:id', (req, res) => {
    db.run("DELETE FROM banners WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

// Serve frontend build
const buildPath = path.join(__dirname, '../dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
