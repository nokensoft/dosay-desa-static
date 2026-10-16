/* ============================================================
   LAYOUT BERSAMA: topbar, navigasi, footer, tombol mengambang.
   Disisipkan ke #site-header dan #site-footer di setiap halaman,
   sehingga menu cukup diubah di satu tempat.
   Harus dimuat SEBELUM Alpine.js menginisialisasi (Alpine pakai defer).
   ============================================================ */
(function () {
    /* Akar situs, dihitung dari lokasi file ini (assets/js/layout.js → ../../).
       Dengan begitu tautan & gambar benar dari halaman mana pun (/, /tentang/, dst.),
       juga bila situs dipasang di sub-folder. Dipakai juga oleh main.js. */
    var ROOT = (function () {
        var src = document.currentScript && document.currentScript.src;
        return src ? new URL('../../', src).href : './';
    })();
    window.SITE_ROOT = ROOT;

    /* URL halaman: folder dengan index.html → tanpa ".html" (mis. /kontak/).
       Saat dibuka langsung dari disk (file://), index.html ditambahkan agar tetap bisa diklik. */
    function pageUrl(slug) {
        var url = ROOT + (slug ? slug + '/' : '');
        return location.protocol === 'file:' ? url + 'index.html' : url;
    }

    var NAV_ITEMS = [
        { page: 'index',        slug: '',             label: 'Beranda' },
        { page: 'tentang',      slug: 'tentang',      label: 'Tentang' },
        { page: 'pemerintahan', slug: 'pemerintahan', label: 'Pemerintahan' },
        { page: 'transparansi', slug: 'transparansi', label: 'Transparansi' },
        { page: 'potensi',      slug: 'potensi',      label: 'Potensi' },
        { page: 'fasilitas',    slug: 'fasilitas',    label: 'Fasilitas' },
        { page: 'galeri',       slug: 'galeri',       label: 'Galeri' },
        { page: 'kontak',       slug: 'kontak',       label: 'Kontak' }
    ].map(function (item) {
        item.href = pageUrl(item.slug);
        return item;
    });

    /* Halaman aktif: dari <body data-page>, atau dari nama folder pada URL. */
    function currentPage() {
        var fromBody = document.body.getAttribute('data-page');
        if (fromBody) return fromBody;
        var parts = location.pathname.replace(/index\.html?$/, '').split('/').filter(Boolean);
        return parts.pop() || 'index';
    }

    var active = currentPage();

    function navLinks(extraClass) {
        return NAV_ITEMS.map(function (item, i) {
            var isActive = item.page === active;
            var border = (extraClass && i < NAV_ITEMS.length - 1) ? ' border-b border-stone-100' : '';
            return '<a href="' + item.href + '"' +
                   (isActive ? ' aria-current="page"' : '') +
                   ' class="nav-link ' + (extraClass || '') + border +
                   ' text-emerald-900 hover:text-amber-600' + (isActive ? ' nav-active' : '') + '">' +
                   item.label + '</a>';
        }).join('');
    }

    var headerHtml = '' +
        /* ===== TOPBAR: tanggal & jam (kiri), cuaca (kanan) ===== */
        '<div class="bg-white border-b border-stone-200 text-stone-600 text-xs sm:text-sm print:hidden">' +
            '<div class="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">' +
                '<div class="flex items-center gap-2 min-w-0" aria-live="off">' +
                    '<i class="fa-regular fa-calendar text-amber-500 shrink-0" aria-hidden="true"></i>' +
                    '<span id="topbar-date-long" class="hidden sm:inline truncate">&nbsp;</span>' +
                    '<span id="topbar-date-short" class="sm:hidden truncate">&nbsp;</span>' +
                    '<span class="text-stone-300" aria-hidden="true">|</span>' +
                    '<i class="fa-regular fa-clock text-amber-500 shrink-0" aria-hidden="true"></i>' +
                    '<span id="topbar-time" class="tabular-nums font-semibold text-emerald-900 whitespace-nowrap">--:--:--</span>' +
                '</div>' +
                '<div id="topbar-weather" class="flex items-center gap-2 shrink-0" title="Cuaca saat ini">' +
                    '<i id="weather-icon" class="fa-solid fa-cloud-sun text-amber-500" aria-hidden="true"></i>' +
                    '<span id="weather-temp" class="font-semibold text-emerald-900 tabular-nums">--°C</span>' +
                    '<span id="weather-desc" class="hidden sm:inline">Memuat cuaca…</span>' +
                    '<span class="hidden md:inline text-stone-300" aria-hidden="true">|</span>' +
                    '<span class="hidden md:inline text-stone-500">' +
                        '<i class="fa-solid fa-location-dot mr-1 text-emerald-700" aria-hidden="true"></i>' +
                        '<span id="weather-location">Dosay</span>' +
                    '</span>' +
                '</div>' +
            '</div>' +
        '</div>' +

        /* ===== NAVIGATION ===== */
        '<nav x-data="{ mobileMenu: false }" @keydown.escape.window="mobileMenu = false"' +
        ' class="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-md">' +
            '<div class="max-w-7xl mx-auto">' +
                '<div class="flex justify-between items-center px-4 sm:px-6 py-4">' +
                    '<a href="' + pageUrl('') + '" aria-label="Kampung Dosay - Beranda" class="flex items-center gap-3">' +
                        '<img src="' + ROOT + 'images/logo-kabupaten-jayapura.png" alt="Logo Kampung Dosay" class="h-10 md:h-12 w-auto"' +
                        ' data-bind-attr="src:site.logo,alt:site.name" onerror="this.style.display=\'none\'">' +
                        '<div>' +
                            '<span class="logo-text text-xl md:text-2xl font-bold tracking-tight text-emerald-900" data-bind-text="site.logoText.primary">KAMPUNG</span> ' +
                            '<span class="logo-text text-xl md:text-2xl font-bold tracking-tight text-amber-600" data-bind-text="site.logoText.secondary">DOSAY</span>' +
                        '</div>' +
                    '</a>' +
                    '<div class="hidden lg:flex items-center gap-6 text-sm font-medium">' + navLinks() + '</div>' +
                    '<button @click="mobileMenu = !mobileMenu" :aria-expanded="mobileMenu" aria-controls="mobile-menu"' +
                    ' aria-label="Buka menu navigasi" class="lg:hidden text-2xl text-emerald-900 focus:outline-none focus:text-amber-600">' +
                        '<i class="fa-solid fa-bars" x-show="!mobileMenu"></i>' +
                        '<i class="fa-solid fa-xmark" x-show="mobileMenu" x-cloak></i>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div id="mobile-menu" x-show="mobileMenu"' +
            ' x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0"' +
            ' x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 -translate-y-2"' +
            ' x-cloak class="lg:hidden bg-white border-t border-stone-200 shadow-lg">' +
                '<div class="flex flex-col px-6 py-4 text-lg max-h-[calc(100vh-4.5rem)] overflow-y-auto">' +
                    navLinks('nav-link-mobile block py-3') +
                '</div>' +
            '</div>' +
        '</nav>';

    var year = new Date().getFullYear();

    var footerHtml = '' +
        '<footer class="bg-emerald-950 text-emerald-300 pt-14 pb-8">' +
            '<div class="max-w-7xl mx-auto px-6">' +
                '<div class="grid gap-10 md:grid-cols-3 pb-10 border-b border-emerald-900">' +
                    /* Identitas */
                    '<div class="text-center md:text-left">' +
                        '<div class="flex items-center justify-center md:justify-start gap-3 mb-4">' +
                            '<img src="' + ROOT + 'images/logo-kabupaten-jayapura.png" alt="Logo Kampung Dosay" class="h-16 opacity-80 rounded-full"' +
                            ' data-bind-attr="src:site.logo,alt:site.name" onerror="this.style.display=\'none\'">' +
                            '<p class="logo-text text-xl font-bold text-white" data-bind-text="hero.title">KAMPUNG DOSAY</p>' +
                        '</div>' +
                        '<p class="text-sm text-emerald-400 leading-relaxed" data-bind-text="site.tagline">Distrik Sentani Barat &bull; Kabupaten Jayapura &bull; Provinsi Papua</p>' +
                        '<p class="text-xs mt-3 text-emerald-400" data-bind-text="footer.note">Menjaga warisan budaya Lembah Moi dan keindahan alam Pegunungan Cycloop — Papua.</p>' +
                    '</div>' +
                    /* Menu */
                    '<div class="text-center md:text-left">' +
                        '<p class="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Menu</p>' +
                        '<ul class="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">' +
                            NAV_ITEMS.map(function (item) {
                                return '<li><a href="' + item.href + '" class="hover:text-amber-400 transition-colors">' + item.label + '</a></li>';
                            }).join('') +
                        '</ul>' +
                    '</div>' +
                    /* Kontak */
                    '<div class="text-center md:text-left">' +
                        '<p class="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Kontak</p>' +
                        '<ul class="space-y-3 text-sm">' +
                            '<li class="flex items-start justify-center md:justify-start gap-3">' +
                                '<i class="fa-solid fa-location-dot text-amber-400 mt-1"></i>' +
                                '<span data-bind-html="contact.addressHtml">Kampung Dosay, Distrik Sentani Barat,<br>Kabupaten Jayapura, Provinsi Papua</span>' +
                            '</li>' +
                            '<li class="flex items-start justify-center md:justify-start gap-3">' +
                                '<i class="fa-brands fa-whatsapp text-amber-400 mt-1"></i>' +
                                '<a href="#" data-wa-link data-wa-number="contact.phoneWhatsapp" target="_blank" rel="noopener" class="hover:text-amber-400 transition-colors">' +
                                    '<span data-bind-text="contact.phoneDisplay">+62 822-1663-8052</span> ' +
                                    '<span class="text-emerald-500">(<span data-bind-text="contact.phoneLabel">Sekretaris Kampung</span>)</span>' +
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                        '<div class="flex justify-center md:justify-start gap-5 text-2xl mt-5">' +
                            '<a href="#" target="_blank" rel="noopener" class="hover:text-amber-400 transition-colors" aria-label="Facebook Kampung Dosay" data-bind-attr="href:contact.social.facebook"><i class="fa-brands fa-facebook"></i></a>' +
                            '<a href="#" target="_blank" rel="noopener" class="hover:text-amber-400 transition-colors" aria-label="Instagram Kampung Dosay" data-bind-attr="href:contact.social.instagram"><i class="fa-brands fa-instagram"></i></a>' +
                            '<a href="#" data-wa-link data-wa-prefill target="_blank" rel="noopener" class="hover:text-amber-400 transition-colors" aria-label="WhatsApp Kampung Dosay"><i class="fa-brands fa-whatsapp"></i></a>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="pt-6 flex flex-col items-center justify-center gap-2 text-xs text-center">' +
                    '<p data-bind-text="footer.copyright">© ' + year + ' Pemerintah Kampung Dosay. Hak cipta dilindungi.</p>' +
                    '<p><a href="' + pageUrl('peta-situs') + '" class="hover:text-amber-400 transition-colors"><i class="fa-solid fa-sitemap mr-1" aria-hidden="true"></i>Peta Situs</a></p>' +
                    '<p class="flex items-center gap-2">' +
                        '<a href="https://nokensoft.com" target="_blank" rel="noopener" data-bind-attr="href:footer.poweredByUrl" aria-label="Nokensoft.com">' +
                            '<img src="' + ROOT + 'images/nokensoft-logo.png" alt="Logo Nokensoft" width="24" height="24" loading="lazy" class="h-6 w-auto" onerror="this.style.display=\'none\'">' +
                        '</a>' +
                        '<span>Powered by <a href="https://nokensoft.com" target="_blank" rel="noopener" class="text-emerald-400 hover:underline" data-bind-text="footer.poweredByName" data-bind-attr="href:footer.poweredByUrl">Nokensoft.com</a></span>' +
                    '</p>' +
                '</div>' +
            '</div>' +
        '</footer>' +

        /* ===== FLOATING ACTION BUTTONS ===== */
        /* Atas: Back to Top (muncul saat digulir) · Bawah: Chat WhatsApp */
        '<div class="fixed bottom-5 right-5 z-[90] flex flex-col items-center gap-3 print:hidden">' +
            '<button id="backToTop" type="button" aria-label="Kembali ke atas" title="Kembali ke atas"' +
            ' class="fab opacity-0 translate-y-4 pointer-events-none flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-400 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-300/60">' +
                '<i class="fa-solid fa-arrow-up text-lg md:text-xl"></i>' +
            '</button>' +
            '<a data-wa-link data-wa-prefill href="#" target="_blank" rel="noopener" aria-label="Chat via WhatsApp" title="Chat via WhatsApp"' +
            ' class="fab flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300/60">' +
                '<i class="fa-brands fa-whatsapp text-2xl md:text-3xl"></i>' +
            '</a>' +
        '</div>';

    var headerSlot = document.getElementById('site-header');
    var footerSlot = document.getElementById('site-footer');
    if (headerSlot) headerSlot.outerHTML = headerHtml;
    if (footerSlot) footerSlot.outerHTML = footerHtml;
})();
