(() => {
  const modal = document.getElementById("checkout-modal");
  const form = document.getElementById("checkout-form");
  const close = document.getElementById("checkout-close");
  const totalEl = document.getElementById("checkout-total");
  const errorEl = document.getElementById("checkout-error");
  const submitButton = document.getElementById("checkout-pay-button");
  const SHOP_WHATSAPP = "6281244910233";
  const format = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
  const total = () => cart.reduce((sum,item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  },0);
  const open = () => {
    if (!cart.length) return;
    totalEl.textContent = format(total());
    errorEl.textContent = "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
  };
  const shut = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  };

  // Ganti alur checkout lama agar seluruh pesanan dikirim melalui WhatsApp.
  document.addEventListener("click", event => {
    const button = event.target.closest("#checkout-button");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open();
  }, true);

  close.addEventListener("click",shut);
  modal.addEventListener("click",event=>{if(event.target===modal)shut();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")shut();});

  form.addEventListener("submit",event=>{
    event.preventDefault();
    if (!cart.length) {
      errorEl.textContent = "Keranjang masih kosong.";
      return;
    }
    if (!form.reportValidity()) return;

    const values = Object.fromEntries(new FormData(form).entries());
    const items = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      return product ? {product,qty:item.qty} : null;
    }).filter(Boolean);
    const orderTotal = total();
    const lines = items.map(({product,qty}) =>
      `• ${product.name} x${qty} — ${format(product.price * qty)}`
    );
    const message = [
      "Halo DapurKita! Saya ingin memesan makanan/minuman berikut:",
      "",
      ...lines,
      "",
      `Total pesanan: ${format(orderTotal)}`,
      "",
      "Data pemesan:",
      `Nama: ${values.name}`,
      `Email: ${values.email}`,
      `WhatsApp: ${values.phone}`,
      `Alamat: ${values.address}`,
      "",
      "Mohon konfirmasi pesanan dan informasi ongkos kirim. Terima kasih!"
    ].join("\n");

    const whatsappUrl = "https://wa.me/" + SHOP_WHATSAPP + "?text=" + encodeURIComponent(message);
    const newWindow = window.open(whatsappUrl,"_blank");
    if (!newWindow) {
      errorEl.textContent = "Popup diblokir browser. Izinkan popup atau coba kembali.";
      return;
    }
    newWindow.opener = null;
    shut();
  });
})();