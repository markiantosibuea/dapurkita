import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const catalog: Record<number, { name: string; price: number }> = {
  1:{name:"Rice Bowl Ayam",price:22000},2:{name:"Dimsum Mentai",price:25000},
  3:{name:"Es Kopi Susu",price:18000},4:{name:"Pasta Creamy",price:28000},
  5:{name:"Brownies Cokelat",price:16000},6:{name:"Jus Buah Segar",price:15000},
  7:{name:"Pizza Margherita",price:35000},8:{name:"Burger Special",price:30000},
  9:{name:"Kentang Goreng",price:14000},10:{name:"Ramen Kuah",price:32000},
  11:{name:"Pancake Madu",price:23000},12:{name:"Iced Lemon Tea",price:12000},
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    if (!serverKey) return json({ error: "Payment gateway belum dikonfigurasi oleh pemilik toko." }, 503);
    const body = await req.json();
    const { customer, items } = body;
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address ||
        !Array.isArray(items) || !items.length) return json({ error: "Data pembeli atau produk belum lengkap." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return json({ error: "Email pembeli tidak valid." }, 400);

    const normalized = [];
    let total = 0;
    for (const item of items) {
      const product = catalog[Number(item.id)];
      const qty = Number(item.qty);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 50) return json({ error: "Produk atau jumlah pesanan tidak valid." }, 400);
      normalized.push({ id: String(item.id), price: product.price, quantity: qty, name: product.name });
      total += product.price * qty;
    }
    if (total < 10000 || total > 10000000) return json({ error: "Total transaksi di luar batas yang diizinkan." }, 400);

    const orderId = `DK-${Date.now()}-${crypto.randomUUID().slice(0,8)}`;
    const payload = {
      transaction_details: { order_id: orderId, gross_amount: total },
      item_details: normalized,
      customer_details: {
        first_name: String(customer.name).slice(0,50),
        email: String(customer.email).slice(0,100),
        phone: String(customer.phone).slice(0,20),
        billing_address: { address: String(customer.address).slice(0,200) },
        shipping_address: { address: String(customer.address).slice(0,200) },
      },
      enabled_payments: ["credit_card","bank_transfer","bca_va","bni_va","bri_va","permata_va","other_va","gopay","shopeepay","qris","indomaret","alfamart"],
      callbacks: { finish: "https://markiantosibuea.github.io/dapurkita/?payment=finish" },
    };
    const isProduction = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
    const endpoint = isProduction ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
    const auth = btoa(serverKey + ":");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Midtrans create transaction failed", result);
      return json({ error: "Pembayaran belum dapat dibuat. Silakan coba kembali." }, 502);
    }
    // Kirim notifikasi pesanan baru ke email pemilik. Kegagalan email tidak membatalkan transaksi.
    const emailKey = Deno.env.get("RESEND_API_KEY");
    const ownerEmail = Deno.env.get("ORDER_NOTIFICATION_EMAIL");
    if (emailKey && ownerEmail) {
      const orderLines = normalized.map((item) => `- ${item.name} x${item.quantity}: Rp${(item.price * item.quantity).toLocaleString("id-ID")}`).join("\n");
      const emailText = [
        "Ada pesanan baru di DapurKita yang menunggu pembayaran.",
        "",
        `Order ID: ${orderId}`,
        `Nama: ${String(customer.name)}`,
        `Email pembeli: ${String(customer.email)}`,
        `WhatsApp: ${String(customer.phone)}`,
        `Alamat: ${String(customer.address)}`,
        "",
        "Rincian:",
        orderLines,
        "",
        `Total: Rp${total.toLocaleString("id-ID")}`,
        "",
        "Status: Menunggu pembayaran. Status akhir akan dikirim melalui notifikasi Midtrans."
      ].join("\n");
      const mail = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${emailKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM_EMAIL") || "DapurKita <onboarding@resend.dev>",
          to: [ownerEmail],
          subject: `Pesanan baru ${orderId} — menunggu pembayaran`,
          text: emailText
        }),
      });
      if (!mail.ok) console.error("Order email failed", await mail.text());
    }
    return json({ order_id: orderId, token: result.token, redirect_url: result.redirect_url, amount: total });
  } catch (error) {
    console.error(error);
    return json({ error: "Terjadi kesalahan saat menyiapkan pembayaran." }, 500);
  }
});
