const RESIDENTIAL_COMPLEXES = [
  {
    id: 1,
    name: "Sea Breeze Monaco Residence",
    priceFrom: "239 300",
    location: "Sabunçu r., Nardaran qəs., Sea Breeze",
    deadline: "2029 dekabr",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Mayak Residence",
    priceFrom: "104 500",
    location: "Suraxanı r.",
    deadline: "2025- 2026",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Sea Breeze Reportage Heights",
    priceFrom: "161 300",
    location: "Sabunçu r., Nardaran qəs., Sea Breeze",
    deadline: "May 2030",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Central Towers",
    priceFrom: "314 300",
    location: "Yasamal r. Nizami",
    deadline: "A bloku — təhvil verilib. B və C blokları — 2028-ci il.",
    developer: "SR Development",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop",
  },
];

const AGENCY_LISTINGS = [
  { id: 6147396, price: "153 900", location: "Azadlıq Prospekti m.", rooms: 2, area: 50, floor: "5/5", date: "Bakı, 20 iyul 2026", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop", agency: true },
  { id: 5341996, price: "2 200/ay", location: "Səbail r.", rooms: 2, area: 92, floor: "3/33", date: "Bakı, 15 iyul 2026", image: "https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=400&h=300&fit=crop", agency: true },
  { id: 5532231, price: "669 000", location: "Ağ şəhər q.", rooms: 4, area: 166, floor: "5/8", date: "Bakı, 13 iyul 2026", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", agency: true },
  { id: 6272840, price: "51 000", location: "Xətai r.", rooms: 2, area: 44, floor: "13/13", date: "Bakı, 07 iyul 2026", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", agency: true },
  { id: 6104922, price: "310 000", location: "Neftçilər m.", rooms: 3, area: 112, floor: "2/14", date: "Bakı, 18 iyul 2026", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", agency: true },
  { id: 6277408, price: "305 000", location: "Bakmil m.", rooms: 3, area: 84, floor: "6/18", date: "Bakı, 09 iyul 2026", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", agency: true },
  { id: 6250345, price: "1 200/ay", location: "Nərimanov r.", rooms: 3, area: 125, floor: "12/16", date: "Bakı, 24 iyul 2026", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop", agency: true },
  { id: 6060029, price: "118 000", location: "8 Noyabr m.", rooms: 2, area: 35, floor: "1/5", date: "Bakı, 22 iyul 2026", image: "https://images.unsplash.com/photo-1600047509807-ba8f84d2a705?w=400&h=300&fit=crop", agency: true },
];

const PREMIUM_LISTINGS = [
  { id: 6283911, price: "80/gün", location: "Şamaxı", rooms: 4, area: 80, date: "Şamaxı, bugün 12:43", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop", premium: true },
  { id: 6301515, price: "258 000", location: "Badamdar q.", rooms: 3, area: 102.5, floor: "17/18", date: "Bakı, bugün 12:41", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop", premium: true },
  { id: 4768323, price: "1 200 000", location: "Nardaran q.", rooms: 5, area: 230, date: "Bakı, bugün 12:40", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop", agency: true, premium: true },
  { id: 5624562, price: "900 000", location: "Bilgəh q.", rooms: 6, area: 320, date: "Bakı, bugün 12:40", image: "https://images.unsplash.com/photo-1605276374101-de4c0a9a0b99?w=400&h=300&fit=crop", tags: ["Daxili kredit", "Kompleks"], premium: true },
  { id: 5624596, price: "1 200 000", location: "Bilgəh q.", rooms: 6, area: 440, date: "Bakı, bugün 12:40", image: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&h=300&fit=crop", tags: ["Daxili kredit", "Kompleks"], premium: true },
  { id: 5624579, price: "1 400 000", location: "Bilgəh q.", rooms: 6, area: 450, date: "Bakı, bugün 12:40", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop", tags: ["Daxili kredit", "Kompleks"], premium: true },
  { id: 6275880, price: "250 000", location: "Zabrat q.", area: 75, date: "Bakı, bugün 12:40", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", premium: true },
  { id: 6126849, price: "340 000", location: "Mərdəkan q.", rooms: 5, area: 180, date: "Bakı, bugün 12:40", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", premium: true },
  { id: 6235982, price: "225 000", location: "Əhmədli m.", rooms: 2, area: 68, floor: "12/13", date: "Bakı, bugün 12:39", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop", agency: true, premium: true },
  { id: 6126719, price: "96 000", location: "Görədil q.", area: "8 sot", date: "Bakı, bugün 12:39", image: "https://images.unsplash.com/photo-1600047509807-ba8f84d2a705?w=400&h=300&fit=crop", premium: true },
  { id: 6316838, price: "345 000", location: "Mərdəkan q.", rooms: 4, area: 175, date: "Bakı, bugün 12:39", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop", agency: true, premium: true },
  { id: 6218763, price: "3 900/ay", location: "İnşaatçılar m.", rooms: 10, area: 300, date: "Bakı, bugün 12:38", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", premium: true },
];

const ALL_LISTINGS = [
  ...PREMIUM_LISTINGS,
  { id: 6284645, price: "1 500 000", location: "Nizami m.", rooms: 5, area: 280, floor: "10/12", date: "Bakı, bugün 12:37", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop" },
  { id: 6320125, price: "2 600/ay", location: "Nizami m.", rooms: 3, area: 150, floor: "8/16", date: "Bakı, bugün 12:37", image: "https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=400&h=300&fit=crop", agency: true },
  { id: 6247550, price: "300/gün", location: "Qəbələ", rooms: 7, area: 220, date: "Qəbələ, bugün 12:37", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop" },
  { id: 6222726, price: "146 400", location: "Qusar", rooms: 1, area: 97.6, floor: "2/8", date: "Qusar, bugün 12:37", image: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&h=300&fit=crop", tags: ["Daxili kredit", "Kompleks"] },
  { id: 6254139, price: "295 000", location: "Həzi Aslanov m.", rooms: 3, area: 125, floor: "5/17", date: "Bakı, bugün 12:36", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop" },
  { id: 6222626, price: "175 750", location: "Qusar", rooms: 3, area: 95, floor: "7/9", date: "Qusar, bugün 12:36", image: "https://images.unsplash.com/photo-1605276374101-de4c0a9a0b99?w=400&h=300&fit=crop", tags: ["Daxili kredit", "Kompleks"] },
  { id: 6215994, price: "13 600/ay", location: "İnşaatçılar m.", area: 1200, date: "Bakı, bugün 12:36", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop" },
  { id: 6219997, price: "7 200/ay", location: "İnşaatçılar m.", area: 500, date: "Bakı, bugün 12:35", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop" },
  { id: 6223940, price: "273 350", location: "Qusar", rooms: 3, area: 156.2, floor: "2/9", date: "Qusar, bugün 12:35", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop", tags: ["Daxili kredit", "Kompleks"] },
  { id: 6263990, price: "5 500/ay", location: "Sumqayıt", area: 260, date: "Sumqayıt, bugün 12:34", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop" },
  { id: 5155249, price: "375 000", location: "Badamdar q.", rooms: 7, area: 450, date: "Bakı, bugün 12:34", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop" },
  { id: 4129738, price: "670 000", location: "Şah İsmayıl Xətai m.", rooms: 3, area: 136, floor: "3/8", date: "Bakı, bugün 12:34", image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop", tags: ["Daxili kredit", "Kompleks"] },
];

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
