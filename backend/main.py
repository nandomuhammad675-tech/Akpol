"""SCAMGUARD API.

Jalankan:  python -m uvicorn main:app --reload --port 8000
Dokumentasi otomatis: http://127.0.0.1:8000/docs
"""
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import bert_model
from analyzer import CATEGORIES, GAMBLING_PHRASES, InvalidURL, analyze_url, level_for

# Bobot model BERT saat digabung dengan skor aturan.
BERT_WEIGHT = 0.6

app = FastAPI(title="SCAMGUARD API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CheckRequest(BaseModel):
    url: str


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "bert_loaded": bert_model._model is not None,
        "device": str(bert_model.DEVICE),
    }


@app.post("/api/check")
def check(req: CheckRequest):
    try:
        a = analyze_url(req.url)
    except InvalidURL as e:
        raise HTTPException(status_code=422, detail=str(e))

    rule_score = min(100, sum(i["weight"] for i in a["indicators"]))
    score = rule_score
    source = "rules"
    level = level_for(score)
    gambling_phrases_found: list[str] = []
    tokens_found: list[str] = []
    page_title: str = a["host"]

    # ── Jalankan BERT & analisis konten ─────────────────────────────────────────
    bert_result = bert_model.classify(a["url"])

    if bert_result is not None:
        category = bert_result["category"]       # legitimate | phishing | online_gambling | not_found | unknown
        confidence = bert_result["confidence"]
        gambling_phrases_found = bert_result.get("gambling_phrases", [])
        tokens_found = bert_result.get("tokens", [])
        page_title = bert_result.get("title") or a["host"]

        if category == "not_found":
            level = "not_found"
            score = 0
            source = "http_validation"

        elif category == "unknown":
            level = "unknown"
            score = 0
            source = "error_detection"

        elif category == "online_gambling":
            level = "gb"
            score = 95
            source = "bert"

        elif category == "phishing":
            bert_score = round(confidence * 100)
            score = round((1 - BERT_WEIGHT) * rule_score + BERT_WEIGHT * bert_score)
            level = level_for(score)
            source = "rules+bert"

        else:
            # legitimate
            score = min(score, round((1 - BERT_WEIGHT) * rule_score))
            level = "lo"
            source = "rules+bert"

    else:
        # Fallback jika website tidak bisa diakses / bot diblokir:
        url_gambling = a.get("url_gambling", [])
        if url_gambling:
            gambling_phrases_found = url_gambling
            level = "gb"
            score = 95
            source = "rules+url"
        else:
            level = "unknown"
            score = 0
            source = "error_detection"

    cat = CATEGORIES.get(level, CATEGORIES["unknown"])

    # Format indikator & penjelasan
    indicators = []

    # 1. Kasus: Halaman Tidak Ditemukan (HTTP 404)
    if level == "not_found":
        err_msg = bert_result.get("error_reason", "Halaman tidak ditemukan (HTTP 404)")
        indicators.append({
            "ok": False,
            "weight": 0,
            "text": f"Status Server: {err_msg}."
        })
        indicators.append({
            "ok": False,
            "weight": 0,
            "text": "Konten halaman tidak tersedia untuk dianalisis oleh model BERT."
        })
        indicators.append({
            "ok": False,
            "weight": 0,
            "text": "Status: Halaman Tidak Ditemukan — Sistem menolak menyimpulkan website sebagai aman atau sah (legitimate)."
        })
        # Pisahkan HTTPS dari legitimasi
        if a["url"].startswith("https://"):
            indicators.append({
                "ok": None,
                "weight": 0,
                "text": "Protokol: HTTPS (Koneksi terenkripsi). Catatan: HTTPS hanya mengamankan transmisi data dan bukan bukti bahwa halaman tersebut aman atau valid."
            })
        else:
            indicators.append({
                "ok": False,
                "weight": 20,
                "text": "Protokol: HTTP (Tidak terenkripsi, data rentan disadap)."
            })
        explanation = (
            f"Halaman web yang diperiksa mengembalikan status HTTP 404 (Halaman tidak ditemukan). "
            f"Karena konten tidak ada atau telah dipindahkan, sistem tidak dapat menganalisis isi halaman "
            f"dan tidak menyimpulkan bahwa situs ini aman atau sah (legitimate)."
        )
        active_tokens = []

    # 2. Kasus: Deteksi Halaman Error / Access Denied / DNS Gagal (Unknown)
    elif level == "unknown":
        err_msg = (bert_result and bert_result.get("error_reason")) or f"Judul halaman: '{page_title}'"
        is_dns_fail = any(k in err_msg.lower() for k in ("dns", "nxdomain", "tidak terdaftar", "tidak ditemukan pada dns"))

        if is_dns_fail:
            tag_custom = "Domain Tidak Ditemukan"
            indicators.append({
                "ok": False,
                "weight": 0,
                "text": f"Status Domain: {err_msg}."
            })
            indicators.append({
                "ok": False,
                "weight": 0,
                "text": "Status: Tidak Dapat Dianalisis (Unknown) — Website ngawur / tidak aktif tidak disimpulkan sebagai aman."
            })
            indicators.append({
                "ok": False,
                "weight": 0,
                "text": "Pemeriksaan model AI dibatalkan karena tidak ada konten yang dapat diakses."
            })
            explanation = (
                f"Domain '{a['host']}' yang Anda periksa tidak terdaftar di DNS global atau servernya tidak aktif ({err_msg}). "
                f"Karena situs ini tidak memiliki konten yang dapat diakses, sistem menandainya sebagai 'Tidak Dapat Dianalisis' (Unknown) "
                f"dan TIDAK menyimpulkan bahwa situs ini aman atau sah (legitimate)."
            )
            recommendation_custom = "Periksa kembali alamat website. Tautan mungkin salah ketik atau domain palsu yang sudah tidak aktif."
        else:
            tag_custom = cat["tag"]
            indicators.append({
                "ok": False,
                "weight": 0,
                "text": f"Status Halaman: {err_msg}."
            })
            indicators.append({
                "ok": False,
                "weight": 0,
                "text": "Status: Tidak Dapat Dianalisis (Unknown) — Halaman error tidak disimpulkan sebagai aman."
            })
            indicators.append({
                "ok": False,
                "weight": 0,
                "text": "Model BERT tidak dapat menganalisis halaman karena konten fungsional tidak tersedia."
            })
            explanation = (
                f"Halaman web menampilkan indikasi galat atau akses dibatasi ({err_msg}). "
                f"Karena konten halaman tidak dapat dimuat secara normal, "
                f"sistem menandai situs ini sebagai 'Tidak Dapat Dianalisis' (Unknown). "
                f"Situs ini tidak dapat disimpulkan sebagai website sah (legitimate) maupun aman."
            )
            recommendation_custom = cat["recommendation"]

        # Pisahkan HTTPS dari legitimasi
        if a["url"].startswith("https://"):
            indicators.append({
                "ok": None,
                "weight": 0,
                "text": "Protokol: HTTPS (Koneksi terenkripsi). Peringatan: Website phishing dan halaman penipuan juga dapat menggunakan HTTPS."
            })
        else:
            indicators.append({
                "ok": False,
                "weight": 20,
                "text": "Protokol: HTTP (Tidak terenkripsi, data rentan disadap)."
            })
        active_tokens = []

    # 3. Kasus: Indikasi Perjudian
    elif level == "gb" and gambling_phrases_found:
        for phrase in gambling_phrases_found:
            indicators.append({
                "ok": False,
                "weight": 20,
                "text": f"Ditemukan frasa '{phrase}'."
            })
        for ind in a["indicators"]:
            indicators.append({
                "ok": False,
                "weight": ind.get("weight", 10),
                "text": ind["text"]
            })
        if a["url"].startswith("https://"):
            indicators.append({
                "ok": None,
                "weight": 0,
                "text": "Protokol: HTTPS (Koneksi terenkripsi). Catatan: Situs perjudian juga menggunakan sertifikat SSL/HTTPS."
            })
        frasa = ", ".join(gambling_phrases_found)
        explanation = (
            f"Terindikasi aktivitas perjudian online. "
            f"Frasa terdeteksi: {frasa}. "
            "Situs perjudian tidak otomatis dikategorikan sebagai phishing."
        )
        active_tokens = gambling_phrases_found

    # 4. Kasus: Risiko Rendah (Legitimate)
    elif level == "lo":
        indicators.append({
            "ok": True,
            "weight": 0,
            "text": "Konten halaman teridentifikasi sebagai situs sah (Legitimate) oleh model BERT."
        })
        if page_title and page_title != a["host"]:
            indicators.append({
                "ok": True,
                "weight": 0,
                "text": f"Judul website terverifikasi: '{page_title}'."
            })
        # PISAHKAN HTTPS DARI INDIKATOR LEGITIMASI:
        if a["url"].startswith("https://"):
            indicators.append({
                "ok": None,
                "weight": 0,
                "text": "Koneksi terenkripsi (HTTPS). Catatan: HTTPS hanya mengamankan transmisi data, bukan bukti situs bebas dari phishing."
            })
        else:
            indicators.append({
                "ok": False,
                "weight": 20,
                "text": "Tidak menggunakan HTTPS (protokol HTTP tidak terenkripsi)."
            })
        indicators.append({
            "ok": True,
            "weight": 0,
            "text": "Tidak ditemukan indikator phishing, pemalsuan identitas, maupun perjudian pada konten."
        })
        title_str = f' "{page_title}"' if page_title and page_title != a["host"] else ""
        explanation = (
            f"Berdasarkan analisis konten website dan model BERT, halaman ini dinilai memiliki tingkat risiko rendah. "
            f"Konten website{title_str} telah diperiksa dan tidak menunjukkan adanya formulir pencurian data (phishing), "
            f"rekayasa sosial, maupun indikasi penipuan daring. "
            f"(Peringatan Keamanan: Protokol HTTPS hanya menunjukkan koneksi data terenkripsi, bukan jaminan mutlak situs aman.)"
        )
        active_tokens = tokens_found or [a["host"]]

    # 5. Kasus: Risiko Sedang / Tinggi (Phishing / Heuristik)
    else:
        for ind in a["indicators"]:
            indicators.append({
                "ok": False,
                "weight": ind.get("weight", 10),
                "text": ind["text"]
            })
        if a["url"].startswith("https://") and not any("HTTPS" in i["text"] for i in indicators):
            indicators.append({
                "ok": None,
                "weight": 0,
                "text": "Protokol: HTTPS (Koneksi terenkripsi). Catatan: Website phishing modern juga banyak menggunakan HTTPS."
            })
        explanation = cat["explanation"]
        active_tokens = tokens_found

    evidence = [{"phrase": t, "snippet": t} for t in active_tokens]

    return {
        "url": a["url"],
        "score": score,
        "level": level,           # hi | gb | md | lo
        "name": cat["name"],
        "tag": tag_custom if "tag_custom" in locals() else cat["tag"],
        "page_title": page_title,
        "indicators": indicators,
        "explanation": explanation,
        "recommendation": recommendation_custom if "recommendation_custom" in locals() else cat["recommendation"],
        "detected_phrases": active_tokens,
        "evidence": evidence,
        "source": source,
        "checkedAt": datetime.now(timezone.utc).isoformat(),
    }
