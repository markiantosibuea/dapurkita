(() => {
  const modal = document.getElementById("checkout-modal");
  const form = document.getElementById("checkout-form");
  const close = document.getElementById("checkout-close");
  const totalEl = document.getElementById("checkout-total");
  const errorEl = document.getElementById("checkout-error");
  const payButton = document.getElementById("checkout-pay-button");
  const config = window.DAPURKITA_PAYMENT_CONFIG || {};
  const format = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
  const total = () => cart.reduce((sum,item) => sum + products.find(p=>p.id===item.id).price*item.qty,0);
  const open = () => {
    if (!cart.length) return;
    totalEl.textContent = format(total());
    errorEl.textContent = "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
  };
  const shut = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); };
  // Intercept the original WhatsApp checkout action and show the online-payment form.
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
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if (!cart.length) { errorEl.textContent="Keranjang masih kosong."; return; }
    if (!config.supabaseUrl || config.supabaseUrl.includes("YOUR_PROJECT_ID") ||
        !config.supabaseAnonKey || config.supabaseAnonKey.includes("YOUR_SUPABASE")) {
      errorEl.textContent="Pembayaran online belum diaktifkan. Pemilik toko perlu menyelesaikan konfigurasi Supabase terlebih dahulu.";
      return;
    }
    const values = Object.fromEntries(new FormData(form).entries());
    payButton.disabled=true;
    payButton.textContent="Menyiapkan pembayaran...";
    errorEl.textContent="";
    try {
      const response = await fetch(config.supabaseUrl.replace(/\/$/,"")+"/functions/v1/create-payment",{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":config.supabaseAnonKey,"Authorization":"Bearer "+config.supabaseAnonKey},
        body:JSON.stringify({customer:values,items:cart.map(item=>({id:item.id,qty:item.qty}))})
      });
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||"Pembayaran gagal disiapkan.");
      if(!result.redirect_url) throw new Error("Tautan pembayaran tidak diterima.");
      window.location.href=result.redirect_url;
    } catch(error) {
      errorEl.textContent=error.message||"Koneksi gagal. Silakan coba lagi.";
      payButton.disabled=false;
      payButton.textContent="Lanjut ke pembayaran ↗";
    }
  });
})();
