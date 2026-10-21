/*
 * Etiket bileşeni.
 *
 *   const el = DE.Etiket.olustur("290", { ...DE.URUNLER.yag })
 *   await DE.Etiket.guncelle(el, { ...el.durum, fiyat: 419.9, eski: 449.9 })
 *
 * Düzen ekran oranından seçilir: kare (1.54"), geniş (2.13"-3.50"),
 * pano (4.20" ve üstü). Aynı içerik her boyutta kendi düzenine oturur.
 */
(function () {
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SAYI = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const SAAT = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  const YENILEME_MS = 1400;
  const ICERIK_DEGISIR_MS = 700; // perde kapalıyken içerik değişir

  const fmt = {
    fiyat: (n) => SAYI.format(n),
    parca(n) {
      const [tam, kurus] = SAYI.format(n).split(",");
      return { tam, kurus: "," + kurus };
    },
    saat: (t = new Date()) => SAAT.format(t).replace(",", ""),
  };

  /* ------------------------------------------------------------ EAN-13 */

  const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
  const R = L.map((k) => k.replace(/./g, (b) => (b === "0" ? "1" : "0")));
  const G = R.map((k) => k.split("").reverse().join(""));
  const ESLIK = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

  function kontrolHanesi(on2) {
    const t = on2.split("").reduce((s, h, i) => s + Number(h) * (i % 2 ? 3 : 1), 0);
    return String((10 - (t % 10)) % 10);
  }

  // Ürün adından kararlı bir mağaza içi kod (20 ile başlar)
  function barkodNo(ad) {
    let h = 2166136261;
    for (const c of ad) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    const on2 = "20" + String(h).padStart(10, "0").slice(-10);
    return on2 + kontrolHanesi(on2);
  }

  function barkodSvg(no) {
    const h = no.split("").map(Number);
    let bit = "101";
    for (let i = 0; i < 6; i++) bit += (ESLIK[h[0]][i] === "L" ? L : G)[h[i + 1]];
    bit += "01010";
    for (let i = 7; i < 13; i++) bit += R[h[i]];
    bit += "101";

    let yol = "";
    for (let i = 0; i < bit.length; ) {
      if (bit[i] === "1") {
        let j = i;
        while (bit[j] === "1") j++;
        yol += `M${i} 0h${j - i}v30h-${j - i}z`;
        i = j;
      } else i++;
    }
    return `<svg viewBox="0 0 95 30" preserveAspectRatio="none" aria-hidden="true"><path d="${yol}" fill="currentColor"/></svg>`;
  }

  /* ------------------------------------------------------------ İçerik */

  function duzenSec(m) {
    const oran = m.eg / m.ey;
    if (oran < 1.15) return "kare";
    if (oran > 1.8) return "genis";
    return "pano";
  }

  function kacis(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  function birimMetni(d) {
    if (d.tartili) return `${d.birim} fiyatı`;
    if (d.birim === "porsiyon") return "Porsiyon";
    if (d.birim === "adet" && d.miktar === 1) return "Adet fiyatı";
    return `${fmt.fiyat(d.fiyat / d.miktar)} ₺/${d.birim}`;
  }

  function fiyatHtml(d) {
    const p = fmt.parca(d.fiyat);
    const ek = d.tartili ? `₺/${d.birim}` : "₺";
    return `<p class="ek__fiyat"><span>${p.tam}</span><span class="ek__kurus">${p.kurus}</span><span class="ek__tl">${ek}</span></p>`;
  }

  function indirimHtml(d) {
    if (!d.eski) return "";
    return `<span class="ek__rozet">İNDİRİM</span><span class="ek__eski">${fmt.fiyat(d.eski)} ₺</span>`;
  }

  function icerikHtml(duzen, d) {
    const sinif = `ek ek--${duzen}${d.eski ? " ek--indirim" : ""}`;
    const urun = `<p class="ek__urun">${kacis(d.urun)}</p>`;
    const zaman = fmt.saat(d.zaman);

    if (duzen === "kare") {
      return `<div class="${sinif}">${urun}<div class="ek__satir">${indirimHtml(d)}</div>${fiyatHtml(d)}<p class="ek__kucuk">${birimMetni(d)}</p></div>`;
    }

    const barkod = `<div class="ek__barkod">${d.barkod === false ? "" : barkodSvg(barkodNo(d.urun))}</div>`;
    const bilgi = d.bilgi || "Menşe: " + d.mense;

    if (duzen === "genis") {
      const ust = d.eski ? `<div class="ek__sol">${indirimHtml(d)}</div>` : `<div class="ek__sol"><span class="ek__kucuk">${kacis(d.kunye || bilgi)}</span></div>`;
      return `<div class="${sinif}">${urun}${ust}${fiyatHtml(d)}<div class="ek__alt">${barkod}<span class="ek__kucuk">${birimMetni(d)} · ${zaman}</span></div></div>`;
    }

    const sag = d.kunye || d.not || "";
    return `<div class="${sinif}">
      <div class="ek__ust"><span class="ek__kucuk">${kacis(bilgi)}</span><span class="ek__kucuk">${kacis(sag)}</span></div>
      ${urun}${fiyatHtml(d)}
      <div class="ek__orta">${indirimHtml(d) || "<span></span>"}</div>
      <div class="ek__alt">${barkod}<span class="ek__kucuk">${birimMetni(d)}<br>Güncelleme ${zaman}</span></div>
    </div>`;
  }

  function erisimMetni(m, d) {
    let s = `${m.ad} etiket: ${d.urun}, ${fmt.fiyat(d.fiyat)} TL`;
    if (d.eski) s += `, indirimli; önceki fiyat ${fmt.fiyat(d.eski)} TL`;
    return s;
  }

  /* Uzun fiyat (24.999,00) ekrana sığmıyorsa küçült. Ölçüler cqw ile
     orantılı olduğu için oran her boyutta geçerli kalır. */
  function sigdir(el) {
    const ekran = el.querySelector(".etiket__ekran");
    const fiyat = el.querySelector(".ek__fiyat");
    if (!ekran || !fiyat || !ekran.clientWidth) return;
    const pay = { kare: 0.9, genis: 0.6, pano: 0.88 }[el.dataset.duzen];
    fiyat.style.removeProperty("font-size");
    fiyat.style.width = "max-content";
    const genislik = fiyat.getBoundingClientRect().width;
    fiyat.style.removeProperty("width");
    const sinir = ekran.clientWidth * pay;
    if (genislik > sinir) {
      const yazi = parseFloat(getComputedStyle(fiyat).fontSize);
      const oran = sinir / genislik;
      // cqw/cqh cinsinden yaz ki etiket yeniden boyutlanınca da oran korunsun
      const birim = el.dataset.duzen === "genis" ? "cqh" : "cqw";
      const temel = el.dataset.duzen === "genis" ? ekran.clientHeight : ekran.clientWidth;
      fiyat.style.fontSize = `${((yazi * oran) / temel) * 100}${birim}`;
    }
  }

  function olustur(modelId, durum) {
    const m = DE.model(modelId);
    const el = document.createElement("figure");
    el.className = "etiket" + (m.renk === "Siyah / Beyaz" ? " etiket--sb" : "");
    el.dataset.model = m.id;
    el.dataset.duzen = duzenSec(m);
    el.style.setProperty("--g", m.g);
    el.style.setProperty("--y", m.y);
    el.style.setProperty("--eg", m.eg);
    el.style.setProperty("--ey", m.ey);
    el.setAttribute("role", "img");
    el.innerHTML = `<div class="etiket__govde"><div class="etiket__ekran" aria-hidden="true"><div class="etiket__icerik"></div><span class="etiket__perde"></span></div><span class="etiket__led"></span></div>`;
    yaz(el, { zaman: new Date(), ...durum });
    return el;
  }

  function yaz(el, durum) {
    const m = DE.model(el.dataset.model);
    el.durum = durum;
    el.setAttribute("aria-label", erisimMetni(m, durum));
    el.querySelector(".etiket__icerik").innerHTML = icerikHtml(el.dataset.duzen, durum);
    if (el.isConnected) sigdir(el);
  }

  function ledYak(el, renk) {
    el.removeAttribute("data-led");
    void el.offsetWidth; // animasyonu baştan başlat
    el.dataset.led = renk;
    clearTimeout(el._ledZaman);
    el._ledZaman = setTimeout(() => el.removeAttribute("data-led"), 3000);
  }

  function guncelle(el, durum) {
    const yeni = { ...durum, zaman: new Date() };
    clearTimeout(el._yenileme);
    clearTimeout(el._icerik);
    if (azHareket.matches) {
      yaz(el, yeni);
      return Promise.resolve();
    }
    return new Promise((bitti) => {
      el.removeAttribute("data-yenileniyor");
      void el.offsetWidth;
      el.dataset.yenileniyor = "";
      // Perde ekranı kapattığı anda içerik değişir; perdenin geri kalanı
      // yeni içeriğin üstünde oynar.
      el._icerik = setTimeout(() => yaz(el, yeni), ICERIK_DEGISIR_MS);
      el._yenileme = setTimeout(() => {
        el.removeAttribute("data-yenileniyor");
        bitti();
      }, YENILEME_MS);
    });
  }

  /* Ebeveynin genişliğine göre px/mm ölçeği. Etiketler aynı ölçekte
     kaldığı için boyutlar birbirine göre doğru görünür. */
  function olcekle(kutu, toplamMm, { enFazla = 3.4, bosluk = 0 } = {}) {
    const hesapla = () => {
      const w = kutu.clientWidth - bosluk;
      const o = Math.min(enFazla, w / toplamMm());
      kutu.style.setProperty("--olcek", o.toFixed(3));
      kutu.querySelectorAll(".etiket").forEach(sigdir);
    };
    new ResizeObserver(hesapla).observe(kutu);
    hesapla();
    return hesapla;
  }

  DE.fmt = fmt;
  DE.Etiket = { olustur, guncelle, yaz, sigdir, olcekle, ledYak };
})();
