"""Analisis karakteristik URL (aturan/heuristik).

Logikanya dipindahkan dari frontend (app/models/UrlModels.js) supaya hasil
backend sama dengan prototipe. Nanti bisa digabung dengan model BERT lewat
bert_model.py.
"""
import re
from urllib.parse import urlparse, urlunparse

BRANDS = {
    "paypal": "paypal.com", "google": "google.com", "facebook": "facebook.com",
    "instagram": "instagram.com", "microsoft": "microsoft.com", "apple": "apple.com",
    "netflix": "netflix.com", "shopee": "shopee.co.id", "tokopedia": "tokopedia.com",
    "gopay": "gopay.co.id", "dana": "dana.id", "bca": "bca.co.id",
    "bni": "bni.co.id", "bri": "bri.co.id", "mandiri": "bankmandiri.co.id",
}
KEYS = ["login", "signin", "verify", "update", "secure",
        "account", "password", "confirm", "wallet", "bonus"]
TLDS = ["xyz", "top", "tk", "ml", "ga", "cf", "gq",
        "click", "work", "zip", "icu", "cyou", "buzz"]
SHORT = ["bit.ly", "tinyurl.com", "t.co", "goo.gl",
         "is.gd", "cutt.ly", "s.id", "rb.gy"]
SECOND_LEVEL = ["co", "ac", "go", "or", "sch", "web", "net"]

CATEGORIES = {
    "hi": {
        "name": "Risiko Tinggi", "tag": "Phishing",
        "explanation": "URL ini memiliki beberapa indikator yang umum ditemukan pada situs phishing. Meskipun tidak dapat dipastikan secara mutlak, kombinasi indikator tersebut menunjukkan potensi ancaman yang perlu diwaspadai.",
        "recommendation": "Jangan lanjutkan akses atau memasukkan data pribadi maupun kredensial akun pada website ini.",
    },
    "md": {
        "name": "Risiko Sedang", "tag": "Waspada",
        "explanation": "Ditemukan sejumlah indikator yang perlu diperhatikan lebih lanjut. Indikator ini belum tentu berarti situs berbahaya, tetapi sebaiknya Anda berhati-hati.",
        "recommendation": "Periksa kembali alamat domain dan hindari memasukkan informasi sensitif sebelum Anda memastikan keamanannya.",
    },
    "lo": {
        "name": "Risiko Rendah", "tag": "Minim indikator",
        "explanation": "Indikator phishing yang teridentifikasi relatif sedikit berdasarkan pemeriksaan karakteristik URL. Hasil ini tidak menjamin bahwa situs sepenuhnya aman.",
        "recommendation": "Tetap pastikan keaslian website sebelum memberikan informasi pribadi.",
    },
}


class InvalidURL(ValueError):
    """URL tidak valid; pesan dipakai langsung sebagai pesan error ke pengguna."""


def level_for(score: int) -> str:
    return "hi" if score >= 55 else "md" if score >= 25 else "lo"


def analyze_url(raw: str) -> dict:
    s = (raw or "").strip()
    if not s:
        raise InvalidURL("Masukkan URL terlebih dahulu.")
    if re.search(r"\s", s):
        raise InvalidURL("URL tidak boleh mengandung spasi.")
    if not re.match(r"^[a-z][a-z0-9+.-]*://", s, re.I):
        s = "https://" + s
    try:
        u = urlparse(s)
        port = u.port
        h = (u.hostname or "").lower()
    except ValueError:
        raise InvalidURL("Format URL tidak valid. Contoh: https://contoh.com")
    if not h:
        raise InvalidURL("Format URL tidak valid. Contoh: https://contoh.com")
    if u.scheme not in ("http", "https"):
        raise InvalidURL("Hanya URL berawalan http:// atau https:// yang dapat diperiksa.")

    is_ip = bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", h)) or ":" in h
    if not is_ip and "." not in h:
        raise InvalidURL("Nama domain tidak valid. Contoh: https://contoh.com")

    parts = h.split(".")
    tld = parts[-1]
    reg_n = 3 if (len(parts) > 2 and parts[-2] in SECOND_LEVEL and len(tld) == 2) else 2
    reg = ".".join(parts[-reg_n:])
    subs = len(parts) - reg_n
    full = urlunparse((u.scheme, u.netloc, u.path or "/", u.params, u.query, u.fragment))

    ind: list[dict] = []

    def add(weight: int, text: str):
        ind.append({"weight": weight, "text": text})

    if is_ip:
        add(30, "Menggunakan alamat IP sebagai pengganti nama domain.")
    if u.scheme == "http":
        add(20, "Tidak menggunakan HTTPS, sehingga data yang dikirim tidak terenkripsi.")
    authority = re.sub(r"^[a-z]+://", "", s, flags=re.I).split("/")[0]
    if "@" in authority:
        add(25, "Mengandung simbol @ yang dapat menyembunyikan tujuan sebenarnya.")
    if len(full) > 75:
        add(12, f"URL terlalu panjang ({len(full)} karakter).")
    if not is_ip and subs >= 3:
        add(15, f"Memiliki banyak subdomain ({subs} tingkat).")
    if "xn--" in h:
        add(25, "Menggunakan karakter internasional (punycode) yang bisa meniru domain lain.")
    if not is_ip and tld in TLDS:
        add(15, f"Menggunakan akhiran domain .{tld} yang sering disalahgunakan.")
    if not is_ip and reg.split(".")[0].count("-") >= 1:
        add(8, "Nama domain mengandung tanda hubung (-).")
    if reg in SHORT:
        add(15, "Menggunakan layanan pemendek tautan sehingga tujuan asli tersembunyi.")
    if port and port not in (80, 443):
        add(10, f"Menggunakan port tidak lazim ({port}).")
    haystack = (h + u.path).lower()
    kw = [k for k in KEYS if k in haystack]
    if kw:
        add(min(42, len(kw) * 14), f"Memuat kata yang sering dipakai pada phishing: {', '.join(kw)}.")
    if not is_ip:
        for brand, official in BRANDS.items():
            if brand in h and reg != official:
                add(35, f'Nama domain menyerupai merek "{brand}", tetapi bukan domain resminya ({official}).')
                break

    return {"url": full, "host": h, "indicators": ind}