"""Integrasi model BERT untuk analisis konten website (phishing, gambling, legitimate).

Model membaca konten teks halaman website (hasil scraping), lalu
mengembalikan klasifikasi kategori, judul halaman, dan token/frasa
yang ditemukan untuk ditampilkan pada dashboard hasil.
"""

from __future__ import annotations

import ipaddress
import os
import re
import socket
from typing import Optional
from urllib.parse import urlparse

import requests
import torch
from bs4 import BeautifulSoup
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# ── Konfigurasi ────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models", "bert_category_38_experiment")

LABELS: dict[int, str] = {
    0: "legitimate",
    1: "phishing",
    2: "online_gambling",
}

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Frasa gambling yang dicari di konten halaman (multi-word didahulukan)
GAMBLING_KEYWORDS = [
    "online casino", "live casino", "slot rooms", "sportsbook",
    "taruhan bola", "judi online", "slot gacor", "deposit pulsa",
    "bocoran slot", "rtp slot", "agen slot", "baccarat", "roulette",
    "blackjack", "jackpot", "sbobet", "maxbet", "pragmatic play",
    "pragmatic", "pg soft", "taruhan", "betting", "casino",
    "poker", "togel", "gacor", "slot", "judi", "rtp", "maxwin",
]

# Kata henti untuk ekstraksi token konten yang bersih
STOP_WORDS = {
    "the", "and", "for", "that", "this", "with", "from", "your", "have", "are",
    "not", "you", "all", "can", "has", "was", "web", "page", "yang", "dan",
    "dari", "untuk", "pada", "dengan", "ini", "itu", "atau", "adalah", "akan",
}

# ── Load model sekali saat modul diimport ──────────────────────────────────────

_model: Optional[AutoModelForSequenceClassification] = None
_tokenizer: Optional[AutoTokenizer] = None
_load_error: Optional[str] = None

try:
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    _model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    _model.to(DEVICE)
    _model.eval()
    print(f"[bert_model] Model BERT berhasil dimuat. Device: {DEVICE}")
except Exception as _e:
    _load_error = str(_e)
    print(f"[bert_model] Gagal memuat model: {_load_error}")


# ── Utilitas: validasi & scraping URL ─────────────────────────────────────────

def _validate_url(url: str) -> tuple[bool, str]:
    """Tolak URL internal/lokal/tidak aman, dan periksa apakah domain dapat di-resolve di DNS."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False, "Hanya URL berawalan http:// atau https:// yang diperbolehkan"
        hostname = (parsed.hostname or "").lower()
        if not hostname or parsed.username or parsed.password:
            return False, "Format URL atau nama domain tidak valid"
        if hostname in ("localhost",) or hostname.endswith(".localhost"):
            return False, "Akses ke domain localhost ditolak"
        if hostname.endswith(".local"):
            return False, "Akses ke domain lokal (.local) ditolak"
        try:
            addresses = socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
            if not addresses:
                return False, "Domain tidak terdaftar atau tidak ditemukan pada DNS (NXDOMAIN)"
            for addr in addresses:
                if not ipaddress.ip_address(addr[4][0]).is_global:
                    return False, "Alamat IP privat / lokal ditolak"
        except socket.gaierror:
            return False, "Domain tidak terdaftar atau tidak ditemukan pada DNS (NXDOMAIN)"
        except ValueError:
            return False, "Alamat IP domain tidak valid"
        return True, ""
    except Exception as e:
        return False, f"URL tidak valid ({e})"


def fetch_page_data(url: str) -> dict:
    """Ambil data halaman: status HTTP, judul, deskripsi, teks bersih, dan deteksi error."""
    parsed = urlparse(url)
    default_title = parsed.netloc

    is_valid, validation_msg = _validate_url(url)
    if not is_valid:
        return {
            "title": default_title,
            "description": "",
            "text": "",
            "tokens": [],
            "gambling_phrases": [],
            "accessible": False,
            "status_code": None,
            "is_404": False,
            "is_error_page": True,
            "error_reason": validation_msg,
        }

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    title = ""
    desc = ""
    combined = ""
    accessible = False
    status_code = None
    is_404 = False
    is_error_page = False
    error_reason = ""

    ERROR_TITLE_PATTERNS = [
        r"\b404\b.*not\s*found",
        r"not\s*found.*\b404\b",
        r"^404\b",
        r"\bpage\s+not\s+found\b",
        r"\bhalaman\s+tidak\s+ditemukan\b",
        r"\baccess\s+denied\b",
        r"\baccess\s+forbidden\b",
        r"\b403\s+forbidden\b",
        r"^forbidden$",
        r"\bunauthorized\b",
        r"\bbad\s+request\b",
        r"\bbad\s+gateway\b",
        r"\bservice\s+unavailable\b",
        r"\binternal\s+server\s+error\b",
        r"\berror\s+404\b",
        r"\bwebsite\s+blocked\b",
        r"\bsitus\s+diblokir\b",
        r"\bcloudflare\b.*attention\s+required",
        r"just\s+a\s+moment\.\.\.",
    ]

    try:
        resp = requests.get(
            url,
            headers=headers,
            timeout=10,
            allow_redirects=True,
            stream=True,
        )
        status_code = resp.status_code

        # Validasi HTTP status code
        if status_code == 404:
            is_404 = True
            is_error_page = True
            error_reason = "Halaman tidak ditemukan (HTTP 404 Not Found)"
        elif status_code in (401, 403):
            is_error_page = True
            error_reason = f"Akses ditolak (HTTP {status_code} Access Denied/Forbidden)"
        elif status_code >= 500:
            is_error_page = True
            error_reason = f"Server mengalami galat (HTTP {status_code} Server Error)"

        content_type = resp.headers.get("Content-Type", "").lower()
        if "text/html" in content_type:
            raw = bytearray()
            for chunk in resp.iter_content(chunk_size=8192):
                raw.extend(chunk)
                if len(raw) > 1_000_000:
                    break
            resp.close()
            html = bytes(raw).decode(resp.encoding or "utf-8", errors="replace")

            soup = BeautifulSoup(html, "html.parser")
            title = soup.title.get_text(" ", strip=True) if soup.title else ""
            m = soup.find("meta", attrs={"name": "description"}) or soup.find(
                "meta", attrs={"property": "og:description"}
            )
            desc = m.get("content", "") if m else ""
            for tag in soup(["script", "style", "noscript", "svg"]):
                tag.decompose()
            body = soup.get_text(separator=" ", strip=True)
            combined = (title + " " + desc + " " + body).strip()

            # Deteksi halaman error berdasarkan judul
            if title:
                t_lower = title.lower()
                for pattern in ERROR_TITLE_PATTERNS:
                    if re.search(pattern, t_lower):
                        is_error_page = True
                        if any(k in t_lower for k in ("404", "not found", "tidak ditemukan")):
                            is_404 = True
                            error_reason = f"Judul halaman: '{title}' (404 Not Found)"
                        else:
                            error_reason = f"Judul halaman terindikasi error: '{title}'"
                        break

            # Deteksi body error yang sangat singkat
            if not is_error_page and len(combined) < 150:
                b_lower = combined.lower()
                for pattern in ERROR_TITLE_PATTERNS[:8]:
                    if re.search(pattern, b_lower):
                        is_error_page = True
                        if any(k in b_lower for k in ("404", "not found", "tidak ditemukan")):
                            is_404 = True
                            error_reason = "Konten halaman mengindikasikan 404 Not Found"
                        else:
                            error_reason = f"Konten halaman mengindikasikan error: '{combined[:60]}'"
                        break

            accessible = True
    except Exception as e:
        print(f"[bert_model] fetch_page_data warning for {url}: {e}")
        accessible = False
        error_reason = f"Website tidak dapat diakses ({e})"

    # Ekstraksi frasa gambling jika ada
    text_lower = (combined or (parsed.netloc + " " + parsed.path)).lower()
    gambling_phrases = []
    for phrase in GAMBLING_KEYWORDS:
        if phrase in text_lower and phrase not in gambling_phrases:
            gambling_phrases.append(phrase)

    # Ekstraksi token representatif halaman untuk Token Highlighting
    tokens: list[str] = []
    host_parts = [
        p for p in parsed.netloc.lower().split(".")
        if p not in ("www", "com", "co", "id", "org", "net", "app", "html")
    ]
    path_parts = [
        p for p in re.split(r"[/_\-\.\?&=]", parsed.path.lower())
        if len(p) >= 3 and not p.isdigit()
    ]
    text_words = re.findall(r"[a-zA-Z]{3,}", combined.lower())
    filtered_words = [w for w in text_words if w not in STOP_WORDS]

    for item in host_parts + path_parts + filtered_words:
        if item not in tokens and len(item) >= 3:
            tokens.append(item)
        if len(tokens) >= 12:
            break

    return {
        "title": title or default_title,
        "description": desc,
        "text": combined,
        "tokens": tokens,
        "gambling_phrases": gambling_phrases[:8],
        "accessible": accessible and not is_error_page,
        "status_code": status_code,
        "is_404": is_404,
        "is_error_page": is_error_page,
        "error_reason": error_reason,
    }


# ── Fungsi publik ──────────────────────────────────────────────────────────────

def classify(url: str) -> Optional[dict]:
    """Klasifikasi URL menggunakan model BERT dan konten website.

    Return dict berisi:
      - category: "legitimate" | "phishing" | "online_gambling" | "not_found" | "unknown"
      - confidence: float 0.0–1.0
      - gambling_phrases: list[str]
      - tokens: list[str]
      - title: str
      - description: str
      - accessible: bool
      - status_code: Optional[int]
      - error_reason: str
    """
    page_data = fetch_page_data(url)
    phrases = page_data["gambling_phrases"]
    text = page_data["text"] or page_data["title"]

    # 1. Validasi HTTP 404 (Halaman Tidak Ditemukan)
    if page_data["is_404"]:
        return {
            "category": "not_found",
            "confidence": 0.0,
            "gambling_phrases": [],
            "tokens": [],
            "title": page_data["title"] or "404 Not Found",
            "description": page_data["description"],
            "accessible": False,
            "status_code": page_data.get("status_code", 404),
            "error_reason": page_data.get("error_reason") or "Halaman tidak ditemukan (HTTP 404)",
        }

    # 2. Deteksi Halaman Error / Access Denied (Unknown)
    if page_data["is_error_page"]:
        return {
            "category": "unknown",
            "confidence": 0.0,
            "gambling_phrases": [],
            "tokens": [],
            "title": page_data["title"] or "Error / Access Denied",
            "description": page_data["description"],
            "accessible": False,
            "status_code": page_data.get("status_code", 200),
            "error_reason": page_data.get("error_reason") or f"Judul halaman terdeteksi error: '{page_data['title']}'",
        }

    # Jika website tidak bisa diakses sama sekali (koneksi ditolak / domain mati)
    if not page_data["accessible"]:
        return {
            "category": "unknown",
            "confidence": 0.0,
            "gambling_phrases": [],
            "tokens": [],
            "title": page_data["title"],
            "description": "",
            "accessible": False,
            "status_code": page_data.get("status_code"),
            "error_reason": page_data.get("error_reason") or "Website tidak dapat diakses atau domain tidak aktif",
        }

    pred_category = None
    confidence = 0.0

    # Jalankan inferensi BERT jika teks tersedia
    if _model is not None and _tokenizer is not None and text:
        try:
            encoding = _tokenizer(
                text,
                truncation=True,
                max_length=256,
                padding="max_length",
                return_tensors="pt",
            )
            encoding = {k: v.to(DEVICE) for k, v in encoding.items()}

            with torch.no_grad():
                logits = _model(**encoding).logits
                probs = torch.softmax(logits, dim=1)[0]
                pred_id = int(torch.argmax(probs).item())

            confidence = float(probs[pred_id].item())
            pred_category = LABELS.get(pred_id)
        except Exception as e:
            print(f"[bert_model] Inferensi error: {e}")

    # Aturan klasifikasi:
    if phrases:
        # Jika memuat frasa perjudian
        return {
            "category": "online_gambling",
            "confidence": 0.95,
            "gambling_phrases": phrases,
            "tokens": phrases,
            "title": page_data["title"],
            "description": page_data["description"],
            "accessible": page_data["accessible"],
            "status_code": page_data.get("status_code", 200),
            "error_reason": "",
        }

    # Jika BERT mendeteksi phishing dengan probabilitas tinggi
    if pred_category == "phishing" and confidence >= 0.70:
        return {
            "category": "phishing",
            "confidence": round(confidence, 4),
            "gambling_phrases": [],
            "tokens": page_data["tokens"],
            "title": page_data["title"],
            "description": page_data["description"],
            "accessible": page_data["accessible"],
            "status_code": page_data.get("status_code", 200),
            "error_reason": "",
        }

    # Default untuk situs resmi yang berhasil diakses secara normal: legitimate
    return {
        "category": "legitimate",
        "confidence": 0.95 if confidence < 0.60 else round(confidence, 4),
        "gambling_phrases": [],
        "tokens": page_data["tokens"],
        "title": page_data["title"],
        "description": page_data["description"],
        "accessible": page_data["accessible"],
        "status_code": page_data.get("status_code", 200),
        "error_reason": "",
    }


def predict(url: str) -> Optional[float]:
    """Compatibility wrapper — kembalikan skor risiko 0.0–1.0 atau None."""
    r = classify(url)
    if r is None:
        return None
    mapping = {"legitimate": 0.0, "phishing": 1.0, "online_gambling": 0.5}
    return mapping.get(r["category"])
