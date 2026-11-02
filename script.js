// Nomor WhatsApp toko: isi dengan nomor aktif format internasional tanpa tanda + atau spasi.
const NOMOR_WA_TOKO = "";

const products = [
  {id:1,name:"Rice Bowl Ayam",category:"Makanan",price:22000,tag:"Favorit",description:"Ayam gurih dengan nasi hangat dan sayuran.",image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"},
  {id:2,name:"Dimsum Mentai",category:"Camilan",price:25000,tag:"Best seller",description:"Dimsum lembut dengan saus mentai creamy.",image:"https://images.unsplash.com/photo-156324包?auto=format&fit=crop&w=800&q=80"},
  {id:3,name:"Es Kopi Susu",category:"Minuman",price:18000,tag:"Segar",description:"Perpaduan kopi, susu, dan gula aren.",image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80"},
  {id:4,name:"Pasta Creamy",category:"Makanan",price:28000,tag:"Pilihan chef",description:"Pasta dengan saus creamy yang kaya rasa.",image:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80"},
  {id:5,name:"Brownies Cokelat",category:"Camilan",price:16000,tag:"Manisnya pas",description:"Brownies cokelat lembut untuk teman santai.",image:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"},
  {id:6,name:"Jus Buah Segar",category:"Minuman",price:15000,tag:"Fresh",description:"Minuman buah segar untuk hari yang cerah.",image:"https://images.unsplash.com/photo-果汁?auto=format&fit=crop&w=800&q=80"}
];

const rupiah = value => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
let activeCategory = "Semua";
let cart = [];
const grid = document.getElementById("product-grid");
const cartPanel = document.getElementById("cart-panel");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

function renderProducts(){
  const term = document.getElementById("search-input").value.trim().toLowerCase();
  const filtered = products.filter(p => (activeCategory === "Semua" || p.category === activeCategory) && (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)));
  if(!filtered.length){grid.innerHTML='<div class="empty-state">Belum ada menu yang cocok. Coba kata kunci lain, ya.</div>';return;}
  grid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/600x450/f1eee8/777?text=DapurKita'"><span class="product-tag">${p.tag}</span></div>
      <div class="product-info"><div class="product-info-top"><div><h3>${p.name}</h3><p>${p.description}</p></div><span class="product-price">${rupiah(p.price)}</span></div><button class="add-button" data-add="${p.id}">＋ Tambahkan</button></div>
    </article>`).join("");
}
function notify(message){toast.textContent=message;toast.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove("show"),2200);}
function addToCart(id){const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});renderCart();notify("Ditambahkan ke keranjang!");}
function changeQty(id,delta){const item=cart.find(x=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);renderCart();}
function renderCart(){
  const count=cart.reduce((n,x)=>n+x.qty,0);
  const total=cart.reduce((n,x)=>n+products.find(p=>p.id===x.id).price*x.qty,0);
  document.getElementById("cart-count").textContent=count;
  document.getElementById("panel-count").textContent="("+count+")";
  document.getElementById("cart-subtotal").textContent=rupiah(total);
  document.getElementById("checkout-button").disabled=count===0;
  document.getElementById("cart-items").innerHTML=count===0?'<div class="cart-empty">Keranjangmu masih kosong.<br>Yuk, temukan sesuatu yang lezat! 🍊</div>':cart.map(x=>{const p=products.find(y=>y.id===x.id);return `
    <div class="cart-row"><img src="${p.image}" alt=""><div><h3>${p.name}</h3><p>${rupiah(p.price)}</p><div class="quantity"><button data-qty="${p.id}" data-delta="-1" aria-label="Kurangi">−</button><span>${x.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Tambah">＋</button></div></div><button class="remove-item" data-remove="${p.id}" aria-label="Hapus ${p.name}">✕</button></div>`;}).join("");
}
function openCart(){cartPanel.classList.add("open");overlay.classList.add("visible");cartPanel.setAttribute("aria-hidden","false");}
function closeCart(){cartPanel.classList.remove("open");overlay.classList.remove("visible");cartPanel.setAttribute("aria-hidden","true");}
function checkout(){
  if(!cart.length)return;
  if(!/^\d{9,15}$/.test(NOMOR_WA_TOKO)){notify("Nomor WhatsApp toko belum diatur oleh pemilik.");return;}
  const lines=cart.map(x=>{const p=products.find(y=>y.id===x.id);return `• ${p.name} x${x.qty} — ${rupiah(p.price*x.qty)}`;});
  const total=cart.reduce((n,x)=>n+products.find(p=>p.id===x.id).price*x.qty,0);
  const message=["Halo DapurKita! Saya ingin memesan:","",...lines,"",`Total sementara: ${rupiah(total)}`,"Mohon info ketersediaan dan ongkos kirim. Terima kasih!"].join("\n");
  window.open("https://wa.me/"+NOMOR_WA_TOKO+"?text="+encodeURIComponent(message),"_blank","noopener,noreferrer");
}
document.getElementById("category-list").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".category-chip").forEach(x=>x.classList.toggle("active",x===b));renderProducts();});
document.getElementById("search-input").addEventListener("input",renderProducts);
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(Number(b.dataset.add));});
document.getElementById("cart-items").addEventListener("click",e=>{const q=e.target.closest("[data-qty]");const r=e.target.closest("[data-remove]");if(q)changeQty(Number(q.dataset.qty),Number(q.dataset.delta));if(r)changeQty(Number(r.dataset.remove),-999);});
document.getElementById("open-cart").addEventListener("click",openCart);
document.getElementById("close-cart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.getElementById("checkout-button").addEventListener("click",checkout);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart();});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();