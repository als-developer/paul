const API_URL = '/api/products';

async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network error');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productList').innerHTML = 
            '<p style="color:red;">❌ Imeshindwa kupakia mazao</p>';
    }
}

function displayProducts(products) {
    const container = document.getElementById('productList');
    
    if (!products || products.length === 0) {
        container.innerHTML = `<p style="text-align:center;color:#666;">Hakuna mazao bado. Ongeza mazao!</p>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="price">TSh ${(p.price || 0).toLocaleString()}</div>
            <div class="details">📦 Kiasi: ${p.quantity || 0}</div>
            <div class="details">📂 ${p.category || 'Zao'}</div>
            <button class="delete-btn" onclick="deleteProduct(${p.id})">🗑️ Futa</button>
        </div>
    `).join('');
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        price: parseFloat(document.getElementById('price').value) || 0,
        quantity: parseFloat(document.getElementById('quantity').value) || 0,
        category: document.getElementById('category').value.trim() || 'Zao',
        image: document.getElementById('image').value.trim()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('productForm').reset();
            loadProducts();
            alert('✅ Mazao yameongezwa!');
        } else {
            alert('❌ Imeshindwa kuongeza');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Imeshindwa kuongeza mazao');
    }
});

async function deleteProduct(id) {
    if (!confirm('Una uhakika unataka kufuta zao hili?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProducts();
            alert('✅ Mazao yamefutwa!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Imeshindwa kufuta');
    }
}

// Load on start
loadProducts();
