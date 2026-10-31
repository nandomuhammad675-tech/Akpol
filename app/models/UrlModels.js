// MODEL: analisis karakteristik URL (struktur, domain, kata kunci, merek)
SG.models.Url = (function () {
  const BRANDS = {
    paypal: "paypal.com",
    google: "google.com",
    facebook: "facebook.com",
    instagram: "instagram.com",
    microsoft: "microsoft.com",
    apple: "apple.com",
    netflix: "netflix.com",
    shopee: "shopee.co.id",
    tokopedia: "tokopedia.com",
    gopay: "gopay.co.id",
    dana: "dana.id",
    bca: "bca.co.id",
    bni: "bni.co.id",
    bri: "bri.co.id",
    mandiri: "bankmandiri.co.id",
  };
  const KEYS = [
    "login",
    "signin",
    "verify",
    "update",
    "secure",
    "account",
    "password",
    "confirm",
    "wallet",
    "bonus",
  ];
  const TLDS = [
    "xyz",
    "top",
    "tk",
    "ml",
    "ga",
    "cf",
    "gq",
    "click",
    "work",
    "zip",
    "icu",
    "cyou",
    "buzz",
  ];
  const SHORT = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "is.gd",
    "cutt.ly",
    "s.id",
    "rb.gy",
  ];

  function analyze(raw) {
    let s = raw.trim();
    if (!s) return { err: "Masukkan URL terlebih dahulu." };
    if (/\s/.test(s)) return { err: "URL tidak boleh mengandung spasi." };
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "https://" + s;
    let u;
    try {
      u = new URL(s);
    } catch (e) {
      return { err: "Format URL tidak valid. Contoh: https://contoh.com" };
    }
    if (!/^https?:$/.test(u.protocol))
      return {
        err: "Hanya URL berawalan http:// atau https:// yang dapat diperiksa.",
      };
    const h = u.hostname.toLowerCase();
    const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(":");
    if (!isIP && !h.includes("."))
      return { err: "Nama domain tidak valid. Contoh: https://contoh.com" };
    const parts = h.split("."),
      tld = parts[parts.length - 1];
    const sl = ["co", "ac", "go", "or", "sch", "web", "net"];
    const regN =
      parts.length > 2 &&
      sl.includes(parts[parts.length - 2]) &&
      tld.length === 2
        ? 3
        : 2;
    const reg = parts.slice(-regN).join("."),
      subs = parts.length - regN;
    const full = u.href,
      I = [];
    const add = (w, t) => I.push({ w, t });
    if (isIP) add(30, "Menggunakan alamat IP sebagai pengganti nama domain.");
    if (u.protocol === "http:")
      add(
        20,
        "Tidak menggunakan HTTPS, sehingga data yang dikirim tidak terenkripsi.",
      );
    if (/@/.test(s.replace(/^[a-z]+:\/\//i, "").split("/")[0]))
      add(
        25,
        "Mengandung simbol @ yang dapat menyembunyikan tujuan sebenarnya.",
      );
    if (full.length > 75)
      add(12, `URL terlalu panjang (${full.length} karakter).`);
    if (!isIP && subs >= 3)
      add(15, `Memiliki banyak subdomain (${subs} tingkat).`);
    if (h.includes("xn--"))
      add(
        25,
        "Menggunakan karakter internasional (punycode) yang bisa meniru domain lain.",
      );
    if (!isIP && TLDS.includes(tld))
      add(15, `Menggunakan akhiran domain .${tld} yang sering disalahgunakan.`);
    if (!isIP && (reg.split(".")[0].match(/-/g) || []).length >= 1)
      add(8, "Nama domain mengandung tanda hubung (-).");
    if (SHORT.includes(reg))
      add(
        15,
        "Menggunakan layanan pemendek tautan sehingga tujuan asli tersembunyi.",
      );
    if (u.port && !["80", "443"].includes(u.port))
      add(10, `Menggunakan port tidak lazim (${u.port}).`);
    const kw = KEYS.filter((k) => (h + u.pathname).toLowerCase().includes(k));
    if (kw.length)
      add(
        Math.min(42, kw.length * 14),
        `Memuat kata yang sering dipakai pada phishing: ${kw.join(", ")}.`,
      );
    if (!isIP)
      for (const b in BRANDS) {
        if (h.includes(b) && reg !== BRANDS[b]) {
          add(
            35,
            `Nama domain menyerupai merek "${b}", tetapi bukan domain resminya (${BRANDS[b]}).`,
          );
          break;
        }
      }
    return {
      url: full,
      host: h,
      indicators: I.map((x) => ({ weight: x.w, text: x.t })),
    };
  }

  return { analyze: analyze };
})();
