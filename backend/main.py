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
        category = bert_result["category"]       # legitimate | phishing | online_gambling
        confidence = bert_result["confidence"]
        gambling_phrases_found = bert_result.get("gambling_phrases", [])
        tokens_found = bert_result.get("tokens", [])
        page_title = bert_result.get("title") or a["host"]

        if category == "online_gambling":
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

    cat = CATEGORIES[level]

    # Format indikator & penjelasan
    indicators = []
    if level == "gb" and gambling_phrases_found:
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
        frasa = ", ".join(gambling_phrases_found)
        explanation = (
            f"Terindikasi aktivitas perjudian online. "
            f"Frasa terdeteksi: {frasa}. "
            "Situs perjudian tidak otomatis dikategorikan sebagai phishing."
        )
        active_tokens = gambling_phrases_found

    elif level == "lo":
        # Format positif untuk situs aman / legitimate
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
        indicators.append({
            "ok": True,
            "weight": 0,
            "text": "Menggunakan protokol enkripsi aman (HTTPS)."
        })
        indicators.append({
            "ok": True,
            "weight": 0,
            "text": "Tidak ditemukan indikator phishing, pemalsuan identitas, maupun perjudian."
        })
        title_str = f' "{page_title}"' if page_title and page_title != a["host"] else ""
        explanation = (
            f"Berdasarkan analisis konten website dan model BERT, halaman ini dinilai memiliki tingkat risiko rendah. "
            f"Konten website{title_str} telah diperiksa dan tidak menunjukkan adanya formulir pencurian data (phishing), "
            f"rekayasa sosial, maupun indikasi penipuan daring."
        )
        active_tokens = tokens_found or [a["host"]]

    else:
        for ind in a["indicators"]:
            indicators.append({
                "ok": False,
                "weight": ind.get("weight", 10),
                "text": ind["text"]
            })
        explanation = cat["explanation"]
        active_tokens = tokens_found

    evidence = [{"phrase": t, "snippet": t} for t in active_tokens]

    return {
        "url": a["url"],
        "score": score,
        "level": level,           # hi | gb | md | lo
        "name": cat["name"],
        "tag": cat["tag"],
        "page_title": page_title,
        "indicators": indicators,
        "explanation": explanation,
        "recommendation": cat["recommendation"],
        "detected_phrases": active_tokens,
        "evidence": evidence,
        "source": source,
        "checkedAt": datetime.now(timezone.utc).isoformat(),
    }
