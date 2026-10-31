"""Tempat menyambungkan model BERT milik teman satu tim.

Cukup isi fungsi predict() supaya mengembalikan probabilitas phishing
(angka 0.0 sampai 1.0). Selama masih mengembalikan None, API memakai
analisis aturan (analyzer.py) saja.
"""
from typing import Optional


def predict(url: str) -> Optional[float]:
    # TODO (tim AI): load model sekali di atas, lalu hitung probabilitas di sini.
    # Contoh: return float(model.predict_proba([url])[0][1])
    return None