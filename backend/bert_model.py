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

def _validate_url(url: str) -> bool:
    """Tolak URL internal/lokal/tidak aman."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        hostname = (parsed.hostname or "").lower()
        if not hostname or parsed.username or parsed.password:
            return False
        if hostname in ("localhost",) or hostname.endswith(".localhost"):
            return False
        if hostname.endswith(".local"):
            return False
        try:
            for addr in socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM):
                if not ipaddress.ip_address(addr[4][0]).is_global:
                    return False
        except (socket.gaierror, ValueError):
            return False
        return True
    except Exception:
        return False


def fetch_page_data(url: str) -> dict:
    """Ambil data halaman: judul, deskripsi, teks bersih, dan token representatif."""
    parsed = urlparse(url)
    default_title = parsed.netloc

    if not _validate_url(url):
        return {
            "title": default_title,
            "description": "",
            "text": "",
            "tokens": [],
            "gambling_phrases": [],
            "accessible": False,
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

    try:
        resp = requests.get(
            url,
            headers=headers,
            timeout=10,
            allow_redirects=True,
            stream=True,
        )
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
            accessible = True
    except Exception as e:
        print(f"[bert_model] fetch_page_data warning for {url}: {e}")

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
        "accessible": accessible,
    }


# ── Fungsi publik ──────────────────────────────────────────────────────────────

def classify(url: str) -> Optional[dict]:
    """Klasifikasi URL menggunakan model BERT dan konten website.

    Return dict berisi:
      - category: "legitimate" | "phishing" | "online_gambling"
      - confidence: float 0.0–1.0
      - gambling_phrases: list[str]
      - tokens: list[str]
      - title: str
      - description: str
      - accessible: bool
    """
    page_data = fetch_page_data(url)
    phrases = page_data["gambling_phrases"]
    text = page_data["text"] or page_data["title"]

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
        }

    # Default untuk situs resmi / aman: legitimate
    return {
        "category": "legitimate",
        "confidence": 0.95 if confidence < 0.60 else round(confidence, 4),
        "gambling_phrases": [],
        "tokens": page_data["tokens"],
        "title": page_data["title"],
        "description": page_data["description"],
        "accessible": page_data["accessible"],
    }


def predict(url: str) -> Optional[float]:
    """Compatibility wrapper — kembalikan skor risiko 0.0–1.0 atau None."""
    r = classify(url)
    if r is None:
        return None
    mapping = {"legitimate": 0.0, "phishing": 1.0, "online_gambling": 0.5}
    return mapping.get(r["category"])
