#!/usr/bin/env node
/* ============================================================
   GENERATOR SITEMAP — Kampung Dosay

   Membuat ulang sitemap.xml (dengan image sitemap) dari halaman yang ada:
     node tools/generate-sitemap.js

   - Halaman: index.html di akar + setiap <folder>/index.html
   - Dilewati: halaman ber-meta "noindex" dan folder non-halaman
   - <loc>     : diambil dari <link rel="canonical"> tiap halaman
   - <lastmod> : tanggal commit terakhir file (git); jika file sedang
                 diubah / belum di-commit, memakai tanggal modifikasi file
   - <image:image>: semua foto di folder images/ yang dipakai halaman
                 (logo & placeholder tidak disertakan)
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://kampungdosay.id/';
const SKIP_DIRS = new Set(['api', 'assets', 'data', 'error', 'images', 'tools', 'node_modules', '.git']);

/* Prioritas & frekuensi perubahan per halaman (slug folder; '' = beranda). */
const RULES = {
    '':             { changefreq: 'weekly',  priority: '1.0' },
    'transparansi': { changefreq: 'weekly',  priority: '0.9' },
    'potensi':      { changefreq: 'monthly', priority: '0.8' },
    'galeri':       { changefreq: 'monthly', priority: '0.8' },
    'fasilitas':    { changefreq: 'monthly', priority: '0.8' },
    'tentang':      { changefreq: 'monthly', priority: '0.8' },
    'pemerintahan': { changefreq: 'monthly', priority: '0.7' },
    'kontak':       { changefreq: 'yearly',  priority: '0.6' },
    'peta-situs':   { changefreq: 'monthly', priority: '0.3' }
};
const DEFAULT_RULE = { changefreq: 'monthly', priority: '0.5' };

/* Urutan: beranda dulu, lalu sesuai daftar RULES, sisanya abjad. */
const ORDER = Object.keys(RULES);

function findPages() {
    const pages = [{ slug: '', file: path.join(ROOT, 'index.html') }];
    for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
        if (!entry.isDirectory() || SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        const file = path.join(ROOT, entry.name, 'index.html');
        if (fs.existsSync(file)) pages.push({ slug: entry.name, file });
    }
    const rank = s => (ORDER.indexOf(s) === -1 ? ORDER.length : ORDER.indexOf(s));
    return pages.sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug));
}

function git(args) {
    try {
        return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (e) {
        return '';
    }
}

function lastModified(file) {
    const rel = path.relative(ROOT, file);
    const dirty = git(['status', '--porcelain', '--', rel]);
    const committed = dirty ? '' : git(['log', '-1', '--format=%cs', '--', rel]);
    return committed || fs.statSync(file).mtime.toISOString().slice(0, 10);
}

function findImages(html) {
    const found = new Set();
    const re = /['"(](?:\.\.?\/)*(images\/[^'"()\s]+?\.(?:png|jpe?g|webp|gif|avif))/gi;
    let m;
    while ((m = re.exec(html))) {
        const img = m[1];
        if (/(^|\/)(logo-|nokensoft-logo)/i.test(img)) continue;
        if (fs.existsSync(path.join(ROOT, img))) found.add(img);
    }
    return [...found];
}

const xmlEscape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const entries = [];
for (const page of findPages()) {
    const html = fs.readFileSync(page.file, 'utf8');
    if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) continue;

    const canonical = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1]
        || SITE_URL + (page.slug ? page.slug + '/' : '');
    const rule = RULES[page.slug] || DEFAULT_RULE;
    const images = findImages(html);

    entries.push(
        '  <url>\n' +
        `    <loc>${xmlEscape(canonical)}</loc>\n` +
        `    <lastmod>${lastModified(page.file)}</lastmod>\n` +
        `    <changefreq>${rule.changefreq}</changefreq>\n` +
        `    <priority>${rule.priority}</priority>\n` +
        images.map(img => `    <image:image>\n      <image:loc>${xmlEscape(SITE_URL + img)}</image:loc>\n    </image:image>\n`).join('') +
        '  </url>'
    );
    console.log(`  ${canonical}  (${images.length} gambar)`);
}

const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    entries.join('\n') + '\n' +
    '</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml diperbarui: ${entries.length} halaman.`);
