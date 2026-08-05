/* Elan və komplekslər MySQL-dən /api vasitəsilə gəlir */

const POPULAR_SEARCHES = [
  "Sumqayıt kirayə evlər",
  "Sumqayıt alqı-satqı",
  "Lokbatan kirayə evlər",
  "Gəncə kirayə evlər",
  "Zabrat kirayə evlər",
  "Mehdiabad kirayə evlər",
  "Qara Qarayev kirayə",
  "20-ci sahə kirayə evlər",
  "MIDA Yasamal kirayə",
  "Bağ evləri kirayə",
  "Daşınmaz emlak alqı-satqı",
];

const BAKU_DISTRICTS = [
  "Abşeron", "Binəqədi", "Xətai", "Xəzər", "Qaradağ", "Nərimanov",
  "Nəsimi", "Nizami", "Pirallahı", "Sabunçu", "Səbail", "Suraxanı", "Yasamal",
];

const AZERBAIJAN_CITIES = [
  "Ağcabədi", "Ağdam", "Ağdaş", "Ağdərə", "Ağstafa", "Ağsu", "Astara",
  "Balakən", "Beyləqan", "Bərdə", "Biləsuvar", "Cəbrayıl", "Cəlilabad",
  "Daşkəsən", "Füzuli", "Gədəbəy", "Goranboy", "Göyçay", "Göygöl", "Göytəpə",
  "Hacıqabul", "Xankəndi", "Xızı", "Xocalı", "Xocavənd", "Xudat", "İmişli",
  "Kəlbəcər", "Kürdəmir", "Qazax", "Qobustan", "Qubadlı", "Laçın", "Lerik",
  "Masallı", "Mingəçevir", "Naftalan", "Naxçıvan", "Naxçıvan MR", "Neftçala",
  "Oğuz", "Saatlı", "Sabirabad", "Salyan", "Samux", "Siyəzən", "Şabran",
  "Şəki", "Şəmkir", "Şirvan", "Şuşa", "Tərtər", "Tovuz", "Ucar", "Yardımlı",
  "Yevlax", "Zaqatala", "Zəngilan", "Zərdab",
];

const CATEGORIES = [
  { name: "Yeni tikili", icon: "building-new" },
  { name: "Köhnə tikili", icon: "building-old" },
  { name: "Həyət evi/Bağ evi", icon: "house" },
  { name: "Ofis", icon: "office" },
  { name: "Qaraj", icon: "garage" },
  { name: "Torpaq", icon: "land" },
  { name: "Obyekt", icon: "commercial" },
];
