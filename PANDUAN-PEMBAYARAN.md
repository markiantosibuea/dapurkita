# Integrasi pembayaran DapurKita

Fondasi backend ini memakai Midtrans Snap + Supabase Edge Functions + Resend.
Metode yang dapat ditampilkan Midtrans bergantung pada aktivasi kanal dan verifikasi akun merchant: QRIS, virtual account/transfer bank, dan e-wallet.

## Yang perlu disiapkan pemilik
1. Buat akun merchant Midtrans dan selesaikan verifikasi/KYC.
2. Buat project Supabase.
3. Buat akun Resend dan verifikasi domain pengirim email. Untuk uji coba, gunakan alamat pengirim yang diizinkan Resend.
4. Jangan pernah menaruh Midtrans Server Key atau Resend API Key di file frontend/GitHub.

## Secrets Supabase
Atur secrets untuk Edge Functions:
- MIDTRANS_SERVER_KEY = Server Key dari Midtrans (mulai dari Sandbox).
- MIDTRANS_IS_PRODUCTION = false untuk uji coba; ubah true hanya setelah akun live disetujui.
- RESEND_API_KEY = API key Resend.
- RESEND_FROM_EMAIL = alamat pengirim terverifikasi, contoh DapurKita <pesanan@domain-anda.id>.
- ORDER_NOTIFICATION_EMAIL = markiantosibueea@gmail.com.

## Deploy
1. Install Supabase CLI dan login.
2. Hubungkan project: supabase link --project-ref PROJECT_ID
3. Set secrets memakai Supabase Dashboard > Edge Functions > Secrets (atau CLI).
4. Deploy: supabase functions deploy create-payment
5. Deploy: supabase functions deploy midtrans-webhook
6. Di dashboard Midtrans Sandbox > Settings > Configuration, set Payment Notification URL ke:
   https://PROJECT_ID.supabase.co/functions/v1/midtrans-webhook
7. Di Midtrans, aktifkan kanal pembayaran yang diperlukan. Pastikan QRIS, bank transfer/VA, dan e-wallet sudah tersedia untuk akun merchant.

## Konfigurasi frontend
Isi payment-config.js dengan Project URL dan anon/public key Supabase. Anon key memang boleh berada di browser; Server Key dan Resend API Key tidak boleh.
Frontend harus memanggil fungsi create-payment dan mengarahkan pembeli ke redirect_url yang dikembalikan Midtrans.

## Catatan penting
- Kode ini memvalidasi ID, jumlah, dan harga produk di server; browser tidak menentukan total tagihan.
- Notifikasi email dipicu oleh callback Midtrans yang signature-nya diverifikasi.
- Untuk produksi, tambahkan penyimpanan order di database, kebijakan privasi, syarat pembatalan/refund, dan uji seluruh kanal pembayaran di Sandbox.
- Harga katalog server pada create-payment harus diperbarui bila harga di script.js berubah.
- Website tidak menerima pembayaran live sampai akun merchant, secrets, webhook, dan frontend Supabase dikonfigurasi serta diuji.
