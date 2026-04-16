// CONFIG - Masukkan API Key kamu di sini
const apiKey = "YOUR_GEMINI_API_KEY";

async function callGemini(prompt, systemPrompt = "Barista Cafe Kenangan Senja.") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("AI Error:", error);
        return null;
    }
}

const menuData = [
    { id: 1, nama: "Kopi Susu Senja", harga: 22000, img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200", desc: "Signature iced coffee" },
    { id: 2, nama: "Caramel Macchiato", harga: 28000, img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=200", desc: "Creamy sweet" },
    { id: 3, nama: "Croissant Original", harga: 18000, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200", desc: "Buttery" },
    { id: 4, nama: "Matcha Latte", harga: 25000, img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200", desc: "Pure Green Tea" }
];

let cart = JSON.parse(localStorage.getItem('cafe_cart')) || [];

function init() {
    renderMenu();
    updateCartUI();
    lucide.createIcons();
}

function showPage(pageId) {
    document.querySelectorAll('section').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`nav-${pageId}`)?.classList.add('active');
    if (pageId === 'cart') renderCart();
    if (pageId === 'checkout') loadTrivia();
}
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const footer = document.getElementById('cart-footer');
    const emptyMsg = document.getElementById('empty-cart-msg');
    
    // Debugging: Cek apakah cart ada isinya
    console.log("Isi keranjang:", cart);

    if (cart.length === 0) {
        container.innerHTML = "";
        footer.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
        return;
    }

    emptyMsg.classList.add('hidden');
    footer.classList.remove('hidden');

    let total = 0;
    container.innerHTML = cart.map(item => {
        const sub = item.harga * item.qty;
        total += sub;
        return `
            <div class="cart-item" style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; gap: 15px;">
                <img src="${item.img}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.9rem; margin: 0;">${item.nama}</h4>
                    <p style="font-size: 0.8rem; color: var(--secondary); margin: 0;">${item.qty}x - Rp ${item.harga.toLocaleString('id-ID')}</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: 600; font-size: 0.9rem; margin: 0;">Rp ${sub.toLocaleString('id-ID')}</p>
                    <button onclick="removeFromCart(${item.id})" style="color: #e74c3c; border: none; background: none; cursor: pointer;">
                        Hapus
                    </button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('subtotal-amount').textContent = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('total-amount').textContent = `Rp ${total.toLocaleString('id-ID')}`;
                        }
function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = menuData.map(item => `
        <div class="menu-card">
            <img src="${item.img}" class="menu-img">
            <div class="menu-info">
                <h3>${item.nama}</h3>
                <p class="price">Rp ${item.harga.toLocaleString('id-ID')}</p>
            </div>
            <button class="add-btn" onclick="addToCart(${item.id})"><i data-lucide="plus"></i></button>
        </div>
    `).join('');
    lucide.createIcons();
}

function addToCart(id) {
    const item = menuData.find(m => m.id === id);
    const exists = cart.find(c => c.id === id);
    if (exists) exists.qty++; else cart.push({...item, qty: 1});
    localStorage.setItem('cafe_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((a, b) => a + b.qty, 0);
    document.getElementById('cart-badge').textContent = count;
}

async function getAIRecommendation() {
    const input = document.getElementById('ai-mood-input');
    const resDiv = document.getElementById('ai-recommendation-result');
    if (!input.value) return;
    
    resDiv.classList.remove('hidden');
    resDiv.textContent = "Barista sedang berpikir...";
    
    const prompt = `Pilih 1 dari menu [Kopi Susu Senja, Caramel Macchiato, Croissant, Matcha] untuk mood: ${input.value}. Berikan alasan singkat.`;
    const res = await callGemini(prompt);
    resDiv.textContent = res || "Gagal memuat rekomendasi.";
}

function processOrder() {
    const name = document.getElementById('customer-name').value;
    if (!name || cart.length === 0) return alert("Lengkapi data!");
    
    let text = `Pesanan atas nama: ${name}\n`;
    cart.forEach(i => text += `- ${i.nama} (${i.qty}x)\n`);
    
    window.location.href = `https://wa.me/628123456789?text=${encodeURIComponent(text)}`;
    cart = []; localStorage.removeItem('cafe_cart');
}

window.onload = init;
