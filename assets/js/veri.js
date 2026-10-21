/*
 * Sayfanın içeriği. Metin, model ve ayar değişiklikleri buradan yapılır.
 *
 * Model değerleri rf-paper.com/tr ürün sayfalarından alındı (21.10.2026).
 * mm ölçüleri etiket çiziminde de kullanılıyor: g/y gövde, eg/ey ekran.
 */
window.DE = window.DE || {};

DE.AYAR = {
  telefon: "+90 224 233 33 22",
  telefonGorunen: "0 (224) 233 33 22",
  eposta: "destek@aykatech.com",
  adres: "Kükürtlü Mah. Emirabdülkadir Cd. No:25/A, Osmangazi / Bursa",
  saatler: "Pazartesi–Cuma 09:00–18:00",
  // Form için sunucu adresi. Boş kaldıkça form e-posta uygulamasını açar.
  formAdresi: "",
};

const STANDART = {
  renk: "Siyah / Beyaz / Kırmızı / Sarı",
  sicaklik: "0 – 40 °C",
  frekans: "2.4 GHz",
  uzaklik: "13 – 15 m",
  led: "3 renk, ayarlanabilir",
};

DE.MODELLER = [
  { id: "154", ad: '1.54"', kod: "RFE11.0154", g: 49, y: 37.6, k: 13, eg: 27.51, ey: 27.51, agirlik: 20, cozunurluk: "200 × 200", dpi: 188, pil: "1 × CR2450", omur: "≥ 3 yıl", grup: "standart",
    yer: "Kozmetik ve eczane rafı, küçük ambalajlı ürünler, dar raf önleri." },
  { id: "213", ad: '2.13"', kod: "RFE11.0213", g: 71.3, y: 35.6, k: 12, eg: 48.55, ey: 23.71, agirlik: 32, cozunurluk: "250 × 122", dpi: 130, pil: "2 × CR2450", omur: "≥ 6 yıl", grup: "standart",
    yer: "Market rafının standart etiketi. Ürün adı, fiyat ve birim fiyat sığar." },
  { id: "266", ad: '2.66"', kod: "RFE11.0266", g: 85.8, y: 41.8, k: 12, eg: 60.09, ey: 30.7, agirlik: 38, cozunurluk: "296 × 152", dpi: 125, pil: "2 × CR2450", omur: "≥ 6 yıl", grup: "standart",
    yer: "Fiyatın uzaktan okunması gereken alt ve üst raflar." },
  { id: "290", ad: '2.90"', kod: "RFE11.0290", g: 91.2, y: 41, k: 12, eg: 66.9, ey: 29.06, agirlik: 40, cozunurluk: "296 × 128", dpi: 112, pil: "2 × CR2450", omur: "≥ 6 yıl", grup: "standart",
    yer: "Barkod, menşe ve kampanya bilgisini aynı anda göstermek isteyen market rafları." },
  { id: "350", ad: '3.50"', kod: "RFE11.0350", g: 100.05, y: 48.5, k: 12, eg: 79.68, ey: 38, agirlik: 47, cozunurluk: "384 × 184", dpi: 122, pil: "2 × CR2450", omur: "≥ 6 yıl", grup: "standart",
    yer: "Manav ve şarküteri: kg fiyatı büyük, künye ve menşe bilgisi altta." },
  { id: "420", ad: '4.20"', kod: "RFE11.0420", g: 99.2, y: 89, k: 12, eg: 84.8, ey: 63.6, agirlik: 75, cozunurluk: "400 × 300", dpi: 119, pil: "3 × CR2450", omur: "≥ 6 yıl", grup: "standart",
    yer: "Reyon başı, kampanya ürünü, teknoloji ve beyaz eşya ürün kartı." },
  { id: "580", ad: '5.80"', kod: "RFE11.0580", g: 134.5, y: 114, k: 9, eg: 118.78, ey: 88.2, agirlik: 135, cozunurluk: "648 × 480", dpi: 138, pil: "6 × CR2450", omur: "≥ 6 yıl", grup: "standart",
    yer: "Büyük ürünler, masaüstü stant, otel ve kafe vitrin bilgisi." },
  { id: "750", ad: '7.50"', kod: "RFE11.0750", g: 178, y: 127, k: 9, eg: 163.2, ey: 97.92, agirlik: 188, cozunurluk: "800 × 480", dpi: 124, pil: "6 × CR2450", omur: "≥ 6 yıl", grup: "standart",
    yer: "Reyon tabelası, kampanya panosu, toplantı odası ve kapı bilgisi." },

  { id: "213e", ad: '2.13" eksi derece', kisa: '2.13" −°C', kod: "RFE03.0213", g: 71.3, y: 35.6, k: 12, eg: 48.55, ey: 23.71, agirlik: 32, cozunurluk: "250 × 122", dpi: 130, pil: "2 × CR2450", omur: "≥ 6 yıl", grup: "ozel",
    renk: "Siyah / Beyaz", sicaklik: "−25 – 15 °C", nfc: "Opsiyonel",
    yer: "Dondurucu ve derin soğutucu dolapları." },
  { id: "290e", ad: '2.90" eksi derece', kisa: '2.90" −°C', kod: "RFE03.0290", g: 91.2, y: 41, k: 12, eg: 66.9, ey: 29.06, agirlik: 40, cozunurluk: "296 × 128", dpi: 112, pil: "2 × CR2450", omur: "≥ 6 yıl", grup: "ozel",
    renk: "Siyah / Beyaz", sicaklik: "−25 – 15 °C", nfc: "Opsiyonel",
    yer: "Dondurulmuş gıda reyonu, et ve balık dolapları." },
  { id: "420s", ad: '4.20" su geçirmez', kisa: '4.20" su geç.', kod: "RFE04.0420", g: 99.2, y: 89, k: 12, eg: 84.8, ey: 63.6, agirlik: 75, cozunurluk: "400 × 300", dpi: 119, pil: "3 × CR2450", omur: "≥ 6 yıl", grup: "ozel",
    renk: "Siyah / Beyaz / Kırmızı", nfc: "Opsiyonel",
    yer: "Sulanan manav tezgâhı, buzlu balık reyonu, yıkanan alanlar." },
].map((m) => ({ ...STANDART, ...m }));

DE.model = (id) => DE.MODELLER.find((m) => m.id === id);

/*
 * Örnek ürünler. Fiyatlar örnektir. Barkodlar 20 ile başlar: GS1'de
 * 20-29 aralığı mağaza içi kullanıma ayrılmıştır, gerçek bir ürünle çakışmaz.
 * miktar + birim: birim fiyat hesabı için (5 L yağ → L fiyatı).
 */
DE.URUNLER = {
  yag:     { urun: "Ayçiçek Yağı 5 L", fiyat: 449.9, miktar: 5, birim: "L", mense: "Türkiye" },
  bal:     { urun: "Süzme Çiçek Balı 850 g", fiyat: 389.9, miktar: 0.85, birim: "kg", mense: "Türkiye" },
  kahve:   { urun: "Filtre Kahve 500 g", fiyat: 329.9, miktar: 0.5, birim: "kg", mense: "Brezilya" },
  makarna: { urun: "Burgu Makarna 500 g", fiyat: 24.5, miktar: 0.5, birim: "kg", mense: "Türkiye" },
  sut:     { urun: "Günlük Süt 1 L", fiyat: 42.75, miktar: 1, birim: "L", mense: "Türkiye" },
  domates: { urun: "Domates", fiyat: 39.9, miktar: 1, birim: "kg", tartili: true, mense: "Antalya", kunye: "Künye 2610 0325 1345" },
  kiyma:   { urun: "Dana Kıyma", fiyat: 749, miktar: 1, birim: "kg", tartili: true, mense: "Türkiye" },
  dondurma:{ urun: "Kakaolu Dondurma 1,5 L", fiyat: 189.9, miktar: 1.5, birim: "L", mense: "Türkiye" },
  kofte:   { urun: "Donuk Kasap Köfte 1 kg", fiyat: 459.9, miktar: 1, birim: "kg", mense: "Türkiye" },
  krem:    { urun: "Güneş Kremi SPF 50 50 ml", fiyat: 549, miktar: 0.05, birim: "L", mense: "Fransa" },
  makine:  { urun: "Bulaşık Makinesi 5 Programlı", fiyat: 24999, miktar: 1, birim: "adet", mense: "Türkiye", not: "12 aya varan taksit" },
  vida:    { urun: "Sunta Vidası 4 × 40 mm, 100 adet", fiyat: 89.9, miktar: 100, birim: "adet", mense: "Türkiye" },
  corba:   { urun: "Mercimek Çorbası", fiyat: 120, miktar: 1, birim: "porsiyon", bilgi: "Öğle menüsü", not: "Gluten içerir", barkod: false },
};

/* Açılıştaki raf: her adımda bir etiket yeni fiyata geçer */
DE.RAF = {
  etiketler: [
    { model: "290", urun: "yag" },
    { model: "213", urun: "makarna" },
    { model: "266", urun: "sut" },
    { model: "290", urun: "kahve" },
  ],
  // [etiket sırası, yeni fiyat, indirimli mi]
  adimlar: [
    [0, 419.9, true],
    [3, 344.9, false],
    [1, 21.9, true],
    [2, 44.9, false],
    [0, 449.9, false],
    [3, 309.9, true],
    [1, 24.5, false],
    [2, 39.9, true],
    [3, 329.9, false],
    [2, 42.75, false],
  ],
};

/* Deneme alanındaki ürünler */
DE.DENEME = ["bal", "sut", "kahve"];

/* Katalogda her boyutta gösterilecek ürün */
DE.KATALOG_URUN = {
  "154": "krem", "213": "makarna", "266": "sut", "290": "yag", "350": "domates",
  "420": "bal", "580": "makine", "750": "corba", "213e": "dondurma", "290e": "kofte", "420s": "domates",
};

DE.SEKTORLER = [
  {
    id: "market", ad: "Süpermarket", model: "290", urun: "yag", indirim: 399.9,
    metin: "Enflasyon döneminde aynı ürünün fiyatı ayda birkaç kez değişebiliyor. Fiyat ERP'de değiştiğinde RF-Paper yazılımı bunu algılar ve raftaki etiketi günceller. Hafta sonu kampanyası için cuma akşamı yüzlerce etiket basılmaz.",
    oneri: ['2.13"', '2.90"', '4.20" reyon başı'],
  },
  {
    id: "manav", ad: "Manav", model: "350", urun: "domates",
    metin: "Meyve ve sebzede kg fiyatı büyük yazılır, menşe ve künye bilgisi altta durur. RF-Paper'ın HKS entegrasyonu Hal Kayıt Sistemi'ndeki künye bilgisini etikete aktarır. Sulanan tezgâhlar için 4.20\" su geçirmez model var.",
    oneri: ['3.50"', '4.20" su geçirmez'],
  },
  {
    id: "kasap", ad: "Kasap ve şarküteri", model: "290e", urun: "kofte",
    metin: "Standart etiketler 0 ile 40 °C arasında çalışır. Dondurucu ve derin soğutucu için eksi derece modelleri −25 °C'ye kadar dayanır; ekranları siyah/beyazdır. Soğuk dolaba ve tezgâha göre ayrı model seçilir.",
    oneri: ['2.13" eksi derece', '2.90" eksi derece'],
  },
  {
    id: "eczane", ad: "Eczane ve kozmetik", model: "154", urun: "krem",
    metin: "Raf önleri dar, ambalajlar küçük. 1.54\" etiket ürünün önünü kapatmadan fiyatı ve birim fiyatı gösterir. Masaüstü stant ve raf klipsi ile cam raflara da takılır.",
    oneri: ['1.54"', '2.13"'],
  },
  {
    id: "teknoloji", ad: "Beyaz eşya ve teknoloji", model: "420", urun: "makine",
    metin: "Ürün başına gösterilecek bilgi çok: model, taksit, kampanya. Büyük ekranlarda fiyatın yanına QR kod eklenip ürün sayfasına yönlendirme yapılabilir.",
    oneri: ['4.20"', '5.80"'],
  },
  {
    id: "yapi", ad: "Yapı market", model: "290", urun: "vida",
    metin: "Aynı reyonda yüzlerce küçük kalem var. Etiketlerin üç renkli LED'i yazılımdan yakılabilir, rengi ve yanıp sönmesi ayarlanabilir. Personel aranan ürünün rafını ışıktan bulur.",
    oneri: ['2.13"', '2.90"'],
  },
  {
    id: "otel", ad: "Otel ve kafe", model: "580", urun: "corba",
    metin: "Açık büfede yemek adı, alerjen bilgisi ve fiyat; menü değiştiğinde etiket yazdırılmaz. Masaüstü stantla vitrine, askıyla duvara takılır.",
    oneri: ['4.20"', '5.80"', '7.50"'],
  },
];
