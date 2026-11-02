# DapurKita — Good Food, Happy Mood

DapurKita adalah template toko online makanan dan minuman yang responsif. Pengunjung dapat melihat katalog, mencari produk, memfilter kategori, menambahkan produk ke keranjang, dan menyiapkan pesanan melalui WhatsApp.

## File
- `index.html` — struktur halaman.
- `style.css` — desain responsif.
- `script.js` — katalog contoh, pencarian, keranjang, dan checkout WhatsApp.

## Sebelum digunakan untuk menerima pesanan
1. Buka `script.js`.
2. Ubah nilai `NOMOR_WA_TOKO` menjadi nomor WhatsApp toko dalam format internasional tanpa tanda `+` atau spasi. Contoh format: `6281234567890`.
3. Ganti nama, deskripsi, harga, dan foto contoh pada array `products` sesuai produk yang benar-benar dijual.
4. Sesuaikan informasi toko dan kebijakan pengiriman sebelum dipublikasikan.

## Publikasikan dengan GitHub Pages
1. Buka **Settings** pada repository.
2. Pilih **Pages** pada menu samping.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch **main** dan folder **/(root)**, lalu tekan **Save**.
5. Tunggu proses deployment selesai. Situs akan tersedia di:
   https://markiantosibuea.github.io/dapurkita/

## Catatan
Website ini merupakan frontend statis. Checkout menyiapkan pesan WhatsApp dan tidak memproses pembayaran online, menyimpan pesanan ke database, atau menghitung ongkir otomatis. Untuk fitur tersebut dibutuhkan backend atau layanan pihak ketiga.
