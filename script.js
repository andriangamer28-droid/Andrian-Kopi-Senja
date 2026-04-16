const apiKey = ""; // Masukkan API Key kamu di sini

async function callGemini(prompt, systemPrompt = "Barista ramah di Cafe Kenangan Senja.") {
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
    } catch (e) { return "Maaf, barista AI sedang offline sebentar."; }
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
    // Scroll ke atas setiap kali reload
    document.getElementById('main-content').scrollTop = 0;
}

function showPage(pageId) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`nav-${pageId}`)?.classList.add('active');
    
    // Reset scroll ke atas saat pindah halaman
    document.getElementById('main-content').scrollTop = 0;

    if (pageId === 'cart') renderCart();
    if (pageId === 'checkout') loadTrivia();
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = menuData.map(m => `
        <div class="menu-card">
            <img src="${m.img}" class="menu-img">
            <div class="menu-info">
                <h3>${m.nama}</h3>
                <p>Rp ${m.harga.toLocaleString('id-ID')}</p>
            </div>
            <button class="btn" style="background:var(--primary); color:white; border-radius:50%; width:35px; height:35px; padding:0" onclick="addToCart(${m.id})">+</button>
        </div>
    `).join('');
}

function addToCart(id) {
    const item = menuData.find(m => m.id === id);
    const exists = cart.find(c => c.id === id);
    if (exists) exists.qty++; else cart.push({...item, qty: 1});
    saveAndRefresh();
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    saveAndRefresh();
    renderCart();
}

function saveAndRefresh() {
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
    const empty = document.getElementById('empty-cart-msg');

    if (cart.length === 0) {
        container.innerHTML = "";
        footer.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    footer.classList.remove('hidden');

    let total = 0;
    container.innerHTML = cart.map(c => {
        total += (c.harga * c.qty);
        return `
            <div style="display:flex; align-items:center; gap:15px; padding:15px 0; border-bottom:1px solid #eee">
                <img src="${c.img}" style="width:50px; height:50px; border-radius:10px; object-fit:cover">
                <div style="flex:1">
                    <h4 style="font-size:14px">${c.nama}</h4>
                    <p style="font-size:12px; color:#888">${c.qty}x @ Rp ${c.harga.toLocaleString('id-ID')}</p>
                </div>
                <button onclick="removeFromCart(${c.id})" style="background:none; border:none; color:red; font-size:12px">Hapus</button>
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
    resDiv.textContent = "Barista AI sedang berpikir...";
    const res = await callGemini(`Rekomendasikan 1 menu kopi/snack berdasarkan mood ini: ${input.value}`);
    resDiv.textContent = res;
}

async function loadTrivia() {
    const text = document.getElementById('ai-trivia-text');
    text.textContent = "Menyiapkan fakta unik seputar kopi...";
    const res = await callGemini("Berikan 1 fakta singkat dan unik tentang kopi.");
    text.textContent = res;
}

async function optimizeNote() {
    const note = document.getElementById('order-note');
    if (!note.value) return;
    const oldVal = note.value;
    note.value = "Sedang merapikan...";
    const res = await callGemini(`Tulis ulang catatan pesanan ini agar lebih sopan dan rapi: ${oldVal}`);
    note.value = res;
}

function processOrder() {
    const name = document.getElementById('customer-name').value;
    if (!name || cart.length === 0) return alert("Lengkapi nama dan pesanan!");
    
    let msg = `Halo Kopi Senja, saya *${name}* ingin pesan:\n\n`;
    cart.forEach(c => msg += `- ${c.nama} (${c.qty}x)\n`);
    msg += `\nTotal: *${document.getElementById('total-amount').textContent}*`;
    
    window.location.href = `https://wa.me/628123456789?text=${encodeURIComponent(msg)}`;
    cart = []; saveAndRefresh();
}

window.onload = init;
