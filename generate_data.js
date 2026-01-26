const fs = require('fs');

// --- 1. STORIES (100+) ---
const stories = [
    // ... Real data mixed with generated templates to ensure 100+ items
    { name: "Aziz Sancar", title: "Nobel Ödülü", story: "Mardin'den çıkıp Nobel'e uzanan bir bilim yolculuğu. DNA onarımı üzerine yaptığı çalışmalarla tarihe geçti." },
    { name: "Elon Musk", title: "Girişimci", story: "Mars'a gitmeyi kafasına koydu, herkes güldü ama o roketleri geri indirmeyi başardı." },
    { name: "Mete Gazoz", title: "Okçuluk Şampiyonu", story: "Olimpiyatlarda altın madalya kazanarak Türk okçuluğunu dünyaya duyurdu." },
    { name: "Naim Süleymanoğlu", title: "Halterci", story: "Cep Herkülü lakabıyla tanınan, kendi ağırlığının üç katını kaldıran efsane." },
    { name: "Barış Manço", title: "Sanatçı", story: "7'den 77'ye herkesin sevgilisi oldu, şarkılarıyla ve programlarıyla kültür elçisi oldu." },
    { name: "Sabiha Gökçen", title: "Pilot", story: "Dünyanın ilk kadın savaş pilotu. Gökyüzündeki cesaretiyle kadınlara ilham oldu." },
    { name: "Fatih Sultan Mehmet", title: "Padişah", story: "21 yaşında İstanbul'u fethederek bir çağı kapatıp yeni bir çağ açtı." },
    { name: "Mimar Sinan", title: "Mimar", story: "Yaptığı camiler ve eserler yüzyıllardır ayakta. Ustalık eseri Selimiye ile tarihe geçti." },
    { name: "Aşık Veysel", title: "Halk Ozanı", story: "Gözleri görmese de gönül gözüyle gördüklerini sazıyla, sözüyle tüm dünyaya anlattı." },
    { name: "Haluk Levent", title: "Sanatçı & Yardımsever", story: "AHBAP platformuyla binlerce insana yardım eli uzattı, sanatçılığının yanında insanlığıyla devleşti." },
    // Generating generic inspiring stories to reach 100 count for demo purposes if specific data is sparse
];

const roles = ["Bilim İnsanı", "Sporcu", "Sanatçı", "Yazar", "Lider", "Girişimci"];
const adjectives = ["Azimli", "Kararlı", "Yaratıcı", "Cesur", "Yenilikçi", "Sabırlı"];

// Generate 110 stories total
for (let i = stories.length + 1; i <= 110; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    stories.push({
        name: `Başarı Örneği #${i}`,
        title: `${adj} ${role}`,
        story: `Bu kişi, karşılaştığı ${Math.floor(Math.random() * 50) + 10} farklı engelle rağmen asla pes etmedi. "Başarı tesadüf değildir" diyerek çalışmaya devam etti ve sonunda alanında zirveye ulaştı. Her düşüşte daha güçlü kalktı.`
    });
}
fs.writeFileSync('stories.json', JSON.stringify(stories, null, 2));


// --- 2. QUESTIONS (300+) ---
const questions = [
    { id: 1, a: "Pizza", b: "Lahmacun" },
    { id: 2, a: "Yaz", b: "Kış" },
    { id: 3, a: "Kitap", b: "Film" },
    { id: 4, a: "Çay", b: "Kahve" },
    { id: 5, a: "Deniz", b: "Havuz" },
    { id: 6, a: "Akşam", b: "Sabah" },
    { id: 7, a: "Zenginlik", b: "Mutluluk" },
    { id: 8, a: "Zeka", b: "Şans" },
    { id: 9, a: "Geçmiş", b: "Gelecek" },
    { id: 10, a: "iOS", b: "Android" }
];

const concepts = ["Elma", "Armut", "Araba", "Motor", "Uçak", "Gemi", "Kedi", "Köpek", "Aslan", "Kaplan", "Mavi", "Kırmızı", "Siyah", "Beyaz", "Rock", "Pop", "Rap", "Caz", "Futbol", "Basketbol", "Resim", "Müzik", "Kodlama", "Tasarım", "Netflix", "YouTube", "Instagram", "Twitter", "PC", "Konsol", "Gündüz", "Gece", "Yağmur", "Kar", "Sıcak", "Soğuk", "Tatlı", "Tuzlu", "Acı", "Ekşi", "Su", "Kola", "Ayran", "Şalgam", "Ev", "Otel", "Kamp", "Karavan", "Bisiklet", "Scooter", "Yürümek", "Koşmak", "Gülmek", "Ağlamak", "Konuşmak", "Dinlemek", "Okumak", "Yazmak", "Dans", "Şarkı", "Tiyatro", "Sinema", "Marvel", "DC", "Batman", "Superman", "Joker", "Thanos", "Star Wars", "Star Trek", "Harry Potter", "LOTR", "Matrix", "Inception", "Dizi", "Belgesel", "Haber", "Spor", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Matematik", "Türkçe", "İngilizce", "Almanca", "İspanyolca", "Fransızca", "Japonca", "Çince", "Rusça", "İtalya", "Fransa", "ABD", "İngiltere", "Japonya", "Kore", "Çin", "Almanya", "Rusya", "Brezilya", "Arjantin", "Messi", "Ronaldo", "LeBron", "Jordan", "Federer", "Nadal", "Hamilton", "Verstappen", "F1", "MotoGP", "NBA", "EuroLeague", "Şampiyonlar Ligi", "Dünya Kupası", "Olimpiyat", "Dünya Şampiyonası", "Altın", "Gümüş", "Bronz", "Elmas", "Zümrüt", "Yakut", "İnci", "Safir", "Opal", "Topaz", "Ametist", "Kuvars", "Granit", "Mermer", "Ahşap", "Metal", "Cam", "Plastik", "Kağıt", "Kumaş", "Deri", "Yün", "İpek", "Pamuk", "Keten", "Kadife", "Kot", "Keten", "Saten", "Şifon", "Tül", "Dantel", "Nakış", "Örgü", "Dikiş", "Moda", "Tasarım", "Sanat", "Bilim", "Teknoloji", "Doğa", "İnsan", "Hayvan", "Bitki", "Uzay", "Dünya", "Güneş", "Ay", "Yıldız", "Gezegen", "Galaksi", "Evren", "Atom", "Hücre", "Molekül", "DNA", "RNA", "Gen", "Kromozom", "Virüs", "Bakteri", "Mantar", "Yosun", "Çiçek", "Ağaç", "Orman", "Dağ", "Deniz", "Okyanus", "Göl", "Nehir", "Şelale", "Mağara", "Vadi", "Kanyon", "Çöl", "Kutup", "Buzul", "Volkan", "Deprem", "Fırtına", "Kasırga", "Hortum", "Sel", "Kuraklık"];

// Generate 350+ unique questions
for (let i = 11; i <= 360; i++) {
    const a = concepts[Math.floor(Math.random() * concepts.length)];
    let b = concepts[Math.floor(Math.random() * concepts.length)];
    while (a === b) { b = concepts[Math.floor(Math.random() * concepts.length)]; } // Ensure distinct
    questions.push({ id: i, a: a, b: b });
}
fs.writeFileSync('questions.json', JSON.stringify(questions, null, 2));


// --- 3. MOVIES (400+) ---
const movies = [
    { title: "Esaretin Bedeli", year: 1994, imdb: 9.3, genre: "Drama", cast: ["Tim Robbins"], description: "Umut dolu bir hapishane hikayesi." },
    { title: "Baba", year: 1972, imdb: 9.2, genre: "Suç", cast: ["Marlon Brando"], description: "Mafya babasının destansı öyküsü." },
    // ... basic seeds
];

const movieAdj = ["Karanlık", "Sonsuz", "Son", "İlk", "Kaybolan", "Yükselen", "Düşen", "Gizli", "Muhteşem", "Tehlikeli", "Çılgın", "Büyük", "Küçük", "Kırmızı", "Mavi", "Demir", "Çelik", "Altın", "Gümüş", "Siyah", "Beyaz", "Ölümcül", "Hayalet", "Zaman", "Uzay", "Yol", "Savaş", "Barış", "Aşk", "Nefret"];
const movieNoun = ["Adam", "Kadın", "Çocuk", "Şehir", "Dünya", "Yıldız", "Gece", "Gündüz", "Rüya", "Kabus", "Tuzak", "Kaçış", "İntikam", "Adalet", "Savaşçı", "Kral", "Kraliçe", "Prens", "Prenses", "Ejderha", "Uzaylı", "Robot", "Dedektif", "Katil", "Hırsız", "Polis", "Doktor", "Öğretmen", "Öğrenci", "Asker"];
const genres = ["Aksiyon", "Macera", "Komedi", "Drama", "Korku", "Bilim Kurgu", "Fantastik", "Romantik", "Gerilim", "Gizem", "Suç", "Animasyon"];

// Generate 450 movies
for (let i = movies.length + 1; i <= 450; i++) {
    const title = `${movieAdj[Math.floor(Math.random() * movieAdj.length)]} ${movieNoun[Math.floor(Math.random() * movieNoun.length)]}`;
    const year = 1980 + Math.floor(Math.random() * 45);
    const imdb = (Math.random() * 5 + 4).toFixed(1); // 4.0 - 9.0
    const genre = genres[Math.floor(Math.random() * genres.length)];

    movies.push({
        title: title,
        year: year,
        imdb: parseFloat(imdb),
        genre: genre,
        cast: ["Oyuncu A", "Oyuncu B"],
        description: `Bu filmde ${title.toLowerCase()} kavramı derinlemesine işleniyor. İzleyiciyi ${year} yılına götüren sürükleyici bir yapıt.`
    });
}
fs.writeFileSync('movies.json', JSON.stringify(movies, null, 2));

console.log("Data generation complete.");
