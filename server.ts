import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { initialProducts, initialCategories, initialOffers, initialBanners, initialSettings, initialOrders } from './src/data/initialData.ts';
import { Product, Category, Offer, Banner, WebsiteSettings, Order } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure data and uploads directory exist
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'savvio_db.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  offers: Offer[];
  banners: Banner[];
  settings: WebsiteSettings;
  orders: Order[];
  admin: {
    email: string;
    passwordHash: string; // Plain/hash for simple demonstration
  };
}

// Initialize database if not existing
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed reading database file, resetting to initial data:', err);
  }

  const initialDb: DatabaseSchema = {
    products: initialProducts,
    categories: initialCategories,
    offers: initialOffers,
    banners: initialBanners,
    settings: initialSettings,
    orders: initialOrders,
    admin: {
      email: 'admin@savvio.com',
      passwordHash: 'savvio2025',
    },
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static assets from public/
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// ==========================================
// API ROUTES
// ==========================================

// Image Upload Endpoint
app.post('/api/upload', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    url: publicUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Multiple image upload endpoint
app.post('/api/upload-multiple', upload.array('images', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No image files uploaded' });
  }
  const urls = files.map((f) => `/uploads/${f.filename}`);
  return res.json({
    success: true,
    urls,
  });
});

// 1. PRODUCTS API
app.get('/api/products', (_req: Request, res: Response) => {
  res.json(db.products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', (req: Request, res: Response) => {
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  // Calculate discount percentage if prices provided
  if (newProduct.regular_price && newProduct.sale_price) {
    const diff = newProduct.regular_price - newProduct.sale_price;
    newProduct.discount_percentage = Math.max(0, Math.round((diff / newProduct.regular_price) * 100));
  }

  db.products.unshift(newProduct);
  saveDatabase(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const updated: Product = {
    ...db.products[idx],
    ...req.body,
    id: req.params.id,
  };

  if (updated.regular_price && updated.sale_price) {
    const diff = updated.regular_price - updated.sale_price;
    updated.discount_percentage = Math.max(0, Math.round((diff / updated.regular_price) * 100));
  }

  db.products[idx] = updated;
  saveDatabase(db);
  res.json(updated);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== req.params.id);
  if (db.products.length === initialLen) {
    return res.status(404).json({ error: 'Product not found' });
  }
  saveDatabase(db);
  res.json({ success: true, message: 'Product deleted' });
});

// 2. CATEGORIES API
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const newCategory: Category = {
    ...req.body,
    id: req.body.id || `cat-${Date.now()}`,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
    display_order: req.body.display_order || db.categories.length + 1,
    is_active: req.body.is_active !== undefined ? req.body.is_active : true,
  };
  db.categories.push(newCategory);
  saveDatabase(db);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  const idx = db.categories.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Category not found' });
  db.categories[idx] = { ...db.categories[idx], ...req.body, id: req.params.id };
  saveDatabase(db);
  res.json(db.categories[idx]);
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// 3. ORDERS API
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json(db.orders);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const orderCount = db.orders.length + 1001;
  const newOrder: Order = {
    ...req.body,
    id: req.body.id || `ord-${Date.now()}`,
    order_number: req.body.order_number || `SAV-${orderCount}`,
    status: req.body.status || 'pending',
    channel: req.body.channel || 'whatsapp',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = req.body.status;
  order.updated_at = new Date().toISOString();
  saveDatabase(db);
  res.json(order);
});

// 4. OFFERS API
app.get('/api/offers', (_req: Request, res: Response) => {
  res.json(db.offers);
});

app.post('/api/offers', (req: Request, res: Response) => {
  const newOffer: Offer = {
    ...req.body,
    id: req.body.id || `off-${Date.now()}`,
    is_active: req.body.is_active !== undefined ? req.body.is_active : true,
  };
  db.offers.push(newOffer);
  saveDatabase(db);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id', (req: Request, res: Response) => {
  const idx = db.offers.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Offer not found' });
  db.offers[idx] = { ...db.offers[idx], ...req.body, id: req.params.id };
  saveDatabase(db);
  res.json(db.offers[idx]);
});

app.delete('/api/offers/:id', (req: Request, res: Response) => {
  db.offers = db.offers.filter((o) => o.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// 5. BANNERS API
app.get('/api/banners', (_req: Request, res: Response) => {
  res.json(db.banners);
});

app.put('/api/banners/:id', (req: Request, res: Response) => {
  const idx = db.banners.findIndex((b) => b.id === req.params.id);
  if (idx === -1) {
    const newBanner: Banner = { ...req.body, id: req.params.id };
    db.banners.push(newBanner);
    saveDatabase(db);
    return res.json(newBanner);
  }
  db.banners[idx] = { ...db.banners[idx], ...req.body, id: req.params.id };
  saveDatabase(db);
  res.json(db.banners[idx]);
});

// 6. SETTINGS API
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json(db.settings);
});

// 7. AUTH API
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (email.trim().toLowerCase() === db.admin.email.toLowerCase() && password === db.admin.passwordHash) {
    return res.json({
      success: true,
      token: `token_${Date.now()}_savvio_admin`,
      user: {
        email: db.admin.email,
        name: 'Store Owner',
        role: 'admin',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid email or password' });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    productsCount: db.products.length,
    ordersCount: db.orders.length,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// VITE DEV SERVER OR STATIC PROD SERVE
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAVVIO E-Commerce Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
