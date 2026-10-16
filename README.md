# Website Kampung Dosay

Website resmi Kampung Dosay, Distrik Sentani Barat, Kabupaten Jayapura, Papua.
Situs statis (HTML + Tailwind CDN + Alpine.js), dengan satu skrip PHP kecil untuk penghitung pengunjung.

## Fitur Utama

- **Multi halaman**: Beranda, Tentang, Pemerintahan, Transparansi, Potensi, Fasilitas, Galeri, Kontak
- **Layout bersama**: topbar, menu, footer & tombol mengambang dari satu file (`assets/js/layout.js`)
- **Topbar realtime**: tanggal & jam WIT (kiri), cuaca terkini dari Open-Meteo (kanan)
- **Hero slideshow**: foto latar bergantian dengan efek Ken Burns
- **Slider foto kantor**: geser manual (tombol, titik, swipe, keyboard) di Beranda & Tentang
- **Filter kategori**: di halaman Fasilitas & Galeri
- **Galeri**: judul muncul di tengah foto saat hover, lightbox dengan navigasi sebelumnya/berikutnya
- **Form kontak → WhatsApp**: pesan langsung terkirim ke nomor admin
- **Visitor counter**: pengunjung unik harian, mingguan, bulanan, tahunan (per alamat IP, tanpa hitungan ganda, bot diabaikan)
- **SEO**: title & description unik, canonical, Open Graph, Twitter Card, JSON-LD, `sitemap.xml`, `robots.txt`
- **Mudah diganti**: nama situs, logo, kontak, cuaca, dan footer diatur dari `data.json`
- **Responsif**: menu hamburger & tata letak ringkas di HP

## Fitur Utama (untuk Laporan)

Ringkasan dalam bahasa sederhana, siap disalin ke laporan, proposal, atau pesan WhatsApp:

```text
FITUR UTAMA WEBSITE KAMPUNG DOSAY

1. Delapan halaman informasi
   Beranda, Tentang, Pemerintahan, Transparansi, Potensi,
   Fasilitas Umum, Galeri, dan Kontak.

2. Tanggal, jam, dan cuaca langsung
   Bagian paling atas website menampilkan tanggal dan jam (WIT)
   yang terus berjalan, serta cuaca terkini di Kampung Dosay.

3. Profil kampung
   Sejarah singkat, ciri khas, batas wilayah, dan foto
   Kantor Kampung yang bisa digeser.

4. Struktur pemerintahan dan layanan surat
   Daftar perangkat kampung dan jenis surat keterangan
   yang bisa diurus di kantor kampung.

5. Transparansi Dana Desa
   Publikasi program dan kegiatan Dana Desa tahun berjalan
   agar masyarakat dapat ikut memantau.

6. Potensi dan fasilitas kampung
   Informasi wisata alam, pertanian, peternakan, dan fasilitas
   umum (sekolah, puskesmas, rumah ibadah, dll.) yang bisa
   disaring per kategori.

7. Galeri foto
   Kumpulan foto alam, wisata, dan budaya. Foto dapat
   diperbesar dan dilihat satu per satu.

8. Hubungi langsung lewat WhatsApp
   Pengunjung cukup mengisi formulir, lalu pesan otomatis
   terkirim ke WhatsApp admin kampung.

9. Statistik pengunjung
   Menampilkan jumlah pengunjung hari ini, minggu ini,
   bulan ini, dan tahun ini. Satu pengunjung hanya dihitung
   sekali agar angkanya jujur.

10. Mudah ditemukan di Google
    Website sudah disiapkan agar mudah muncul di hasil
    pencarian dan tampil rapi saat dibagikan di media sosial.

11. Nyaman dibuka di HP maupun komputer
    Tampilan menyesuaikan ukuran layar secara otomatis.
```

## Struktur Folder

Setiap halaman berada di folder sendiri sebagai `index.html`, sehingga URL-nya tanpa `.html`
(mis. `kampungdosay.id/kontak/`).

```text
├── index.html             # Beranda          → /
├── tentang/index.html     # Tentang          → /tentang/
├── pemerintahan/index.html                   → /pemerintahan/
├── transparansi/index.html                   → /transparansi/
├── potensi/index.html                        → /potensi/
├── fasilitas/index.html                      → /fasilitas/
├── galeri/index.html                         → /galeri/
├── kontak/index.html                         → /kontak/
├── .htaccess              # redirect URL lama *.html → URL bersih
├── data.json              # konfigurasi situs (nama, kontak, cuaca, footer)
├── assets/
│   ├── css/style.css      # gaya bersama
│   └── js/
│       ├── layout.js      # topbar, menu, footer, tombol mengambang
│       └── main.js        # data.json, jam, cuaca, slideshow, WA, counter
├── api/visitor.php        # API penghitung pengunjung
├── data/                  # visitors.json (dibuat otomatis, berisi IP)
├── images/
├── sitemap.xml
└── robots.txt
```

## Menjalankan di Komputer Lokal

Butuh PHP 8+ agar visitor counter berfungsi:

```bash
php -S localhost:8000
```

Lalu buka <http://localhost:8000>.

> Membuka file HTML langsung (`file://`) tetap bisa, tetapi `data.json` dan visitor counter tidak akan termuat.

## Konfigurasi Cepat (`data.json`)

Nomor WhatsApp & kontak:

```json
"contact": {
  "phoneDisplay": "+62 822-1663-8052",
  "phoneLabel": "Sekretaris Kampung",
  "phoneWhatsapp": "6282216638052",
  "whatsappNumber": "6282199558191"
}
```

- `whatsappNumber`: tujuan form kontak & tombol WA mengambang
- `phoneWhatsapp`: nomor yang tampil di halaman Kontak & footer

Lokasi cuaca:

```json
"weather": {
  "locationName": "Dosay, Sentani Barat",
  "latitude": -2.556,
  "longitude": 140.388,
  "timezone": "Asia/Jayapura",
  "timezoneLabel": "WIT"
}
```

## Menambah Menu Halaman

Tambahkan satu baris di `NAV_ITEMS` pada `assets/js/layout.js`:

```js
{ page: 'berita', slug: 'berita', label: 'Berita' },
```

Buat folder & file `berita/index.html` (salin dari halaman lain, mis. `tentang/index.html`), set `<body data-page="berita">`, dan pastikan memuat:

```html
<div id="site-header"></div>
<!-- konten -->
<div id="site-footer"></div>

<script src="../assets/js/layout.js"></script>
<script src="../assets/js/main.js"></script>
```

> Di dalam sub-folder, path aset memakai `../` (mis. `../images/foto.jpg`, `../assets/css/style.css`).

Jangan lupa ganti canonical & Open Graph ke `https://kampungdosay.id/berita/`, lalu tambahkan URL-nya ke `sitemap.xml`.

## Deploy

- [ ] Hosting mendukung **PHP** (shared hosting / cPanel). GitHub Pages & Netlify tidak bisa menjalankan visitor counter, dan counter otomatis disembunyikan.
- [ ] Folder `data/` bisa ditulis oleh PHP:
  ```bash
  chmod 755 data
  ```
- [ ] Akses publik ke `data/` diblokir. Apache sudah memakai `data/.htaccess`. Untuk Nginx:
  ```nginx
  location ^~ /data/ { deny all; }
  ```
- [ ] Jika memakai Cloudflare / reverse proxy, ubah di `api/visitor.php`:
  ```php
  const TRUST_PROXY_HEADERS = true;
  ```
- [ ] Domain berbeda dari `https://kampungdosay.id/`? Ganti di `<head>` tiap halaman (canonical, Open Graph, JSON-LD), `sitemap.xml`, dan `robots.txt`.

## Lisensi

Lihat [LICENSE](LICENSE). Dikembangkan oleh [Nokensoft.com](https://nokensoft.com).
