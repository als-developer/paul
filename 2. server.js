const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DATA MANAGEMENT ====================
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');

// Hakikisha folder na file zipo
const ensureDataFile = () => {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
            console.log('📁 Created data directory');
        }
        
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { products: [] };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            console.log('📄 Created products.json file');
        }
    } catch (error) {
        console.error('❌ Error creating data file:', error);
    }
};

// Soma data
const readProducts = () => {
    try {
        ensureDataFile();
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error reading products:', error);
        return { products: [] };
    }
};

// Andika data
const writeProducts = (data) => {
    try {
        ensureDataFile();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error writing products:', error);
        return false;
    }
};

// ==================== API ROUTES ====================

// GET - Ona mazao yote
app.get('/api/products', (req, res) => {
    try {
        const data = readProducts();
        res.status(200).json(data.products);
    } catch (error) {
        console.error('GET /api/products error:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Imeshindwa kupata mazao'
        });
    }
});

// GET - Ona zao moja kwa ID
app.get('/api/products/:id', (req, res) => {
    try {
        const data = readProducts();
        const product = data.products.find(p => p.id == req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                error: 'Not found',
                message: 'Zao halipo'
            });
        }
        
        res.status(200).json(product);
    } catch (error) {
        console.error('GET /api/products/:id error:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Imeshindwa kupata zao'
        });
    }
});

// POST - Ongeza zao jipya
app.post('/api/products', (req, res) => {
    try {
        const { name, price, quantity, category, image } = req.body;
        
        // Validation
        if (!name || !price || !quantity || !category) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Tafadhali jaza sehemu zote muhimu'
            });
        }
        
        const data = readProducts();
        
        const newProduct = {
            id: Date.now(),
            name: name.trim(),
            price: parseFloat(price),
            quantity: parseFloat(quantity),
            category: category.trim(),
            image: image && image.trim() ? image.trim() : 'https://via.placeholder.com/150',
            createdAt: new Date().toISOString()
        };
        
        data.products.push(newProduct);
        
        if (writeProducts(data)) {
            res.status(201).json({
                success: true,
                message: '✅ Mazao yameongezwa!',
                product: newProduct
            });
        } else {
            res.status(500).json({
                error: 'Server error',
                message: 'Imeshindwa kuhifadhi mazao'
            });
        }
    } catch (error) {
        console.error('POST /api/products error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Imeshindwa kuongeza mazao'
        });
    }
});

// PUT - Sasisha zao (hiari)
app.put('/api/products/:id', (req, res) => {
    try {
        const data = readProducts();
        const index = data.products.findIndex(p => p.id == req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Zao halipo'
            });
        }
        
        const { name, price, quantity, category, image } = req.body;
        
        // Update only provided fields
        if (name) data.products[index].name = name.trim();
        if (price) data.products[index].price = parseFloat(price);
        if (quantity) data.products[index].quantity = parseFloat(quantity);
        if (category) data.products[index].category = category.trim();
        if (image) data.products[index].image = image.trim();
        
        data.products[index].updatedAt = new Date().toISOString();
        
        if (writeProducts(data)) {
            res.status(200).json({
                success: true,
                message: '✅ Mazao yamesasishwa!',
                product: data.products[index]
            });
        } else {
            res.status(500).json({
                error: 'Server error',
                message: 'Imeshindwa kusasisha mazao'
            });
        }
    } catch (error) {
        console.error('PUT /api/products/:id error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Imeshindwa kusasisha mazao'
        });
    }
});

// DELETE - Futa zao
app.delete('/api/products/:id', (req, res) => {
    try {
        const data = readProducts();
        const productExists = data.products.some(p => p.id == req.params.id);
        
        if (!productExists) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Zao halipo'
            });
        }
        
        data.products = data.products.filter(p => p.id != req.params.id);
        
        if (writeProducts(data)) {
            res.status(200).json({
                success: true,
                message: '✅ Mazao yamefutwa!'
            });
        } else {
            res.status(500).json({
                error: 'Server error',
                message: 'Imeshindwa kufuta mazao'
            });
        }
    } catch (error) {
        console.error('DELETE /api/products/:id error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Imeshindwa kufuta mazao'
        });
    }
});

// DELETE - Futa mazao yote
app.delete('/api/products', (req, res) => {
    try {
        const data = { products: [] };
        
        if (writeProducts(data)) {
            res.status(200).json({
                success: true,
                message: '✅ Mazao yote yamefutwa!'
            });
        } else {
            res.status(500).json({
                error: 'Server error',
                message: 'Imeshindwa kufuta mazao yote'
            });
        }
    } catch (error) {
        console.error('DELETE /api/products error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Imeshindwa kufuta mazao yote'
        });
    }
});

// ==================== FRONTEND ROUTES ====================

// Serve index.html kwa root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve index.html kwa paths zote zisizojulikana (SPA support)
app.get('*', (req, res) => {
    // Usiingilie API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            error: 'Not found',
            message: 'API endpoint haipo'
        });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// ==================== ERROR HANDLING ====================

// 404 handler for API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'API endpoint haipo'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Global error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Kuna tatizo la server. Tafadhali jaribu tena baadaye.'
    });
});

// ==================== START SERVER ====================

// Hakikisha data folder ipo kabla ya kuanza
ensureDataFile();

app.listen(PORT, '0.0.0.0', () => {
    console.log('=' .repeat(50));
    console.log(`🌾 Mazao App Server`);
    console.log('=' .repeat(50));
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
    console.log('=' .repeat(50));
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    // Keep server running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    // Keep server running
});
