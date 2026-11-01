# 🛡️ SCAMGUARD — Cek Tautan, Hindari Ancaman

> **Hybrid AI-Powered Web Security & Threat Detection Engine**  
> *Inovasi Pendeteksi Phishing, Perjudian Online, dan Validasi Keamanan URL Berbasis Deep Learning Transformer (BERT) & Heuristik Leksikal.*  
> 
> 🏆 **Karya Inovasi: Tim Akpoll · Politeknik Negeri Jember · INCEPTION 2026**

---

## 📌 Daftar Isi
1. [Tentang SCAMGUARD](#-tentang-scamguard)
2. [Fitur Unggulan](#-fitur-unggulan)
3. [Arsitektur Sistem (Hybrid Model)](#-arsitektur-sistem-hybrid-model)
4. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
5. [Panduan Menjalankan di Lokal (Step-by-Step)](#-panduan-menjalankan-di-lokal-step-by-step)
   - [Prasyarat Sistem](#prasyarat-sistem)
   - [Opsi A: Menggunakan Script Praktis (Windows 1-Click)](#opsi-a-menggunakan-script-praktis-windows-1-click)
   - [Opsi B: Menjalankan Manual Lewat Terminal](#opsi-b-menjalankan-manual-lewat-terminal)
6. [Skenario Pengujian untuk Dewan Juri](#-skenario-pengujian-untuk-dewan-juri-test-cases)
7. [Dokumentasi API (FastAPI Swagger)](#-dokumentasi-api-fastapi-swagger)
8. [AI Use and Third-Party Declaration](#-ai-use-and-third-party-declaration)
9. [Tim Pengembang](#-tim-pengembang)

---

## 💡 Tentang SCAMGUARD

Tingginya angka kejahatan siber berbasis rekayasa sosial (*phishing*) dan maraknya situs perjudian daring ilegal menuntut adanya solusi pendeteksian yang cepat, akurat, dan transparan.

**SCAMGUARD** adalah platform keamanan web modern yang mengintegrasikan:
1. **Analisis Heuristik & Aturan URL (40%)**: Memeriksa struktur sintaksis, pemalsuan merek (*brand spoofing*), domain palsu (*typosquatting*), akhiran TLD berisiko, pemendek tautan (*URL shortener*), hingga port tidak lazim.
2. **Deep Learning NLP - Fine-Tuned BERT (60%)**: Melakukan *live scraping* terhadap konten web (judul, deskripsi meta, dan teks isi) untuk mengenali formulir pencurian identitas, narasi manipulatif, serta ribuan pola frasa kasino/perjudian daring.
3. **Validasi Status HTTP & Deteksi Galat**: Memvalidasi kode status server (seperti HTTP 404, 403 Forbidden, akses ditolak, maupun domain mati) agar tidak salah mengategorikan tautan rusak/palsu sebagai situs aman.

---

## 🚀 Fitur Unggulan

- ✅ **Deteksi Multi-Kategori Akurat**:
  - `Risiko Rendah` (*Legitimate* / Resmi)
  - `Risiko Tinggi - Phishing` (Pemalsuan merek, formulir login mencurigakan)
  - `Risiko Tinggi - Indikasi Perjudian` (Situs judi bola, slot, togel, kasino online)
  - `Halaman Tidak Ditemukan` (HTTP 404 Not Found)
  - `Tidak Dapat Dianalisis` (*Unknown* / Halaman error, DNS gagal, akses dibatasi)
- ✅ **Evidence & Token Highlighting**: Menampilkan frasa dan kata kunci bukti yang ditemukan langsung dari halaman target dalam bentuk *interactive pill chips*.
- ✅ **Validasi HTTP Cerdas**: Jika halaman mengembalikan 404 atau judul halaman berstatus galat (*Page not found*, *Access Denied*), sistem menolak menganggapnya aman.
- ✅ **Pemisahan Protokol HTTPS**: Protokol HTTPS hanya diakui sebagai enkripsi transmisi data dan **bukan bukti bahwa situs bebas dari penipuan** (mengingat situs phishing modern juga menggunakan HTTPS).
- ✅ **Antarmuka Modern (Single Page Application)**: Tanpa dependensi framework berat, berbasis pola MVC murni (*Vanilla JavaScript* + CSS Modern), ringan, cepat, dan responsif.

---

## 🏗️ Arsitektur Sistem (Hybrid Model)

```
[ Pengguna Memasukkan URL ]
            │
            ▼
┌───────────────────────────────────────────────┐
│        TAHAP 1: VALIDASI LEKSIKAL & DNS       │
│  - Cek protokol, format hostname, dan IP      │
│  - DNS Lookup (Deteksi NXDOMAIN / Domain Mati)│
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│        TAHAP 2: ATURAN HEURISTIK URL (40%)    │
│  - Brand Spoofing (BCA, PayPal, Google, dll)  │
│  - Analisis TLD, subdomain, & port            │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│        TAHAP 3: LIVE SCRAPING & BERT (60%)    │
│  - Ekstraksi Title, Meta, & Konten HTML       │
│  - Cek HTTP Status Code (404, 403, 500)       │
│  - Deteksi Halaman Galat / Access Denied      │
│  - Inferensi Model BERT Transformer           │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│         HASIL AKHIR & DASHBOARD INTERAKTIF    │
│  - Skor Risiko (0–100) atau Status Unknown (?) │
│  - Rekomendasi Tindakan Keamanan              │
│  - Evidence & Token Highlighting              │
└───────────────────────────────────────────────┘
```

---

## 📁 Struktur Direktori Proyek

```text
scamguard/
│
├── app/                        # Arsitektur Frontend MVC (Vanilla JavaScript)
│   ├── controllers/            # Controller halaman & pemeriksaan URL
│   ├── models/                 # Model API, Data Risiko, & Analisis Leksikal
│   ├── views/                  # Komponen visual (Result, Loading, Home, Icons)
│   ├── main.js                 # Inisialisasi aplikasi
│   ├── namespace.js            # Global namespace SCAMGUARD
│   └── router.js               # Hash-based SPA Router
│
├── assets/                     # Aset Statis
│   ├── css/style.css           # Sistem desain utama SCAMGUARD
│   └── img/                    # Gambar & ilustrasi
│
├── backend/                    # Mesin API & Model Kecerdasan Buatan (AI)
│   ├── analyzer.py             # Logika heuristik leksikal & basis aturan
│   ├── bert_model.py           # Integrasi model BERT & scraper konten web
│   ├── main.py                 # Endpoint FastAPI (POST /api/check, GET /api/health)
│   ├── requirements.txt        # Daftar pustaka Python backend
│   └── models/                 # Bobot Model BERT (Safetensors & Tokenizer)
│
├── jalankan_backend.bat        # Script 1-Click menjalankan Backend (Port 8000)
├── jalankan_frontend.bat       # Script 1-Click menjalankan Frontend (Port 3000)
├── index.html                  # Berkas utama aplikasi web
└── README.md                   # Dokumentasi teknis & panduan instalasi
```

---

## 💻 Panduan Menjalankan di Lokal (Step-by-Step)

### Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
- **Python**: Versi `3.10` atau `3.11` (Direkomendasikan Python 3.11).
- **Web Browser**: Google Chrome, Microsoft Edge, Mozilla Firefox, atau browser modern lainnya.
- **Koneksi Internet**: Diperlukan saat sistem melakukan *live scraping* untuk memeriksa halaman website target.

---

### Opsi A: Menggunakan Script Praktis (Windows 1-Click)

Jika Anda menggunakan Windows, kami telah menyediakan script otomatis agar Anda tidak perlu mengetik perintah panjang:

1. **Jalankan Backend API**:  
   Klik ganda berkas **`jalankan_backend.bat`**  
   *(Tunggu beberapa detik hingga muncul pesan `Uvicorn running on http://127.0.0.1:8000`). Biarkan jendela ini tetap terbuka.*

2. **Jalankan Frontend Web**:  
   Klik ganda berkas **`jalankan_frontend.bat`**  
   *(Server web lokal port 3000 akan aktif).*

3. **Buka Aplikasi**:  
   Buka browser dan akses alamat: 👉 **[http://localhost:3000](http://localhost:3000)**

---

### Opsi B: Menjalankan Manual Lewat Terminal

Jika Anda ingin menjalankan secara manual via Terminal (PowerShell / Command Prompt / Linux / macOS):

#### Langkah 1: Buka Terminal & Masuk ke Folder Proyek
```bash
cd scamguard
```

#### Langkah 2: (Opsional) Buat & Aktifkan Virtual Environment
```bash
# Membuat virtual environment
python -m venv .venv

# Mengaktifkan di Windows (PowerShell):
.\.venv\Scripts\Activate.ps1

# Mengaktifkan di Linux/macOS:
source .venv/bin/activate
```

#### Langkah 3: Pasang Dependensi Backend
```bash
pip install -r backend/requirements.txt
```

#### Langkah 4: Jalankan Server Backend (FastAPI + BERT)
Masuk ke folder `backend` dan jalankan Uvicorn:
```bash
cd backend
python -m uvicorn main:app --port 8000
```
*Tunggu hingga terminal menampilkan:*
```text
[bert_model] Model BERT berhasil dimuat. Device: cpu
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```
> *(Catatan: Biarkan terminal backend ini tetap menyala).*

#### Langkah 5: Jalankan Server Frontend (Web UI)
Buka **jendela terminal baru**, masuk ke folder utama `scamguard`, lalu jalankan server web HTTP port 3000:
```bash
cd scamguard
python -m http.server 3000
```

#### Langkah 6: Akses Aplikasi di Browser
Buka peramban web Anda dan kunjungi:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 🖥️ Contoh Nyata Terminal Saat Dijalankan

Berikut adalah contoh persis apa yang akan tampil di terminal Anda ketika backend dan frontend berhasil berjalan:

#### 1. Tampilan Terminal 1 — Backend API (Port 8000)
```text
PS C:\Users\ASUS\OneDrive\Documents\scamguard> .\jalankan_backend.bat

========================================================
  Menjalankan Backend SCAMGUARD (FastAPI + BERT)
  Port: 8000
========================================================

Loading weights: 100%|██████████████████████████████████| 201/201 [00:00<00:00, 1105.93it/s]
[bert_model] Model BERT berhasil dimuat. Device: cpu
INFO:     Started server process [101992]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```
*(Backend siap melayani permintaan analisis leksikal dan inferensi model deep learning).*

---

#### 2. Tampilan Terminal 2 — Frontend Web (Port 3000)
```text
PS C:\Users\ASUS\OneDrive\Documents\scamguard> .\jalankan_frontend.bat

========================================================
  Menjalankan Frontend SCAMGUARD di http://localhost:3000
========================================================

Serving HTTP on :: port 3000 (http://localhost:3000/) ...
```
*(Frontend siap diakses melalui peramban browser).*

---

### ⚡ Contoh Pengujian Cepat via CLI (cURL / PowerShell)

Bagi Dewan Juri yang ingin menguji API secara langsung tanpa browser, dapat menjalankan perintah berikut di terminal:

#### Contoh Uji URL Judi Online via cURL:
```bash
curl -X POST http://127.0.0.1:8000/api/check \
  -H "Content-Type: application/json" \
  -d '{"url": "https://888truecasino.com/free-slots"}'
```

#### Atau Menggunakan PowerShell:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/check" -Method Post -ContentType "application/json" -Body '{"url":"https://888truecasino.com/free-slots"}' | ConvertTo-Json -Depth 4
```

#### Contoh Output JSON dari Backend:
```json
{
  "url": "https://888truecasino.com/free-slots",
  "score": 95,
  "level": "gb",
  "name": "Risiko Tinggi",
  "tag": "Indikasi Perjudian",
  "source": "bert",
  "page_title": "Free Slots Games: Play Cash Chalet & RTG Slots at 888 True",
  "indicators": [
    { "ok": false, "weight": 20, "text": "Ditemukan frasa 'jackpot'." },
    { "ok": false, "weight": 20, "text": "Ditemukan frasa 'betting'." },
    { "ok": false, "weight": 20, "text": "Ditemukan frasa 'casino'." },
    { "ok": false, "weight": 20, "text": "Ditemukan frasa 'slot'." }
  ],
  "explanation": "Terindikasi aktivitas perjudian online. Frasa terdeteksi: jackpot, betting, casino, slot.",
  "recommendation": "Akses situs perjudian online dapat melanggar hukum di Indonesia. Hindari memberikan data pribadi.",
  "detected_phrases": ["jackpot", "betting", "casino", "slot"]
}
```

---

## 🧪 Skenario Pengujian untuk Dewan Juri (Test Cases)

Untuk menguji kehandalan analisis SCAMGUARD, Dewan Juri dapat mencoba memasukkan beberapa contoh tautan uji berikut pada kolom pemeriksaan:

| Kategori Pengujian | Contoh URL yang Diuji | Hasil yang Diharapkan | Keterangan Sistem |
| :--- | :--- | :---: | :--- |
| **1. Situs Judi Online** | `https://888truecasino.com/free-slots` | 🔴 **Risiko Tinggi** (Skor 95) | Terdeteksi frasa perjudian (*slot, casino, betting, jackpot*) oleh model BERT. |
| **2. Phishing / Brand Spoofing** | `http://paypal-verification-account.xyz/login` | 🔴 **Risiko Tinggi** (Skor 85+) | Terdeteksi pemalsuan merek PayPal, TLD berisiko `.xyz`, serta kata kunci *login*. |
| **3. Website Resmi / Sah** | `https://google.com` atau `https://tokopedia.com` | 🟢 **Risiko Rendah** (Skor 0–10) | Teridentifikasi sah oleh BERT. Protokol HTTPS dicatat sebagai enkripsi tanpa mengklaim kebal phishing. |
| **4. Validasi HTTP 404** | `https://httpstat.us/404` | ⚪ **Halaman Tidak Ditemukan** (Skor `?`) | Server merespons 404. Sistem **menolak** menyimpulkan tautan rusak sebagai situs aman. |
| **5. Deteksi Halaman Galat** | URL dengan halaman bertuliskan *Access Denied* / *403 Forbidden* | ⚪ **Tidak Dapat Dianalisis** (Skor `?`) | Konten fungsional tidak tersedia, ditandai sebagai *Unknown*. |
| **6. Domain Ngawur / Fiktif** | `https://bsmisbmbihdhgh.com/` | ⚪ **Domain Tidak Ditemukan** (Skor `?`) | Gagal resolve DNS (*NXDOMAIN*). Sistem menolak menyimpulkan domain mati sebagai situs aman. |

---

## 📚 Dokumentasi API (FastAPI Swagger)

Saat server backend berjalan di port 8000, Anda dapat mengakses dokumentasi API interaktif secara langsung:
- **Swagger UI Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Endpoint Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **Endpoint Pemeriksaan URL**: `POST http://127.0.0.1:8000/api/check` dengan body JSON:
  ```json
  {
    "url": "https://contoh-website.com"
  }
  ```

---

## 🤖 AI Use and Third-Party Declaration

Sebagai wujud transparansi, integritas akademik, dan kepatuhan terhadap regulasi kompetisi/hackathon, berikut adalah deklarasi resmi mengenai penggunaan teknologi Kecerdasan Buatan (AI) serta pustaka/aset pihak ketiga (*Third-Party*) dalam pengembangan proyek **SCAMGUARD**:

### 1. Deklarasi Penggunaan Kecerdasan Buatan (AI Use Declaration)

| Komponen / Ranah | Jenis Teknologi AI yang Digunakan | Tujuan & Peran dalam Proyek |
| :--- | :--- | :--- |
| **Model Utama Solusi (In-Product AI)** | **Fine-Tuned BERT Transformer** (`bert_category_38_experiment`) | Digunakan sebagai inti mesin inferensi analisis konten teks halaman website (hasil *live scraping*). Model dilatih secara khusus (*supervised fine-tuning*) untuk mengklasifikasikan halaman ke dalam 3 kategori: `Legitimate`, `Phishing`, dan `Online Gambling`. |
| **Asistensi Pengembangan (Development Assistance)** | **Google Antigravity & Gemini LLM** | Digunakan sebagai asisten pemrograman (*pair programming assistant*) untuk membantu mempercepat penulisan kode *boilerplate*, *code refactoring*, debugging pola regex leksikal URL, serta penyusunan dokumentasi teknis. |
| **Kemandirian & Orisinalitas Karya** | **Tim Akpoll (Pengembang)** | Arsitektur *Hybrid Scoring* (40% aturan leksikal URL + 60% BERT), penanganan error HTTP 404 & deteksi DNS NXDOMAIN, pemisahan enkripsi HTTPS dari legitimasi, kurasi dataset, serta arsitektur Frontend MVC dirancang dan diimplementasikan secara mandiri oleh tim pengembang. |

---

### 2. Deklarasi Perangkat Lunak & Pustaka Pihak Ketiga (Third-Party Declaration)

Seluruh pustaka pihak ketiga yang digunakan dalam proyek ini berlisensi *open-source* yang sah dan diakui:

#### A. Backend & Machine Learning
- **PyTorch** (*BSD License*): Framework komputasi tensor untuk inferensi model deep learning.
- **Hugging Face Transformers & Tokenizers** (*Apache 2.0*): Pustaka untuk memuat arsitektur model Transformer BERT dan tokenisasi teks.
- **Safetensors** (*Apache 2.0*): Format penyimpanan bobot model yang aman, cepat, dan terhindar dari *arbitrary code execution*.
- **FastAPI** (*MIT License*): Kerangka kerja web berkinerja tinggi untuk menyediakan REST API `/api/check`.
- **Uvicorn** (*BSD License*): Server ASGI berkecepatan tinggi untuk menjalankan aplikasi backend.
- **BeautifulSoup4 & Requests** (*MIT & Apache 2.0*): Pustaka untuk *live web content scraping* dan parsing struktur DOM HTML.

#### B. Frontend & Desain
- **Vanilla JavaScript**: Seluruh antarmuka web dibangun menggunakan JavaScript murni dengan pola desain MVC (Model-View-Controller) **tanpa framework pihak ketiga** (seperti React, Vue, atau Angular), menjamin kecepatan muat yang sangat ringan.
- **Google Fonts** (*SIL Open Font License 1.1*): Tipografi `Plus Jakarta Sans` dan `JetBrains Mono`.
- **Custom SVG Icons**: Ikon visual vektor kustom yang dibuat ringan tanpa dependensi pustaka ikon eksternal.

#### C. Dataset Pelatihan Model
- Dataset teks konten web untuk pelatihan BERT dikurasi dan dihimpun dari repositori data terbuka (phishing feeds, database situs sah) serta dataset frasa perjudian online yang dikurasi khusus oleh tim untuk keperluan riset dan kompetisi ini.

---

## 👥 Tim Pengembang

Proyek ini dikembangkan oleh **Tim Akpoll** dari **Politeknik Negeri Jember** dalam rangka ajang **INCEPTION 2026**:
- **Muhammad Vernando** — *Lead Developer & Machine Learning Engineer*

---
*© 2026 SCAMGUARD by Tim Akpoll. Dibuat untuk ekosistem digital Indonesia yang lebih aman.*
