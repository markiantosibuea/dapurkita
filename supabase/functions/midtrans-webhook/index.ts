import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

async function sha512(value: string) {
  const digest = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    const emailKey = Deno.env.get("RESEND_API_KEY");
    const ownerEmail = Deno.env.get("ORDER_NOTIFICATION_EMAIL");
    if (!serverKey || !emailKey || !ownerEmail) return new Response("Webhook belum dikonfigurasi", { status: 503 });
    const data = await req.json();
    const expected = await sha512(String(data.order_id) + String(data.status_code) + String(data.gross_amount) + serverKey);
    if (expected !== data.signature_key) return new Response("Invalid signature", { status: 401 });

    const status = String(data.transaction_status || "");
    const fraud = String(data.fraud_status || "");
    const paid = status === "settlement" || (status === "capture" && fraud === "accept");
    const subject = paid ? `Pembayaran diterima — ${data.order_id}` : `Pembaruan pesanan — ${data.order_id}`;
    const message = [
      paid ? "Pembayaran DapurKita berhasil diterima." : "Ada pembaruan status transaksi DapurKita.",
      "", `Order ID: ${data.order_id}`, `Status transaksi: ${status}`,
      `Metode pembayaran: ${data.payment_type || "Tidak tersedia"}`,
      `Total transaksi: Rp${Number(data.gross_amount || 0).toLocaleString("id-ID")}`,
      "", "Periksa dashboard Midtrans untuk rincian dan tindakan lanjutan."
    ].join("\n");
    const mail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${emailKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: Deno.env.get("RESEND_FROM_EMAIL") || "DapurKita <onboarding@resend.dev>", to: [ownerEmail], subject, text: message }),
    });
    if (!mail.ok) {
      console.error("Email notification failed", await mail.text());
      return new Response("Email notification failed", { status: 502 });
    }
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
