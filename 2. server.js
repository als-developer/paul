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
app.use(express.static('public'));

// Path ya data file
const dataPath = path.join(__dirname, 'data', 'products.json');

// Helper: Soma data
const readData = () => {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { products: [] };
    }
};

// Helper: Andika data
const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// API: Get all products
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// API: Add product
app.post('/api/products', (req, res) => {
    const data = readData();
    const newProduct = {
        id: Date.now(),
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        category: req.body.category,
        image: req.body.image || 'https://via.placeholder.com/150'
    };
    data.products.push(newProduct);
    writeData(data);
    res.json({ success: true, product: newProduct });
});

// API: Delete product
app.delete('/api/products/:id', (req, res) => {
    const data = readData();
    data.products = data.products.filter(p => p.id != req.params.id);
    writeData(data);
    res.json({ success: true });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
