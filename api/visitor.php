<?php
/**
 * VISITOR COUNTER — Kampung Dosay
 *
 * Mencatat pengunjung unik berdasarkan alamat IP ke file JSON, lalu
 * mengembalikan jumlah pengunjung unik hari ini, minggu ini, bulan ini,
 * dan tahun ini. Satu IP hanya dihitung sekali per periode, sehingga
 * memuat ulang halaman / pindah halaman tidak menggandakan hitungan.
 *
 *   GET  api/visitor.php          → hanya baca statistik
 *   POST api/visitor.php          → catat kunjungan + kembalikan statistik
 *
 * Struktur data/visitors.json:
 *   { "days": { "2026-10-16": ["203.0.113.5", "198.51.100.7"], ... } }
 */

declare(strict_types=1);

/* ===== KONFIGURASI ===== */
const TIMEZONE   = 'Asia/Jayapura';                       // WIT
const DATA_FILE  = __DIR__ . '/../data/visitors.json';
/* true HANYA jika situs berada di belakang Cloudflare / reverse proxy tepercaya.
   Jika false, header X-Forwarded-For diabaikan karena mudah dipalsukan. */
const TRUST_PROXY_HEADERS = false;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'POST'], true)) {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

date_default_timezone_set(TIMEZONE);
$today = new DateTimeImmutable('today');

/* ----- Alamat IP pengunjung ----- */
function client_ip(): ?string
{
    $candidates = [];
    if (TRUST_PROXY_HEADERS) {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $candidates[] = $_SERVER['HTTP_CF_CONNECTING_IP'];
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $candidates[] = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
        }
    }
    $candidates[] = $_SERVER['REMOTE_ADDR'] ?? '';

    foreach ($candidates as $ip) {
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }
    return null;
}

/* ----- Abaikan bot / crawler agar statistik tidak menggelembung ----- */
function is_bot(): bool
{
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    if ($ua === '') {
        return true;
    }
    return (bool) preg_match('/bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|curl|wget|python|monitor/i', $ua);
}

/* ----- Hitung IP unik pada rentang tanggal [from, to] ----- */
function count_unique(array $days, DateTimeImmutable $from, DateTimeImmutable $to): int
{
    $fromKey = $from->format('Y-m-d');
    $toKey   = $to->format('Y-m-d');
    $unique  = [];
    foreach ($days as $date => $ips) {
        if ($date >= $fromKey && $date <= $toKey) {
            foreach ($ips as $ip) {
                $unique[$ip] = true;
            }
        }
    }
    return count($unique);
}

/* ----- Baca + (opsional) tulis file data dengan file lock ----- */
$dir = dirname(DATA_FILE);
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
    http_response_code(500);
    echo json_encode(['error' => 'Folder data tidak dapat dibuat']);
    exit;
}

$fp = fopen(DATA_FILE, 'c+');
if ($fp === false) {
    http_response_code(500);
    echo json_encode(['error' => 'File data tidak dapat dibuka']);
    exit;
}

$record = $method === 'POST' && !is_bot();
flock($fp, $record ? LOCK_EX : LOCK_SH);

$raw  = stream_get_contents($fp);
$data = json_decode($raw ?: '', true);
if (!is_array($data) || !isset($data['days']) || !is_array($data['days'])) {
    $data = ['days' => []];
}

if ($record) {
    $ip  = client_ip();
    $key = $today->format('Y-m-d');

    if ($ip !== null) {
        $todayIps = $data['days'][$key] ?? [];
        if (!in_array($ip, $todayIps, true)) {
            $todayIps[] = $ip;
            $data['days'][$key] = $todayIps;

            /* Simpan data tahun berjalan + tahun lalu saja agar file tidak membengkak. */
            $keepFrom = ((int) $today->format('Y') - 1) . '-01-01';
            foreach (array_keys($data['days']) as $date) {
                if ($date < $keepFrom) {
                    unset($data['days'][$date]);
                }
            }
            ksort($data['days']);

            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            fflush($fp);
        }
    }
}

flock($fp, LOCK_UN);
fclose($fp);

/* ----- Statistik (minggu dimulai hari Senin) ----- */
$days = $data['days'];
echo json_encode([
    'daily'     => count_unique($days, $today, $today),
    'weekly'    => count_unique($days, $today->modify('monday this week'), $today),
    'monthly'   => count_unique($days, $today->modify('first day of this month'), $today),
    'annual'    => count_unique($days, $today->modify('first day of january this year'), $today),
    'updatedAt' => (new DateTimeImmutable('now'))->format(DATE_ATOM),
]);
