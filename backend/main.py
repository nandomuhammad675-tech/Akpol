"""SCAMGUARD API.

Jalankan:  uvicorn main:app --reload --port 8000
Dokumentasi otomatis: http://127.0.0.1:8000/docs
"""
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import bert_model
from analyzer import CATEGORIES, InvalidURL, analyze_url, level_for

# Bobot model BERT saat digabung dengan skor aturan. Placeholder, sesuaikan
# setelah model dievaluasi.
BERT_WEIGHT = 0.6

app = FastAPI(title="SCAMGUARD API", version="0.1.0")

# Mode pengembangan: semua asal boleh. Sebelum deploy, ganti dengan alamat
# frontend yang sebenarnya, misalnya ["https://scamguard.example.com"].
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
    return {"status": "ok"}


@app.post("/api/check")
def check(req: CheckRequest):
    try:
        a = analyze_url(req.url)
    except InvalidURL as e:
        raise HTTPException(status_code=422, detail=str(e))

    rule_score = min(100, sum(i["weight"] for i in a["indicators"]))
    score = rule_score
    source = "rules"

    bert = bert_model.predict(a["url"])
    if bert is not None:
        score = round((1 - BERT_WEIGHT) * rule_score + BERT_WEIGHT * bert * 100)
        source = "rules+bert"

    level = level_for(score)
    cat = CATEGORIES[level]
    return {
        "url": a["url"],
        "score": score,
        "level": level,  # hi | md | lo
        "name": cat["name"],
        "tag": cat["tag"],
        "indicators": a["indicators"],  # [{text, weight}]
        "explanation": cat["explanation"],
        "recommendation": cat["recommendation"],
        "source": source,
        "checkedAt": datetime.now(timezone.utc).isoformat(),
    }