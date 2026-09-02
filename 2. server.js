const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path ya data file - Heroku inahitaji absolute paths
const dataPath = path.join(__dirname, 'data', 'products.json');

// Helper: Soma data
const readData = () => {
    try {
        // Hakikisha folder ya data ipo
        const dir = path.join(__dirname, 'data');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        if (!fs.existsSync(dataPath)) {
            // Create default data
            const defaultData = { products: [] };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { products: [] };
    }
};

// Helper: Andika data
const writeData = (data) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
};

// API routes
app.get('/api/products', (req, res) => {
    try {
        const data = readData();
        res.json(data.products);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/products', (req, res) => {
    try {
        const data = readData();
        const newProduct = {
            id: Date.now(),
            name: req.body.name || 'Mazao',
            price: parseFloat(req.body.price) || 0,
            quantity: parseFloat(req.body.quantity) || 0,
            category: req.body.category || 'Zao',
            image: req.body.image || 'https://via.placeholder.com/150'
        };
        data.products.push(newProduct);
        writeData(data);
        res.json({ success: true, product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        const data = readData();
        data.products = data.products.filter(p => p.id != req.params.id);
        writeData(data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve frontend - Heroku inahitaji hii
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});
