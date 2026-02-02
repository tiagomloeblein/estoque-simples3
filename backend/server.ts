import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'inventory.db');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const db = new Database(DB_PATH);
app.use(cors());
app.use(express.json());
// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Database Initialization (Schema Only)
const initDb = () => {
    // Categories Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT, 
        category_id INTEGER,
        quantity INTEGER DEFAULT 0,
        price REAL DEFAULT 0.00,
        min_stock INTEGER DEFAULT 5,
        description TEXT,
        image TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    // Stock Movements Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')),
        quantity INTEGER NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    // Migrations
    try { db.prepare("ALTER TABLE products ADD COLUMN image TEXT").run(); } catch (e) { }
    try { db.prepare("ALTER TABLE products ADD COLUMN category_id INTEGER REFERENCES categories(id)").run(); } catch (e) { }
};

// Seed Data Function (Called explicitly by installer)
const seedData = () => {
    const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
    if (catCount.count === 0) {
        const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
        const cats = ['Eletrônicos', 'Periféricos', 'Móveis', 'Escritório'];
        cats.forEach(c => insertCat.run(c));
        console.log("Categorias padrão inseridas.");

        const cat = db.prepare('SELECT id, name FROM categories WHERE name = ?').get('Eletrônicos') as {id: number, name: string};
        if (cat) {
            db.prepare(`
                INSERT INTO products (name, category, category_id, quantity, price, min_stock, description, image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                'Produto Teste - Smartphone X', 
                cat.name, 
                cat.id, 
                50, 
                2999.99, 
                10, 
                'Produto de teste gerado automaticamente.',
                ''
            );
        }
    }
};

initDb();

// --- Routes ---

// Setup / Install Routes
app.get('/api/setup/status', (req, res) => {
    try {
        const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
        // If we have categories, we consider it installed
        res.json({ installed: catCount.count > 0 });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/setup/install', (req, res) => {
    try {
        seedData();
        res.json({ success: true, message: 'Sistema instalado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Falha na instalação' });
    }
});

// 1. Categories
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

app.post('/api/categories', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
        const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
        const info = stmt.run(name);
        res.status(201).json({ id: info.lastInsertRowid, name });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json({ message: 'Categoria removida' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover categoria. Verifique se há produtos vinculados.' });
    }
});

// 2. Products (with Pagination & Filters)
app.get('/api/products', (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search ? `%${req.query.search}%` : '%';
        const categoryId = req.query.category_id;
        const lowStock = req.query.low_stock === 'true';

        // Construct base Query
        let baseSql = `
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE (p.name LIKE ? OR p.description LIKE ?)
        `;
        const params: any[] = [search, search];

        if (categoryId) {
            baseSql += ` AND p.category_id = ?`;
            params.push(categoryId);
        }

        if (lowStock) {
            baseSql += ` AND p.quantity <= p.min_stock`;
        }

        // Count total for pagination
        const countSql = `SELECT COUNT(*) as total ${baseSql}`;
        const totalResult = db.prepare(countSql).get(...params) as { total: number };

        // Fetch data
        const dataSql = `SELECT p.*, c.name as category_name ${baseSql} ORDER BY p.updated_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const products = db.prepare(dataSql).all(...params);

        res.json({
            data: products,
            pagination: {
                total: totalResult.total,
                page,
                limit,
                pages: Math.ceil(totalResult.total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

app.post('/api/products', upload.single('image'), (req, res) => {
    try {
        const { name, category_id, quantity, price, min_stock, description } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';
        
        // Get Category Name for redundancy/display (optional)
        const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(category_id) as {name: string};
        const categoryName = cat ? cat.name : 'Geral';

        const stmt = db.prepare(`
            INSERT INTO products (name, category, category_id, quantity, price, min_stock, description, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(name, categoryName, category_id, quantity, price, min_stock, description || '', image);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body, image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
    try {
        const { id } = req.params;
        const { name, category_id, quantity, price, min_stock, description } = req.body;
        
        // Get existing product to keep image if not uploaded
        const existing = db.prepare('SELECT image FROM products WHERE id = ?').get(id) as { image: string };
        if (!existing) return res.status(404).json({ error: 'Produto não encontrado' });

        const image = req.file ? `/uploads/${req.file.filename}` : existing.image;
        
        const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(category_id) as {name: string};
        const categoryName = cat ? cat.name : 'Geral';

        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, category = ?, category_id = ?, quantity = ?, price = ?, min_stock = ?, description = ?, image = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(name, categoryName, category_id, quantity, price, min_stock, description || '', image, id);
        res.json({ id, ...req.body, image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        const { id } = req.params;
        // Optional: Delete image file
        const product = db.prepare('SELECT image FROM products WHERE id = ?').get(id) as { image: string };
        if (product && product.image) {
            const imagePath = path.join(DATA_DIR, product.image.replace('/uploads/', 'uploads/'));
            if (fs.existsSync(imagePath)) {
                try { fs.unlinkSync(imagePath); } catch(e) {}
            }
        }

        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json({ message: 'Produto removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

// 3. Stock Movements (Robust Validation)
app.post('/api/movements', (req, res) => {
    const { product_id, type, quantity, reason } = req.body;
    
    if (!product_id || !type || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }

    try {
        db.transaction(() => {
            const product = db.prepare('SELECT quantity, name FROM products WHERE id = ?').get(product_id) as {quantity: number, name: string};
            
            if (!product) throw new Error('Produto não encontrado');

            if (type === 'OUT' && product.quantity < quantity) {
                throw new Error(`Estoque insuficiente. Disponível: ${product.quantity}`);
            }

            // 1. Insert Movement
            db.prepare(`
                INSERT INTO stock_movements (product_id, type, quantity, reason)
                VALUES (?, ?, ?, ?)
            `).run(product_id, type, quantity, reason || '');

            // 2. Update Product
            let sql = '';
            if (type === 'IN') {
                sql = 'UPDATE products SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            } else {
                sql = 'UPDATE products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            }
            db.prepare(sql).run(quantity, product_id);
        })();

        res.status(201).json({ message: 'Movimentação registrada com sucesso' });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Erro ao registrar movimentação' });
    }
});

// 4. Reports (Enhanced)
app.get('/api/reports', (req, res) => {
    try {
        // Simple optimization: Limit last 1000 movements for performance
        const stmt = db.prepare(`
            SELECT m.*, p.name as product_name, p.category 
            FROM stock_movements m
            LEFT JOIN products p ON m.product_id = p.id
            ORDER BY m.created_at DESC
            LIMIT 1000
        `);
        const reports = stmt.all();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});