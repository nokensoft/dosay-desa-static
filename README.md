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
- **SEO**: title & description unik, canonical, Open Graph, Twitter Card, JSON-LD, `robots.txt`, `sitemap.xml` + image sitemap (dibuat otomatis), halaman Peta Situs
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
├── peta-situs/index.html                     → /peta-situs/
├── .htaccess              # URL bersih, halaman error, mode pemeliharaan
├── error/                 # 400, 401, 403, 404, 500, 503 (.html)
├── data.json              # konfigurasi situs (nama, kontak, cuaca, footer)
├── assets/
│   ├── css/style.css      # gaya bersama
│   └── js/
│       ├── layout.js      # topbar, menu, footer, tombol mengambang
│       └── main.js        # data.json, jam, cuaca, slideshow, WA, counter
├── api/visitor.php        # API penghitung pengunjung
├── data/                  # visitors.json (dibuat otomatis, berisi IP)
├── images/
├── tools/generate-sitemap.js  # pembuat sitemap.xml
├── sitemap.xml            # dibuat oleh tools/generate-sitemap.js
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

Jangan lupa ganti canonical & Open Graph ke `https://kampungdosay.id/berita/`, lalu perbarui sitemap (lihat bagian **Sitemap**).

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
- [ ] Situs dipasang di **akar domain** (bukan sub-folder), karena halaman error memakai path `/assets/...` dan `/images/...`.

## Sitemap

`sitemap.xml` dibuat otomatis dari semua halaman (beserta foto yang dipakai tiap halaman).
Jalankan ulang setiap kali menambah/mengubah halaman atau foto:

```bash
node tools/generate-sitemap.js
```

- Halaman ber-`noindex` (mis. halaman error) otomatis tidak disertakan.
- `<lastmod>` diambil dari tanggal commit terakhir tiap file.
- Prioritas & frekuensi per halaman diatur di `RULES` dalam `tools/generate-sitemap.js`.

Setelah situs online, daftarkan sitemap di **Google Search Console** → *Sitemaps* → isi:

```text
https://kampungdosay.id/sitemap.xml
```

Lakukan juga di **Bing Webmaster Tools** (bisa impor langsung dari Google Search Console).

## Halaman Error

| Kode | Halaman | Kapan muncul |
|------|---------|--------------|
| 400 | `error/400.html` | Permintaan tidak valid |
| 401 | `error/401.html` | Perlu login |
| 403 | `error/403.html` | Akses ditolak (mis. membuka folder `data/`) |
| 404 | `error/404.html` | Halaman tidak ditemukan |
| 500 | `error/500.html` | Kesalahan server |
| 503 | `error/503.html` | Mode pemeliharaan |

Apache sudah diatur lewat `.htaccess`. Untuk Nginx:

```nginx
error_page 400 /error/400.html;
error_page 401 /error/401.html;
error_page 403 /error/403.html;
error_page 404 /error/404.html;
error_page 500 502 504 /error/500.html;
error_page 503 /error/503.html;
```

**Mode pemeliharaan:** buka `.htaccess`, hapus tanda `#` pada blok *MODE PEMELIHARAAN*, dan isi IP admin agar admin tetap bisa membuka situs:

```apache
<IfModule mod_rewrite.c>
    RewriteCond %{REMOTE_ADDR} !^203\.0\.113\.10$
    RewriteCond %{REQUEST_URI} !^/(error|assets|images)/
    RewriteRule ^ - [R=503,L]
</IfModule>
```

Kembalikan tanda `#` untuk menonaktifkannya.

## Lisensi

Lihat [LICENSE](LICENSE). Dikembangkan oleh [Nokensoft.com](https://nokensoft.com).
