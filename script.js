// CONFIG - Masukkan API Key kamu di sini
const apiKey = "ISI_API_KEY_KAMU_DISINI";

async function callGemini(prompt, systemPrompt = "Kamu adalah Barista handal di Cafe Kenangan Senja.") {
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
    } catch (e) { return "Maaf, AI sedang istirahat."; }
}

const menuData = [
    { id: 1, nama: "Kopi Susu Senja", harga: 22000, img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200" },
    { id: 2, nama: "Caramel Macchiato", harga: 28000, img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=200" },
    { id: 3, nama: "Croissant Original", harga: 18000, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200" },
    { id: 4, nama: "Matcha Latte", harga: 25000, img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200" }
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
    
    // Update active icon
    const activeNav = document.getElementById(`nav-${pageId}`);
    if(activeNav) activeNav.classList.add('active');

    if (pageId === 'cart') renderCart();
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = menuData.map(item => `
        <div class="menu-card">
            <img src="${item.img}" class="menu-img">
            <div class="menu-info">
                <h4 style="margin:0">${item.nama}</h4>
                <p style="color:var(--secondary); font-weight:bold">Rp ${item.harga.toLocaleString('id-ID')}</p>
            </div>
            <button class="btn" style="background:var(--primary); color:white; border-radius:50%; width:35px; height:35px; padding:0" onclick="addToCart(${item.id})">+</button>
        </div>
    `).join('');
}

function addToCart(id) {
    const item = menuData.find(m => m.id === id);
    const exists = cart.find(c => c.id === id);
    if (exists) exists.qty++; else cart.push({...item, qty: 1});
    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('cafe_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((a, b) => a + b.qty, 0);
    document.getElementById('cart-badge').textContent = count;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const footer = document.getElementById('cart-footer');
    const emptyMsg = document.getElementById('empty-cart-msg');

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
            <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; gap: 10px;">
                <img src="${item.img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <p style="font-weight: 600; margin:0">${item.nama}</p>
                    <p style="font-size: 12px; color: #777;">${item.qty}x @ Rp ${item.harga.toLocaleString('id-ID')}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:red; font-size:12px">Hapus</button>
            </div>
        `;
    }).join('');

    document.getElementById('total-amount').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

async function getAIRecommendation() {
    const input = document.getElementById('ai-mood-input');
    const resDiv = document.getElementById('ai-recommendation-result');
    if (!input.value) return;
    
    resDiv.classList.remove('hidden');
    resDiv.textContent = "Barista sedang meracik ide...";
    
    const res = await callGemini(`Rekomendasikan 1 menu dari [Kopi Susu Senja, Caramel Macchiato, Croissant, Matcha] untuk mood: ${input.value}. Berikan alasan singkat.`);
    resDiv.textContent = res;
}

async function optimizeNote() {
    const note = document.getElementById('order-note');
    if(!note.value) return;
    note.placeholder = "Sedang mengoptimalkan...";
    const res = await callGemini(`Rapikan catatan pesanan ini agar mudah dibaca barista: "${note.value}". Langsung tulis hasilnya saja.`);
    note.value = res;
}

async function loadTrivia() {
    const box = document.getElementById('ai-trivia-box');
    const text = document.getElementById('ai-trivia-text');
    box.classList.remove('hidden');
    text.textContent = "Memuat fakta unik...";
    const res = await callGemini("Berikan 1 fakta unik singkat tentang kopi.");
    text.textContent = res;
}

function processOrder() {
    const name = document.getElementById('customer-name').value;
    if (!name || cart.length === 0) return alert("Nama dan Pesanan tidak boleh kosong!");
    
    let text = `Halo Kenangan Senja, saya *${name}* ingin memesan:\n\n`;
    cart.forEach(i => text += `- ${i.nama} (${i.qty}x)\n`);
    text += `\nTotal: *${document.getElementById('total-amount').textContent}*`;
    
    window.location.href = `https://wa.me/628123456789?text=${encodeURIComponent(text)}`;
    cart = []; saveCart();
}

window.onload = init;
