/* Sayfa davranışları. İçerik veri.js'te, etiket çizimi etiket.js'te. */
(function () {
  const $ = (s, k = document) => k.querySelector(s);
  const $$ = (s, k = document) => [...k.querySelectorAll(s)];
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saatSn = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

  $("[data-yil]").textContent = new Date().getFullYear();

  /* ------------------------------------------------------------ Bildirim */

  const bildirim = (() => {
    const kutu = $("[data-bildirim]");
    const metin = $("[data-bildirim-metin]", kutu);
    const dugme = $("[data-bildirim-eylem]", kutu);
    let zaman, eylem;

    const gizle = () => {
      clearTimeout(zaman);
      kutu.removeAttribute("data-acik");
    };
    const kur = () => {
      clearTimeout(zaman);
      zaman = setTimeout(gizle, 6000);
    };

    dugme.addEventListener("click", () => {
      gizle();
      eylem?.();
    });
    kutu.addEventListener("pointerenter", () => clearTimeout(zaman));
    kutu.addEventListener("pointerleave", kur);
    kutu.addEventListener("focusin", () => clearTimeout(zaman));
    kutu.addEventListener("focusout", kur);

    return {
      goster(yazi, secenek = {}) {
        metin.textContent = yazi;
        eylem = secenek.eylem;
        dugme.hidden = !eylem;
        if (secenek.eylemAdi) dugme.textContent = secenek.eylemAdi;
        kutu.dataset.acik = "";
        kur();
      },
      gizle,
    };
  })();

  /* ------------------------------------------------------------ Üst bar */

  const ust = $("[data-ust]");
  let kaydirmaBekliyor = false;
  const kaydirma = () => {
    ust.toggleAttribute("data-kaydi", window.scrollY > 8);
    kaydirmaBekliyor = false;
  };
  window.addEventListener("scroll", () => {
    if (!kaydirmaBekliyor) {
      kaydirmaBekliyor = true;
      requestAnimationFrame(kaydirma);
    }
  }, { passive: true });
  kaydirma();

  // Ekrandaki bölümün menü bağlantısını işaretle
  const menuBaglari = $$(".ust__menu a");
  const bolumGozcu = new IntersectionObserver((kayitlar) => {
    kayitlar.forEach((k) => {
      if (!k.isIntersecting) return;
      menuBaglari.forEach((a) =>
        a.hash === "#" + k.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  // Menüde olmayan bölümler de izlenir: oraya gelince işaret kalkar
  $$("main > section").forEach((b) => bolumGozcu.observe(b));

  /* ------------------------------------------------------------ Mobil menü */

  (() => {
    const dugme = $("[data-menu-dugme]");
    const yazi = $("[data-menu-yazi]");
    const menu = $("[data-mobil-menu]");
    $$(".mobil-menu__liste li", menu).forEach((li, i) => li.style.setProperty("--sira", i));
    let kapanis;

    const ac = () => {
      clearTimeout(kapanis);
      menu.hidden = false;
      requestAnimationFrame(() => menu.dataset.acik = "");
      dugme.setAttribute("aria-expanded", "true");
      yazi.textContent = "Kapat";
      document.body.classList.add("kilitli");
      $("a", menu).focus({ preventScroll: true });
    };

    const kapat = (odakGeri = true) => {
      menu.removeAttribute("data-acik");
      dugme.setAttribute("aria-expanded", "false");
      yazi.textContent = "Menü";
      document.body.classList.remove("kilitli");
      kapanis = setTimeout(() => (menu.hidden = true), 240);
      if (odakGeri) dugme.focus();
    };

    dugme.addEventListener("click", () => (menu.hidden || !menu.hasAttribute("data-acik") ? ac() : kapat()));
    menu.addEventListener("click", (e) => e.target.closest("a") && kapat(false));

    document.addEventListener("keydown", (e) => {
      if (menu.hidden) return;
      if (e.key === "Escape") kapat();
      // Odak menü ile menü düğmesi arasında kalsın
      if (e.key === "Tab") {
        const odaklar = [dugme, ...$$("a", menu)];
        const i = odaklar.indexOf(document.activeElement);
        const son = odaklar.length - 1;
        if (e.shiftKey && i <= 0) { e.preventDefault(); odaklar[son].focus(); }
        else if (!e.shiftKey && i === son) { e.preventDefault(); odaklar[0].focus(); }
      }
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", (m) => m.matches && !menu.hidden && kapat(false));
  })();

  /* ------------------------------------------------------------ Açılış rafı */

  (() => {
    const ray = $("[data-raf-ray]");
    const liste = $("[data-kayit]");
    const dugme = $("[data-raf-dugme]");
    if (!ray) return;

    const etiketler = DE.RAF.etiketler.map((e) => {
      const el = DE.Etiket.olustur(e.model, { ...DE.URUNLER[e.urun] });
      ray.append(el);
      return el;
    });

    const gorunen = () => etiketler.filter((el) => el.offsetParent !== null);
    DE.Etiket.olcekle(ray, () => {
      const g = gorunen();
      return g.reduce((t, el) => t + DE.model(el.dataset.model).g, 0) + (g.length - 1) * 6;
    }, { enFazla: 3.4, bosluk: 32 });

    let sira = 0;
    let zaman = null;
    let durduruldu = azHareket.matches;
    let ekranda = false;

    function kayitEkle(el, onceki, yeni) {
      const li = document.createElement("li");
      li.dataset.yeni = "";
      li.innerHTML = `<span>${saatSn()}</span><span class="kayit__urun"></span><span class="kayit__durum" data-durum="gidiyor">gönderiliyor</span>`;
      $(".kayit__urun", li).textContent = `${yeni.urun}  ${DE.fmt.fiyat(onceki.fiyat)} → ${DE.fmt.fiyat(yeni.fiyat)}${yeni.eski ? " indirim" : ""}`;
      liste.prepend(li);
      while (liste.children.length > 4) liste.lastElementChild.remove();
      return $(".kayit__durum", li);
    }

    async function adim() {
      const adimlar = DE.RAF.adimlar;
      let deneme = 0;
      let el, fiyat, indirim;
      // Mobilde gizli etiketin adımlarını atla
      do {
        [, fiyat, indirim] = adimlar[sira % adimlar.length];
        el = etiketler[adimlar[sira % adimlar.length][0]];
        sira++;
      } while (el.offsetParent === null && ++deneme < adimlar.length);

      const onceki = el.durum;
      const temel = onceki.eski || onceki.fiyat;
      const yeni = { ...onceki, fiyat, eski: indirim ? temel : null };
      const durum = kayitEkle(el, onceki, yeni);
      await bekle(600);
      await DE.Etiket.guncelle(el, yeni);
      durum.textContent = "rafta";
      durum.dataset.durum = "rafta";
    }

    function planla() {
      clearTimeout(zaman);
      zaman = null;
      if (durduruldu || !ekranda || document.hidden) return;
      zaman = setTimeout(async () => {
        await adim();
        planla();
      }, liste.children.length ? 4200 : 1200);
    }

    function dugmeyiYaz() {
      dugme.textContent = durduruldu ? "Başlat" : "Durdur";
      dugme.setAttribute("aria-pressed", String(durduruldu));
    }

    dugme.addEventListener("click", () => {
      durduruldu = !durduruldu;
      dugmeyiYaz();
      planla();
    });

    new IntersectionObserver(([k]) => {
      ekranda = k.isIntersecting;
      planla();
    }).observe(ray);
    document.addEventListener("visibilitychange", planla);
    dugmeyiYaz();
  })();

  /* ------------------------------------------------------------ Fiyat girdisi */

  // "1.249,90", "1249,9", "1249.90" kabul edilir. Geçersizse NaN.
  function fiyatOku(metin) {
    let s = metin.replace(/[\s₺]/g, "");
    if (!s) return NaN;
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    return /^\d+(\.\d{1,2})?$/.test(s) ? Number(s) : NaN;
  }

  function alanHatasi(alan, mesaj) {
    const hata = $("[data-hata-metni]", alan);
    const girdi = $("input, select, textarea", alan);
    if (mesaj) {
      alan.dataset.hata = "";
      hata.textContent = mesaj;
      girdi?.setAttribute("aria-invalid", "true");
    } else {
      alan.removeAttribute("data-hata");
      if (hata) hata.textContent = "";
      girdi?.removeAttribute("aria-invalid");
    }
  }

  /* ------------------------------------------------------------ Deneme */

  (() => {
    const form = $("[data-dene]");
    if (!form) return;
    const sahne = $("[data-dene-sahne]");
    const secim = $("[data-dene-urun]", form);
    const girdi = $("[data-dene-fiyat]", form);
    const indirim = $("[data-dene-indirim]", form);
    const gonder = $("[data-dene-gonder]", form);
    const gonderYazi = $("[data-dugme-yazi]", gonder);
    const ipucu = $("[data-dene-ipucu]", form);
    const durumYazi = $("[data-dene-durum]", form);
    const fiyatAlani = $('[data-alan="fiyat"]', form);

    const durumlar = Object.fromEntries(DE.DENEME.map((k) => [k, { ...DE.URUNLER[k] }]));
    DE.DENEME.forEach((k) => secim.add(new Option(DE.URUNLER[k].urun, k)));

    const etiket = DE.Etiket.olustur("420", durumlar[secim.value]);
    sahne.append(etiket);
    DE.Etiket.olcekle(sahne, () => DE.model("420").g, { enFazla: 3.4, bosluk: 32 });

    let mesgul = false;

    const simdiki = () => durumlar[secim.value];

    function ipucuYaz() {
      const d = simdiki();
      ipucu.textContent = d.eski
        ? `Etikette: ${DE.fmt.fiyat(d.fiyat)} ₺ indirimli, normal fiyat ${DE.fmt.fiyat(d.eski)} ₺`
        : `Etikette: ${DE.fmt.fiyat(d.fiyat)} ₺`;
    }

    function denetle() {
      const d = simdiki();
      const x = fiyatOku(girdi.value);
      const temel = d.eski || d.fiyat;
      if (!girdi.value.trim()) return "Yeni fiyatı yazın.";
      if (Number.isNaN(x)) return "Fiyatı sayı olarak yazın, örneğin 349,90.";
      if (x <= 0) return "Fiyat 0'dan büyük olmalı.";
      if (x > 99999.99) return "Bu denemede en yüksek fiyat 99.999,99 ₺.";
      if (indirim.checked && x >= temel) return `İndirimli fiyat normal fiyattan (${DE.fmt.fiyat(temel)} ₺) düşük olmalı.`;
      if (x === d.fiyat && indirim.checked === Boolean(d.eski)) return "Etiket zaten bu fiyatı gösteriyor.";
      return "";
    }

    function dugmeDurumu() {
      gonder.disabled = mesgul || !girdi.value.trim();
    }

    secim.addEventListener("change", () => {
      DE.Etiket.yaz(etiket, simdiki());
      DE.Etiket.sigdir(etiket);
      girdi.value = "";
      indirim.checked = false;
      alanHatasi(fiyatAlani, "");
      durumYazi.textContent = "";
      ipucuYaz();
      dugmeDurumu();
    });

    girdi.addEventListener("input", () => {
      if (fiyatAlani.hasAttribute("data-hata")) alanHatasi(fiyatAlani, denetle());
      dugmeDurumu();
    });
    girdi.addEventListener("blur", () => girdi.value.trim() && alanHatasi(fiyatAlani, denetle()));
    indirim.addEventListener("change", () => {
      if (girdi.value.trim()) alanHatasi(fiyatAlani, denetle());
    });

    async function uygula(anahtar, yeni, { geriAl = true } = {}) {
      mesgul = true;
      dugmeDurumu();
      gonder.setAttribute("aria-busy", "true");
      gonderYazi.textContent = "Gönderiliyor";
      [secim, girdi, indirim].forEach((g) => (g.disabled = true));
      durumYazi.removeAttribute("data-durum");

      const onceki = durumlar[anahtar];
      durumYazi.textContent = "Modeme iletiliyor…";
      await bekle(500);
      durumYazi.textContent = "Etiket ekranı yenileniyor…";
      durumlar[anahtar] = yeni;
      await DE.Etiket.guncelle(etiket, yeni);

      durumYazi.textContent = `Rafta · ${saatSn()}`;
      durumYazi.dataset.durum = "tamam";
      gonder.removeAttribute("aria-busy");
      gonderYazi.textContent = "Etikete gönder";
      [secim, girdi, indirim].forEach((g) => (g.disabled = false));
      mesgul = false;
      girdi.value = "";
      indirim.checked = false;
      ipucuYaz();
      dugmeDurumu();

      if (geriAl) {
        bildirim.goster(`${yeni.urun}: ${DE.fmt.fiyat(yeni.fiyat)} ₺ etikette`, {
          eylemAdi: "Geri al",
          eylem: () => {
            if (mesgul) return;
            if (secim.value !== anahtar) {
              secim.value = anahtar;
              secim.dispatchEvent(new Event("change"));
            }
            uygula(anahtar, onceki, { geriAl: false }).then(() => bildirim.goster("Önceki fiyata dönüldü"));
          },
        });
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (mesgul) return;
      const hata = denetle();
      alanHatasi(fiyatAlani, hata);
      if (hata) {
        girdi.focus();
        return;
      }
      const d = simdiki();
      const x = fiyatOku(girdi.value);
      const yeni = { ...d, fiyat: x, eski: indirim.checked ? d.eski || d.fiyat : null };
      uygula(secim.value, yeni);
    });

    ipucuYaz();
    dugmeDurumu();
  })();

  /* ------------------------------------------------------------ Katalog */

  (() => {
    const sahne = $("[data-katalog-sahne]");
    if (!sahne) return;
    const yuva = $("[data-katalog-etiket]");
    const ad = $("[data-katalog-ad]");
    const yer = $("[data-katalog-yer]");
    const tablo = $("[data-katalog-ozellik]");
    const sayi = (n) => String(n).replace(".", ",");

    ["standart", "ozel"].forEach((grup) => {
      const kutu = $(`[data-secici="${grup}"]`);
      DE.MODELLER.filter((m) => m.grup === grup).forEach((m) => {
        const alt = grup === "ozel" ? m.ad.split('" ')[1] : `${Math.round(m.g)} × ${Math.round(m.y)} mm`;
        const ust = grup === "ozel" ? m.ad.split(" ")[0] : m.ad;
        kutu.insertAdjacentHTML("beforeend",
          `<label class="secici__oge"><input type="radio" name="model" value="${m.id}"><span><b>${ust}</b><small>${alt}</small></span></label>`);
      });
    });

    // Ölçek en büyük etikete (7.50") göre sabit; seçilen etiket diğerlerine göre gerçek boyutta görünür
    const enBuyuk = DE.model("750");
    DE.Etiket.olcekle(sahne, () => enBuyuk.g, { enFazla: 2.5, bosluk: 32 });
    const yukseklik = () => (yuva.style.minHeight = `calc(var(--olcek) * ${enBuyuk.y}px)`);
    yukseklik();

    function goster(id) {
      const m = DE.model(id);
      const urun = DE.URUNLER[DE.KATALOG_URUN[id]];
      yuva.replaceChildren(DE.Etiket.olustur(id, { ...urun }));
      DE.Etiket.sigdir(yuva.firstElementChild);

      ad.textContent = `${m.ad} elektronik raf etiketi`;
      yer.textContent = m.yer;
      const satirlar = [
        ["Ürün kodu", m.kod],
        ["Gövde", `${sayi(m.g)} × ${sayi(m.y)} × ${m.k} mm`],
        ["Ağırlık", `${m.agirlik} g`],
        ["Aktif ekran alanı", `${sayi(m.eg)} × ${sayi(m.ey)} mm`],
        ["Çözünürlük", `${m.cozunurluk} piksel`],
        ["Nokta yoğunluğu", `${m.dpi} DPI`],
        ["Ekran renkleri", m.renk],
        ["Pil", `${m.pil}, değiştirilebilir`],
        ["Pil ömrü", m.omur],
        ["Çalışma sıcaklığı", m.sicaklik],
        ["Haberleşme", `${m.frekans}, ${m.uzaklik}`],
        ["LED", m.led],
      ];
      if (m.nfc) satirlar.push(["NFC", m.nfc]);
      tablo.innerHTML = satirlar.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("");
    }

    // Mobilde seçili boyut yatay listede görünür kalsın (sayfa kaymadan)
    function gorunurYap(radyo) {
      const liste = radyo.closest(".secici");
      const oge = radyo.closest(".secici__oge");
      const fark = oge.offsetLeft - liste.offsetLeft - (liste.clientWidth - oge.offsetWidth) / 2;
      liste.scrollLeft = fark;
    }

    $$('input[name="model"]').forEach((r) => r.addEventListener("change", () => {
      goster(r.value);
      gorunurYap(r);
    }));
    const ilk = $('input[name="model"][value="290"]');
    ilk.checked = true;
    goster(ilk.value);
    gorunurYap(ilk);
  })();

  /* ------------------------------------------------------------ Sektör sekmeleri */

  (() => {
    const liste = $("[data-sekme-liste]");
    const paneller = $("[data-sekme-paneller]");
    if (!liste) return;

    DE.SEKTORLER.forEach((s, i) => {
      const sekme = document.createElement("button");
      sekme.type = "button";
      sekme.className = "sekme";
      sekme.id = `sekme-${s.id}`;
      sekme.setAttribute("role", "tab");
      sekme.setAttribute("aria-controls", `panel-${s.id}`);
      sekme.setAttribute("aria-selected", String(i === 0));
      sekme.tabIndex = i === 0 ? 0 : -1;
      sekme.textContent = s.ad;
      liste.append(sekme);

      const panel = document.createElement("div");
      panel.className = "sekme-panel";
      panel.id = `panel-${s.id}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", sekme.id);
      panel.tabIndex = 0;
      panel.hidden = i !== 0;
      panel.innerHTML = `
        <div class="izgara sektor">
          <div class="sektor__metin">
            <h3 class="t-h3"></h3>
            <p class="t-soluk metin"></p>
            <p class="t-ust">Önerilen boyutlar</p>
            <ul class="sektor__oneri">${s.oneri.map((o) => `<li>${o}</li>`).join("")}</ul>
          </div>
          <div class="sektor__sahne"></div>
        </div>`;
      $("h3", panel).textContent = s.ad;
      $("p", panel).textContent = s.metin;
      paneller.append(panel);
    });

    const sekmeler = $$(".sekme", liste);

    function etiketKur(panel) {
      const s = DE.SEKTORLER.find((x) => `panel-${x.id}` === panel.id);
      const sahne = $(".sektor__sahne", panel);
      if (sahne.firstElementChild) return;
      const urun = DE.URUNLER[s.urun];
      const durum = s.indirim ? { ...urun, fiyat: s.indirim, eski: urun.fiyat } : { ...urun };
      sahne.append(DE.Etiket.olustur(s.model, durum));
      DE.Etiket.olcekle(sahne, () => DE.model(s.model).g, { enFazla: 4, bosluk: 32 });
    }

    function sec(sekme, odakla = true) {
      sekmeler.forEach((t) => {
        const secili = t === sekme;
        t.setAttribute("aria-selected", String(secili));
        t.tabIndex = secili ? 0 : -1;
        const panel = $("#" + t.getAttribute("aria-controls"));
        panel.hidden = !secili;
        if (secili) etiketKur(panel);
      });
      if (odakla) sekme.focus();
      sekme.scrollIntoView({ block: "nearest", inline: "nearest", behavior: azHareket.matches ? "auto" : "smooth" });
    }

    liste.addEventListener("click", (e) => {
      const t = e.target.closest(".sekme");
      if (t) sec(t);
    });

    liste.addEventListener("keydown", (e) => {
      const i = sekmeler.indexOf(document.activeElement);
      if (i < 0) return;
      const hedef = {
        ArrowRight: sekmeler[(i + 1) % sekmeler.length],
        ArrowLeft: sekmeler[(i - 1 + sekmeler.length) % sekmeler.length],
        Home: sekmeler[0],
        End: sekmeler[sekmeler.length - 1],
      }[e.key];
      if (hedef) {
        e.preventDefault();
        sec(hedef);
      }
    });

    // İlk panel görünür olduğunda etiketini çiz (gizliyken genişlik 0)
    etiketKur($("#" + sekmeler[0].getAttribute("aria-controls")));
  })();

  /* ------------------------------------------------------------ Teklif formu */

  (() => {
    const form = $("[data-form]");
    if (!form) return;
    const gonder = $("[data-form-gonder]", form);
    const gonderYazi = $("[data-dugme-yazi]", gonder);
    const uyari = $("[data-form-uyari]", form);
    const sonuc = $("[data-form-sonuc]");
    let gonderiliyor = false;

    const telefonRakam = (v) => {
      let r = v.replace(/\D/g, "");
      if (r.startsWith("90") && r.length === 12) r = r.slice(2);
      if (r.startsWith("0")) r = r.slice(1);
      return r;
    };

    const telefonBicim = (r) =>
      r.length === 10 ? `0 (${r.slice(0, 3)}) ${r.slice(3, 6)} ${r.slice(6, 8)} ${r.slice(8)}` : null;

    const KURALLAR = {
      ad: (v) => (v.trim().length < 2 ? "Adınızı ve soyadınızı yazın." : ""),
      firma: (v) => (v.trim().length < 2 ? "İşletmenizin adını yazın." : ""),
      telefon: (v) => {
        if (!v.trim()) return "Size ulaşabileceğimiz bir telefon yazın.";
        const r = telefonRakam(v);
        return r.length === 10 && /^[2-5]/.test(r) ? "" : "Telefonu 10 haneli yazın, örneğin 0 (532) 123 45 67.";
      },
      eposta: (v) => (v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "E-posta adresini kontrol edin." : ""),
      kvkk: (_, girdi) => (girdi.checked ? "" : "Devam etmek için onay verin."),
    };

    const alanlar = Object.keys(KURALLAR).map((ad) => {
      const alan = $(`[data-alan="${ad}"]`, form);
      const girdi = $(`[name="${ad}"]`, alan);
      return { ad, alan, girdi, kural: KURALLAR[ad] };
    });

    const denetle = ({ alan, girdi, kural }) => {
      const hata = kural(girdi.value, girdi);
      alanHatasi(alan, hata);
      return hata;
    };

    alanlar.forEach((a) => {
      const olay = a.girdi.type === "checkbox" ? "change" : "blur";
      a.girdi.addEventListener(olay, () => {
        if (a.ad === "telefon") {
          const b = telefonBicim(telefonRakam(a.girdi.value));
          if (b) a.girdi.value = b;
        }
        if (a.girdi.value.trim() || a.girdi.type === "checkbox") denetle(a);
      });
      a.girdi.addEventListener("input", () => a.alan.hasAttribute("data-hata") && denetle(a));
    });

    function mesgul(durum) {
      gonderiliyor = durum;
      gonder.disabled = durum;
      if (durum) gonder.setAttribute("aria-busy", "true");
      else gonder.removeAttribute("aria-busy");
      gonderYazi.textContent = durum ? "Gönderiliyor" : "Teklif isteğini gönder";
    }

    function sonucGoster({ ust, baslik, metin }) {
      $("[data-sonuc-ust]", sonuc).textContent = ust;
      $("[data-sonuc-baslik]", sonuc).textContent = baslik;
      $("[data-sonuc-metin]", sonuc).textContent = metin;
      form.hidden = true;
      sonuc.hidden = false;
      sonuc.focus();
    }

    function uyariGoster(metin) {
      uyari.replaceChildren();
      const p = document.createElement("span");
      p.textContent = metin;
      uyari.append(p);
      uyari.hidden = false;
      return uyari;
    }

    function veriTopla() {
      const v = Object.fromEntries(new FormData(form));
      v.telefon = telefonBicim(telefonRakam(v.telefon)) || v.telefon;
      delete v.web;
      return v;
    }

    function epostaAc(v) {
      const satirlar = [
        `Ad soyad: ${v.ad}`,
        `İşletme: ${v.firma}`,
        `Telefon: ${v.telefon}`,
        v.eposta && `E-posta: ${v.eposta}`,
        v.sektor && `İşletme türü: ${v.sektor}`,
        v.sube && `Şube sayısı: ${v.sube}`,
        v.cesit && `Ürün çeşidi: ${v.cesit}`,
        v.program && `Program: ${v.program}`,
        v.not && `\nNot:\n${v.not}`,
      ].filter(Boolean);
      const konu = `Digi Etiket teklif isteği: ${v.firma}`;
      window.location.href = `mailto:${DE.AYAR.eposta}?subject=${encodeURIComponent(konu)}&body=${encodeURIComponent(satirlar.join("\n"))}`;
    }

    async function sunucuyaGonder(v) {
      const iptal = new AbortController();
      const zaman = setTimeout(() => iptal.abort(), 12000);
      try {
        const yanit = await fetch(DE.AYAR.formAdresi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
          signal: iptal.signal,
        });
        if (!yanit.ok) throw new Error(String(yanit.status));
      } finally {
        clearTimeout(zaman);
      }
    }

    async function gonderim() {
      if (gonderiliyor) return;
      uyari.hidden = true;

      const hatalar = alanlar.filter((a) => denetle(a));
      if (hatalar.length) {
        uyariGoster(hatalar.length === 1 ? "Bir alanı kontrol edin." : `${hatalar.length} alanı kontrol edin.`);
        hatalar[0].girdi.focus();
        return;
      }

      // Bot tuzağı doluysa gönderme, başarılı gibi davran
      if ($('[name="web"]', form).value) {
        sonucGoster({ ust: "Talebiniz alındı", baslik: "Teşekkürler, sizi arayacağız.", metin: "" });
        return;
      }

      const v = veriTopla();
      mesgul(true);

      if (!DE.AYAR.formAdresi) {
        epostaAc(v);
        await bekle(600);
        mesgul(false);
        sonucGoster({
          ust: "Son adım",
          baslik: "E-posta uygulamanız açıldı",
          metin: `Talebiniz hazır bir e-posta olarak açıldı; Gönder'e bastığınızda bize ulaşır. Uygulama açılmadıysa ${DE.AYAR.telefonGorunen} numarasını arayın ya da ${DE.AYAR.eposta} adresine yazın.`,
        });
        return;
      }

      try {
        await sunucuyaGonder(v);
        mesgul(false);
        sonucGoster({
          ust: "Talebiniz alındı",
          baslik: `Teşekkürler ${v.ad.split(" ")[0]}, sizi arayacağız.`,
          metin: `${v.telefon} numarasından ${DE.AYAR.saatler} arasında arayıp keşif için gün belirleyeceğiz.`,
        });
      } catch {
        mesgul(false);
        const k = uyariGoster(`Talep gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin ya da ${DE.AYAR.telefonGorunen} numarasını arayın.`);
        const tekrar = document.createElement("button");
        tekrar.type = "button";
        tekrar.className = "dugme dugme--ikincil dugme--sm";
        tekrar.textContent = "Tekrar dene";
        tekrar.addEventListener("click", gonderim);
        k.append(tekrar);
        tekrar.focus();
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      gonderim();
    });

    $("[data-form-yeni]").addEventListener("click", () => {
      form.reset();
      alanlar.forEach((a) => alanHatasi(a.alan, ""));
      uyari.hidden = true;
      sonuc.hidden = true;
      form.hidden = false;
      $("input", form).focus();
    });
  })();
})();
