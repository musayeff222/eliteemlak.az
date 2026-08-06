/* Elan və komplekslər MySQL-dən /api vasitəsilə gəlir */

const POPULAR_SEARCHES = [
  "Sumqayıt kirayə evlər",
  "Sumqayıt alqı-satqı",
  "Lokbatan kirayə evlər",
  "Gəncə kirayə evlər",
  "Zabrat kirayə evlər",
  "Mehdiabad kirayə evlər",
  "Qara Qarayev kirayə",
  "20-ci sahə kirayə",
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

/** id = MySQL listings.category dəyəri */
const CATEGORIES = [
  { id: "apartment", name: "Mənzil", icon: "building-new" },
  { id: "house", name: "Həyət evi/Bağ evi", icon: "house" },
  { id: "office", name: "Ofis", icon: "office" },
  { id: "garage", name: "Qaraj", icon: "garage" },
  { id: "land", name: "Torpaq", icon: "land" },
  { id: "commercial", name: "Obyekt", icon: "commercial" },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));
