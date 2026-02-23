import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const verboseSqlite = sqlite3.verbose();

const dbPath = path.resolve(__dirname, 'shoap.db');

// Connect to SQLite database
const db = new verboseSqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize tables
db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    design_code TEXT,
    is_on_sale BOOLEAN DEFAULT 0,
    sale_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
        if (err) {
            console.error("Error creating products table:", err.message);
        } else {
            console.log("Products table ready.");
            // Check and add new columns if they don't exist
            db.all("PRAGMA table_info(products)", (err, columns) => {
                if (err) return;
                const colNames = columns.map(c => c.name);
                if (!colNames.includes('design_code')) db.run("ALTER TABLE products ADD COLUMN design_code TEXT");
                if (!colNames.includes('is_on_sale')) db.run("ALTER TABLE products ADD COLUMN is_on_sale BOOLEAN DEFAULT 0");
                if (!colNames.includes('sale_price')) db.run("ALTER TABLE products ADD COLUMN sale_price REAL");
            });
        }
    });

    // Users table (for admin login)
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
        if (err) {
            console.error("Error creating users table:", err.message);
        } else {
            console.log("Users table ready.");

            // Seed default admin user if not exists
            const insert = 'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)';
            db.run(insert, ["admin", "admin123"], (err) => {
                if (err) {
                    console.error("Error creating default admin:", err.message);
                } else {
                    console.log("Default admin user ensured.");
                }
            });
        }
    });

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
        if (err) {
            console.error("Error creating categories table:", err.message);
        } else {
            console.log("Categories table ready.");
            db.all("PRAGMA table_info(categories)", (err, columns) => {
                if (err) return;
                if (!columns.some(c => c.name === 'image_url')) {
                    db.run("ALTER TABLE categories ADD COLUMN image_url TEXT");
                }
            });
        }
    });

    // Banners table
    db.run(`CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      link_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Product Variants (Colors) table
    db.run(`CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      color_name TEXT NOT NULL,
      color_hex TEXT NOT NULL,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    )`);

    // Product Variant Media (Images/Videos) table
    db.run(`CREATE TABLE IF NOT EXISTS product_variant_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_id INTEGER,
      url TEXT NOT NULL,
      type TEXT NOT NULL,  -- 'image' or 'youtube'
      FOREIGN KEY(variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    )`);
});

export default db;
