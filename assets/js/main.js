/* ============================================================
   KONFIGURASI SITUS (data.json)
   ============================================================ */

/* Nilai bawaan; dipakai bila data.json gagal dimuat (mis. dibuka via file://). */
var SITE = {
    site:    { name: 'Kampung Dosay' },
    contact: {
        whatsappNumber: '6282199558191',
        whatsappMessage: 'Halo Admin Kampung Dosay, saya ingin bertanya seputar Kampung Dosay.',
        phoneWhatsapp: '6282216638052'
    },
    weather: {
        locationName: 'Dosay, Sentani Barat',
        latitude: -2.5560,
        longitude: 140.3880,
        timezone: 'Asia/Jayapura',
        timezoneLabel: 'WIT'
    },
    hero: {
        slides: [
            './images/gallery/dosay-anggrek.png',
            './images/gallery/dosay-berkemah-dansari.png',
            './images/gallery/dosay-kali-dansari.png',
            './images/gallery/dosay-traditional-dance.png'
        ]
    }
};

/* Ambil nilai objek dari path bertitik, mis. "contact.phoneDisplay". */
function getByPath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
        return (acc == null) ? undefined : acc[key];
    }, obj);
}

/* Terapkan binding teks/HTML/atribut data.json ke elemen [data-bind-*]. */
function applyBindings(data) {
    document.querySelectorAll('[data-bind-text]').forEach(function (el) {
        var val = getByPath(data, el.getAttribute('data-bind-text'));
        if (val != null) el.textContent = val;
    });
    document.querySelectorAll('[data-bind-html]').forEach(function (el) {
        var val = getByPath(data, el.getAttribute('data-bind-html'));
        if (val != null) el.innerHTML = val;
    });
    document.querySelectorAll('[data-bind-attr]').forEach(function (el) {
        el.getAttribute('data-bind-attr').split(',').forEach(function (pair) {
            var idx = pair.indexOf(':');
            if (idx === -1) return;
            var attr = pair.slice(0, idx).trim();
            var val  = getByPath(data, pair.slice(idx + 1).trim());
            if (val != null) el.setAttribute(attr, val);
        });
    });
}

/* Perbarui favicon dan theme color.
   Title, description, canonical, Open Graph, dan JSON-LD sengaja ditulis statis di <head>
   tiap halaman (bukan lewat JS) supaya terbaca mesin pencari & pratinjau media sosial. */
function applyMeta(data) {
    var site = data.site || {};

    function setContent(selector, value) {
        if (value == null) return;
        var el = document.querySelector(selector);
        if (el) el.setAttribute('content', value);
    }

    setContent('meta[name="theme-color"]', site.themeColor);
    setContent('meta[name="msapplication-TileColor"]', site.themeColor);

    if (site.favicon) {
        document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]')
            .forEach(function (link) { link.setAttribute('href', site.favicon); });
    }
}

/* Set href semua tautan WhatsApp ([data-wa-link]).
   Default ke contact.whatsappNumber; data-wa-number="<path>" memilih nomor lain. */
function applyWhatsappLinks(data) {
    var contact = data.contact || {};
    document.querySelectorAll('[data-wa-link]').forEach(function (link) {
        var numberPath = link.getAttribute('data-wa-number') || 'contact.whatsappNumber';
        var number = getByPath(data, numberPath) || getByPath(SITE, numberPath) || SITE.contact.whatsappNumber;
        var text = link.hasAttribute('data-wa-prefill')
            ? (contact.whatsappMessage || SITE.contact.whatsappMessage)
            : link.getAttribute('data-wa-text');
        link.setAttribute('href', 'https://wa.me/' + number + (text ? '?text=' + encodeURIComponent(text) : ''));
    });
}

/* ============================================================
   TOPBAR: TANGGAL & WAKTU REALTIME
   ============================================================ */
function initClock(weatherCfg) {
    var longEl  = document.getElementById('topbar-date-long');
    var shortEl = document.getElementById('topbar-date-short');
    var timeEl  = document.getElementById('topbar-time');
    if (!timeEl) return;

    var tz      = weatherCfg.timezone || 'Asia/Jayapura';
    var tzLabel = weatherCfg.timezoneLabel || 'WIT';
    var fmtLong, fmtShort, fmtTime;

    try {
        fmtLong  = new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        fmtShort = new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        fmtTime  = new Intl.DateTimeFormat('id-ID', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) {
        /* Peramban lama tanpa dukungan zona waktu: pakai waktu perangkat. */
        fmtLong  = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        fmtShort = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        fmtTime  = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        tzLabel  = '';
    }

    function tick() {
        var now = new Date();
        if (longEl)  longEl.textContent  = fmtLong.format(now);
        if (shortEl) shortEl.textContent = fmtShort.format(now);
        timeEl.textContent = fmtTime.format(now).replace(/\./g, ':') + (tzLabel ? ' ' + tzLabel : '');
    }

    tick();
    setInterval(tick, 1000);
}

/* ============================================================
   TOPBAR: CUACA (Open-Meteo, tanpa API key)
   ============================================================ */
var WEATHER_CODES = {
    0:  ['Cerah',               'fa-sun',                'fa-moon'],
    1:  ['Cerah Berawan',       'fa-cloud-sun',          'fa-cloud-moon'],
    2:  ['Berawan Sebagian',    'fa-cloud-sun',          'fa-cloud-moon'],
    3:  ['Mendung',             'fa-cloud',              'fa-cloud'],
    45: ['Berkabut',            'fa-smog',               'fa-smog'],
    48: ['Berkabut',            'fa-smog',               'fa-smog'],
    51: ['Gerimis Ringan',      'fa-cloud-rain',         'fa-cloud-rain'],
    53: ['Gerimis',             'fa-cloud-rain',         'fa-cloud-rain'],
    55: ['Gerimis Lebat',       'fa-cloud-rain',         'fa-cloud-rain'],
    56: ['Gerimis Beku',        'fa-cloud-rain',         'fa-cloud-rain'],
    57: ['Gerimis Beku',        'fa-cloud-rain',         'fa-cloud-rain'],
    61: ['Hujan Ringan',        'fa-cloud-rain',         'fa-cloud-rain'],
    63: ['Hujan Sedang',        'fa-cloud-showers-heavy','fa-cloud-showers-heavy'],
    65: ['Hujan Lebat',         'fa-cloud-showers-heavy','fa-cloud-showers-heavy'],
    66: ['Hujan Beku',          'fa-cloud-showers-heavy','fa-cloud-showers-heavy'],
    67: ['Hujan Beku',          'fa-cloud-showers-heavy','fa-cloud-showers-heavy'],
    71: ['Salju Ringan',        'fa-snowflake',          'fa-snowflake'],
    73: ['Salju',               'fa-snowflake',          'fa-snowflake'],
    75: ['Salju Lebat',         'fa-snowflake',          'fa-snowflake'],
    77: ['Butiran Salju',       'fa-snowflake',          'fa-snowflake'],
    80: ['Hujan Lokal',         'fa-cloud-sun-rain',     'fa-cloud-moon-rain'],
    81: ['Hujan Lokal',         'fa-cloud-sun-rain',     'fa-cloud-moon-rain'],
    82: ['Hujan Lokal Lebat',   'fa-cloud-showers-heavy','fa-cloud-showers-heavy'],
    95: ['Badai Petir',         'fa-cloud-bolt',         'fa-cloud-bolt'],
    96: ['Badai Petir & Es',    'fa-cloud-bolt',         'fa-cloud-bolt'],
    99: ['Badai Petir & Es',    'fa-cloud-bolt',         'fa-cloud-bolt']
};

function initWeather(cfg) {
    var iconEl = document.getElementById('weather-icon');
    var tempEl = document.getElementById('weather-temp');
    var descEl = document.getElementById('weather-desc');
    var locEl  = document.getElementById('weather-location');
    var boxEl  = document.getElementById('topbar-weather');
    if (!tempEl || cfg.latitude == null || cfg.longitude == null) return;

    if (locEl && cfg.locationName) locEl.textContent = cfg.locationName;

    var url = 'https://api.open-meteo.com/v1/forecast' +
              '?latitude=' + cfg.latitude +
              '&longitude=' + cfg.longitude +
              '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
              '&timezone=' + encodeURIComponent(cfg.timezone || 'Asia/Jayapura');
    var retried = false;

    function load() {
        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (json) {
                var cur  = json.current || {};
                var info = WEATHER_CODES[cur.weather_code] || ['Cuaca', 'fa-cloud', 'fa-cloud'];
                var icon = cur.is_day === 0 ? info[2] : info[1];

                tempEl.textContent = Math.round(cur.temperature_2m) + '°C';
                if (descEl) descEl.textContent = info[0];
                if (iconEl) iconEl.className = 'fa-solid ' + icon + ' text-amber-500';
                if (boxEl) {
                    boxEl.title = info[0] + ' · ' + Math.round(cur.temperature_2m) + '°C' +
                        ' · Kelembapan ' + cur.relative_humidity_2m + '%' +
                        ' · Angin ' + Math.round(cur.wind_speed_10m) + ' km/j';
                }
            })
            .catch(function (err) {
                console.warn('Data cuaca tidak dapat dimuat.', err);
                if (descEl) descEl.textContent = 'Cuaca tidak tersedia';
                /* Coba sekali lagi setelah 30 detik bila belum pernah berhasil. */
                if (!retried && tempEl.textContent.indexOf('--') === 0) {
                    retried = true;
                    setTimeout(load, 30 * 1000);
                }
            });
    }

    load();
    setInterval(load, 15 * 60 * 1000); /* segarkan tiap 15 menit */
}

/* ============================================================
   HERO BACKGROUND SLIDESHOW (hanya di beranda)
   ============================================================ */
function initHeroSlideshow(images) {
    var slideshow = document.getElementById('hero-slideshow');
    if (!slideshow || !images || !images.length) return;
    slideshow.innerHTML = '';

    var slides = images.map(function (src) {
        var slide = document.createElement('div');
        slide.className = 'hero-slide';
        slide.style.backgroundImage = "url('" + src + "')";
        slideshow.appendChild(slide);
        return slide;
    });

    var current  = 0;
    var INTERVAL = 6000;

    function activate(index) {
        slides.forEach(function (s) { s.classList.remove('is-active'); });
        var slide = slides[index];
        slide.classList.add('is-active');
        slide.classList.remove('zoom-in', 'zoom-out');
        void slide.offsetWidth;
        slide.classList.add(index % 2 === 0 ? 'zoom-in' : 'zoom-out');
    }

    activate(0);
    if (slides.length > 1) {
        setInterval(function () {
            current = (current + 1) % slides.length;
            activate(current);
        }, INTERVAL);
    }
}

/* ============================================================
   TOMBOL MENGAMBANG: BACK TO TOP
   ============================================================ */
function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    function toggle() {
        if (window.scrollY > 400) {
            btn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
        } else {
            btn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        }
    }

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
}

/* ============================================================
   VISITOR COUNTER (api/visitor.php → data/visitors.json)
   Setiap halaman mencatat kunjungan; angka hanya ditampilkan di
   halaman yang memiliki #visitor-counter (beranda).
   ============================================================ */
function initVisitorCounter() {
    var box = document.getElementById('visitor-counter');
    var fmt = new Intl.NumberFormat('id-ID');

    fetch('./api/visitor.php', { method: 'POST', cache: 'no-store' })
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (stats) {
            if (!box) return;
            ['daily', 'weekly', 'monthly', 'annual'].forEach(function (key) {
                var el = box.querySelector('[data-visitor="' + key + '"]');
                if (el && typeof stats[key] === 'number') el.textContent = fmt.format(stats[key]);
            });
            box.classList.remove('hidden');
        })
        .catch(function (err) {
            /* Tanpa server PHP (mis. hosting statis), counter disembunyikan. */
            console.warn('Visitor counter tidak tersedia.', err);
        });
}

/* ============================================================
   FORM KONTAK → WHATSAPP
   ============================================================ */
function kirimPesan(event) {
    event.preventDefault();
    var nama      = document.getElementById('nama').value.trim();
    var telpon    = document.getElementById('telpon').value.trim();
    var keperluan = document.getElementById('keperluan').value;
    var pesan     = document.getElementById('pesan').value.trim();
    var nomorWA   = (SITE.contact && SITE.contact.whatsappNumber) || '6282199558191';
    var namaSitus = (SITE.site && SITE.site.name) || 'Kampung Dosay';

    var teks = 'Halo Admin ' + namaSitus + ', saya ingin menghubungi:\n\n' +
               '*Data Pengirim:*\n' +
               '• Nama: ' + nama + '\n' +
               '• HP/WA: ' + telpon + '\n\n' +
               '*Keperluan:*\n👉 *' + keperluan + '*\n\n' +
               '*Pesan:*\n"' + pesan + '"';

    window.open('https://wa.me/' + nomorWA + '?text=' + encodeURIComponent(teks), '_blank', 'noopener');
}

/* ============================================================
   INISIALISASI
   ============================================================ */
function applySiteData(data) {
    /* Gabungkan bagian yang hilang di data.json dengan nilai bawaan. */
    data.contact = Object.assign({}, SITE.contact, data.contact || {});
    data.weather = Object.assign({}, SITE.weather, data.weather || {});
    data.hero    = Object.assign({}, SITE.hero, data.hero || {});
    SITE = data;

    applyMeta(data);
    applyBindings(data);
    applyWhatsappLinks(data);
}

document.addEventListener('DOMContentLoaded', function () {
    initBackToTop();
    initClock(SITE.weather);
    initVisitorCounter();

    fetch('./data.json', { cache: 'no-cache' })
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (data) { applySiteData(data); })
        .catch(function (err) {
            console.warn('data.json tidak dapat dimuat, memakai nilai bawaan.', err);
            applyWhatsappLinks(SITE);
        })
        .then(function () {
            initWeather(SITE.weather);
            initHeroSlideshow(SITE.hero.slides);
        });
});
