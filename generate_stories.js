const fs = require('fs');

const stories = [
    {
        "name": "Aziz Sancar",
        "title": "Nobel Ödüllü Bilim İnsanı",
        "story": "Mardin’in Savur ilçesinde, okuma yazma bilmeyen bir anne ve çiftçi bir babanın çocuğu olarak dünyaya geldi. İmkansızlıklar içinde büyüdü ama merakı hiç bitmedi. Tıp fakültesini birincilikle bitirdi, yetinmedi, Amerika'ya gitti. Yıllarca laboratuvarlarda gün ışığı görmeden çalıştı. DNA'nın kendini nasıl onardığını keşfettiğinde dünya bilim tarihini değiştirdi. 2015'te Nobel Kimya Ödülü'nü alırken 'Bu ödülü Atatürk'e ve Cumhuriyet'e borçluyum' diyerek tevazu gösterdi. Başarısının sırrını 'Zeka değil, çalışmak' olarak tanımladı."
    },
    {
        "name": "Elon Musk",
        "title": "Vizyoner Girişimci",
        "story": "Güney Afrika'da doğduğunda içine kapanık bir çocuktu, okulda zorbalığa uğradı. Kendi kendine kodlamayı öğrendi. Amerika'ya beş parasız gitti. PayPal'ı kurdu, sattı, tüm servetini uzay hayallerine yatırdı. Herkes 'Elektrikli araba satmaz' derken Tesla'yı, 'Roketler geri konmaz' derken SpaceX'i kurdu. Üç kez iflasın eşiğine geldi, roketleri havada patladı ama vazgeçmedi. Bugün dünyanın en zengin insanı olmasının ötesinde, insanlığı çok gezegenli bir tür yapma hayalinin peşinde koşan bir mühendis."
    },
    {
        "name": "Mete Gazoz",
        "title": "Olimpiyat Şampiyonu",
        "story": "Çok küçük yaşlarda omuzlarını geliştirmek için yüzmeye, vücut koordinasyonu için piyanoya gönderildi. Hayatı bir proje gibi planlandı ama o bu projeyi tutkuya dönüştürdü. 'Ben Olimpiyat Şampiyonu olacağım' dediğinde henüz çocuktu. 2020 Tokyo Olimpiyatları'nda o son oku atarken tüm Türkiye nefesini tuttu. Altın madalyayı boynuna taktığında sadece bir sporcu değil, 'Gazoz olma, efsane ol' diyen bir sembol haline geldi. Gülüşü ve selamıyla gönülleri fethetti."
    },
    {
        "name": "Naim Süleymanoğlu",
        "title": "Cep Herkülü",
        "story": "Bulgaristan'da Türklere yapılan zulme sessiz kalmadı. 1986'da Avustralya'da iltica ederek Türkiye'ye kaçtı. Boyu kısaydı ama yüreği devasa idi. Kendi ağırlığının üç katından fazlasını kaldırarak insan sınırlarını zorladı. Seul Olimpiyatları'nda 6 dünya rekoru kırdı. Time dergisine kapak oldu. Halteri dünyada popüler hale getirdi. Spordaki başarısının yanı sıra, Bulgaristan Türklerinin sesi soluğu oldu."
    },
    {
        "name": "Barış Manço",
        "title": "Modern Ozan",
        "story": "Sadece şarkı söylemedi, bir nesli eğitti. 'Adam Olacak Çocuk' ile milyonlarca çocuğa özgüven aşıladı. Dünyayı gezdi, Japonya'dan Ekvator'a Türk kültürünü tanıttı. Şarkılarında hep bir ders, hep bir erdem vardı. 'Dönence' ile düşündürdü, 'Gülpembe' ile hüzünlendirdi. Öldüğünde arkasında sadece şarkılar değil, onu 'Barış Ağabey' olarak seven milyonlarca insan bıraktı. O, modern çağın Dede Korkut'uydu."
    },
    {
        "name": "Sabiha Gökçen",
        "title": "Göklerin Kızı",
        "story": "Küçük yaşta ailesini kaybetti ama kaderi Atatürk ile tanışınca değişti. 'Gökçen' soyadını henüz havacılıkla ilgisi yokken aldı. Dünyanın ilk kadın savaş pilotu olmak için erkeklerin bile zorlandığı eğitimlerden geçti. Dersim harekatına katıldı, Balkan turuna çıktı. Kadının toplumdaki yerini sadece sözle değil, gökyüzündeki cesaretiyle kanıtladı. Bugün adını taşıyan havalimanından her gün binlerce uçak kalkıyor."
    },
    {
        "name": "Fatih Sultan Mehmet",
        "title": "Çağ Açan Hükümdar",
        "story": "Şehzadeyken çoklu dil öğrendi, mühendislik, tarih ve felsefe çalıştı. 21 yaşında tahta çıktığında tek bir hedefi vardı: Konstantinopolis. 'Ya ben İstanbul'u alırım, ya İstanbul beni' dedi. Gemileri karadan yürütecek kadar çılgın, devasa topları döktürecek kadar mühendisti. 53 günlük kuşatmanın sonunda İstanbul'u fethetti ve Orta Çağ'ı kapatıp Yeni Çağ'ı başlattı. Fetihten sonra şehri yağmalatmadı, her inançtan insana özgürlük tanıdı."
    },
    {
        "name": "Mimar Sinan",
        "title": "Koca Sinan",
        "story": "Yeniçeri ocağında yetişti, marangozluğu ve yapıcılığı orduda öğrendi. 50 yaşından sonra baş mimar oldu. 'Çıraklık eserim' dediği Şehzadebaşı, 'Kalfalık eserim' dediği Süleymaniye ve 'Ustalık eserim' dediği Selimiye ile Osmanlı mimarisini zirveye taşıdı. 99 yaşında bile pergel elindeydi. Eserlerinde matematiksel deha ile estetiği birleştirdi. Yaptığı camiler yüzyıllardır depremlere meydan okuyor."
    },
    {
        "name": "Cahit Arf",
        "title": "Matematik Dehası",
        "story": "Matematiği bir oyun gibi gördü. 'Matematik de resim, müzik ve heykel gibi bir sanattır' derdi. Kendi adıyla anılan 'Arf Değişmezi' (Arf Invariant) teoremiyle dünya matematik literatürüne girdi. 10 Türk Lirası'nın arkasındaki o formüllerin sahibi. Zor koşullarda bile bilimin peşinden gitmenin, merak etmenin ve sorgulamanın en güzel örneği oldu."
    },
    {
        "name": "Aşık Veysel",
        "title": "Gönül Gözü",
        "story": "7 yaşında çiçek hastalığı yüzünden iki gözünü de kaybetti. Ama o karanlığa küsmedi. Babasının aldığı sazla derdini, sevincini, toprağa olan aşkını anlattı. 'Benim sadık yarim kara topraktır' dedi. Köy Enstitülerinde saz hocalığı yaptı. Gözleri görmüyordu ama çoğu görenden daha iyi görüyordu hayatın gerçeğini. UNESCO tarafından 2023 yılı 'Aşık Veysel Yılı' ilan edildi."
    },
    {
        "name": "Albert Einstein",
        "title": "Fizik Dehası",
        "story": "Konuşmaya geç başladı, okulda 'ağırkanlı' sanıldı. Ama zihni evrenin sırlarıyla doluydu. Patent ofisinde memur olarak çalışırken, boş zamanlarında yazdığı makalelerle fiziği altüst etti. İzafiyet Teorisi ile zamanın ve mekanın mutlak olmadığını kanıtladı. Merakını hiç kaybetmedi. 'Hayal gücü bilgiden daha önemlidir' sözüyle, başarının sadece ezber olmadığını kanıtladı."
    },
    {
        "name": "Nikola Tesla",
        "title": "Yıldırımların Efendisi",
        "story": "Bugün kullandığımız elektriğin, radyonun, uzaktan kumandanın ve daha nice teknolojinin babası. Hayatı boyunca haksızlıklara uğradı, patentleri çalındı, beş parasız otel odalarında yaşadı ama insanlığa hizmetten vazgeçmedi. 'Bırakın gelecek gerçeği söylesin, herkesin eseri ve başarısı kendisine aittir' dedi. Zaman onun haklı olduğunu kanıtladı."
    },
    {
        "name": "Muhammed Ali",
        "title": "Efsane Boksör",
        "story": "Sadece ringlerin değil, gönüllerin de şampiyonuydu. 'Kelebek gibi uçarım, arı gibi sokarım' dedi. Vietnam savaşına gitmeyi reddettiği için lisansı elinden alındı, en verimli yıllarında bokstan uzak kaldı. Ama o duruşundan taviz vermedi. Geri döndüğünde tekrar şampiyon oldu. Parkinson hastalığıyla mücadelesiyle de örnek oldu."
    },
    {
        "name": "Marie Curie",
        "title": "Bilimin Kraliçesi",
        "story": "Radyoaktivite üzerine yaptığı çalışmalarla iki farklı dalda (Fizik ve Kimya) Nobel Ödülü alan ilk ve tek insan. Radyasyona maruz kalarak hayatını bilime feda etti. Kadınların bilimde yer almasının önünü açtı. Ceplerinde radyoaktif tüplerle dolaşacak kadar işine aşıktı."
    },
    {
        "name": "Steve Jobs",
        "title": "Teknoloji Vizyoneri",
        "story": "Kendi kurduğu Apple şirketinden kovuldu. Pes etmek yerine NeXT ve Pixar'ı kurdu. Geri döndüğünde şirketi iflastan kurtarıp dünyanın en değerlisi yaptı. iPhone ile dünyayı değiştirdi. 'Aç kal, budala kal' diyerek her zaman yeniliğin peşinde koşmayı öğütledi."
    },
    {
        "name": "Michael Jordan",
        "title": "Majesteleri",
        "story": "Lise basketbol takımından 'yetersiz' denilerek çıkarıldı. O gün eve gidip saatlerce ağladı ama sonra çalışmaya başladı. Kariyeri boyunca 9000'den fazla şut kaçırdı, 300'e yakın maç kaybetti. Ama asla pes etmedi. 6 NBA şampiyonluğu ile tarihin en iyisi oldu. 'Ben başarısız olduğum için başardım' dedi."
    },
    {
        "name": "Kobe Bryant",
        "title": "Black Mamba",
        "story": "'Mamba Mantalitesi'nin yaratıcısı. Antrenmanlara herkesten önce gelir, herkesten sonra çıkardı. Sakat parmakla, kopuk aşil tendonuyla oynadı. Kazanma hırsı ve çalışma disipliniyle sadece basketbolda değil, hayatın her alanında bir ikon oldu. Oscar ödüllü bir hikaye anlatıcısıydı."
    },
    {
        "name": "Lionel Messi",
        "title": "Futbolun Büyücüsü",
        "story": "Çocukken büyüme hormonu yetersizliği teşhisi kondu. Kulüpler tedavisini karşılamak istemedi. Barcelona ona sahip çıktı. Küçük fiziğine rağmen yeteneğiyle devleşti. Dünya Kupası'nı kazanana kadar milli takımda çok eleştirildi ama sonunda en büyük hayaline ulaştı."
    },
    {
        "name": "Cristiano Ronaldo",
        "title": "Disiplin Abidesi",
        "story": "Fakir bir ailenin çocuğu olarak Madeira'da doğdu. Kalbindeki sorun yüzünden futbolu bırakabilirdi ama ameliyat olup geri döndü. Yetenekten çok çalışmaya inandı. 30'lu yaşlarında bile 20 yaşındaki bir sporcunun fiziğine sahip olması tesadüf değildi."
    },
    {
        "name": "Oprah Winfrey",
        "title": "Medya Kraliçesi",
        "story": "Yoksulluk ve tacizle dolu zor bir çocukluk geçirdi. 'Televizyon için uygun değil' denilerek işten atıldı. Ama o kendi talk show'unu kurarak Amerika'nın en etkili kadını oldu. Kendi hikayesini anlatarak milyonlara umut verdi."
    },
    {
        "name": "J.K. Rowling",
        "title": "Harry Potter'ın Annesi",
        "story": "Boşanmış, işsiz ve depresyonda bir bekar anneyken Harry Potter'ı yazdı. Kitabı 12 yayınevi tarafından reddedildi. Pes etmedi. Bugün dünyanın en çok okunan yazarlarından biri. Bir tren yolculuğunda kurduğu hayal, tüm dünyayı sardı."
    },
    {
        "name": "Walt Disney",
        "title": "Hayal Mimarı",
        "story": "'Hayal gücü yok' denilerek gazeteden kovuldu. İlk şirketi iflas etti. Yarattığı Mickey Mouse karakteri ile bir imparatorluk kurdu. Disneyland'ı açtığında herkes ona deli gözüyle bakıyordu. O, imkansızın sadece bir kelime olduğunu kanıtladı."
    },
    {
        "name": "Thomas Edison",
        "title": "Ampulün Mucidi",
        "story": "Ampulü bulana kadar 1000'den fazla başarısız deney yaptı. 'Başarısız olmadım, sadece işe yaramayan 1000 yol buldum' dedi. Okulda öğretmenleri onun 'algısı yavaş' olduğunu söylemişti. Annesi tarafından evde eğitildi."
    },
    {
        "name": "Stephen Hawking",
        "title": "Kozmosun Sesi",
        "story": "21 yaşında ALS teşhisi kondu ve birkaç yıl ömür biçildi. O ise tekerlekli sandalyeye hapsolmuş bedenine inat, zihniyle evrenin sınırlarında dolaştı. Konuşma yetisini kaybetti ama yazdığı kitaplarla bilimi milyonlara sevdirdi."
    },
    {
        "name": "Vincent van Gogh",
        "title": "Yıldızlı Gece",
        "story": "Hayatı boyunca sadece bir tablo satabildi. Yoksulluk ve ruhsal sorunlarla boğuştu. Ama içindeki renkleri tuvale dökmekten vazgeçmedi. Bugün eserleri paha biçilemez. Tutkunun ve acının en büyük ressamı."
    },
    {
        "name": "Ludwig van Beethoven",
        "title": "Sessizliğin Müziği",
        "story": "Bir besteci için en büyük kabusu yaşadı: Sağır oldu. Ama en büyük eserlerini (9. Senfoni dahil) hiç duymadan besteledi. Müziği kulağıyla değil, ruhuyla duydu."
    },
    {
        "name": "Serena Williams",
        "title": "Tenisin Kraliçesi",
        "story": "Compton'ın zorlu sokaklarından çıkıp tenis kortlarının zirvesine oturdu. Irkçılıkla, sakatlıklarla, hamilelik sonrası zorluklarla mücadele etti. 23 Grand Slam şampiyonluğu ile tarihin en iyilerinden biri oldu."
    },
    {
        "name": "Usain Bolt",
        "title": "Rüzgarın Oğlu",
        "story": "Skolyoz (omurga eğriliği) hastası olmasına rağmen dünyanın en hızlı adamı oldu. Antrenmanları sevmezdi ama yarış pistinde şov yapmaya bayılırdı. 100 metre ve 200 metre rekorları hala kırılamadı."
    },
    {
        "name": "Jack Ma",
        "title": "Alibaba'nın Kurucusu",
        "story": "Üniversite sınavında defalarca başarısız oldu. KFC iş başvurusunda 24 kişiden reddedilen tek kişiydi. İnternetle tanıştığında bilgisayardan anlamıyordu. Ama vizyonuyla Çin'in en büyük e-ticaret devini kurdu."
    },
    {
        "name": "Nelson Mandela",
        "title": "Özgürlük Savaşçısı",
        "story": "Apartheid rejimine karşı savaştığı için 27 yıl hapiste kaldı. Çıktığında intikam peşinde koşmadı, barış ve kardeşlik mesajları verdi. Güney Afrika'nın ilk siyah başkanı oldu."
    },
    {
        "name": "Leonardo da Vinci",
        "title": "Hazerfen",
        "story": "Ressam, mühendis, anatomist, mucit... Mona Lisa'yı yaparken aynı zamanda uçan makineler tasarlıyordu. Merakı sınır tanımıyordu. Not defterlerine yazdığı fikirler yüzyıllar sonra hayata geçirildi."
    },
    {
        "name": "Wolfgang Amadeus Mozart",
        "title": "Harika Çocuk",
        "story": "5 yaşında beste yapmaya başladı. Kısa ömrüne 600'den fazla eser sığdırdı. Müzik tarihinin en büyük dâhilerinden biri olarak kabul edilir. Yeteneği Tanrı vergisiydi ama çalışması insanüstüydü."
    },
    {
        "name": "Frida Kahlo",
        "title": "Acının Ressamı",
        "story": "Çocuk felci geçirdi, gençliğinde feci bir trafik kazası yaşadı. Yatağa bağlı kaldığı aylarda aynaya bakarak otoportreler yaptı. 'Kendi gerçeğimi çiziyorum' dedi. Meksika kültürünü ve kendi acılarını sanatına yansıttı."
    },
    {
        "name": "Piri Reis",
        "title": "Denizlerin Piri",
        "story": "Çizdiği Dünya Haritası, o dönemin teknolojisiyle açıklanamayacak kadar detaylıydı. Amerika kıtasını henüz keşfedilmeden (veya yeni keşfedildiği sıralarda) haritasına işledi. Denizcilik tarihinin en büyük gizemlerinden ve ustalarından biri."
    },
    {
        "name": "Galileo Galilei",
        "title": "Modern Bilimin Babası",
        "story": "'Dünya dönüyor' dediği için engizisyon mahkemesinde yargılandı, ev hapsine mahkum edildi. Ama bilimsel gerçekten vazgeçmedi. Teleskopla gökyüzünü inceleyerek evren anlayışımızı değiştirdi."
    },
    {
        "name": "Babe Ruth",
        "title": "Home Run Kralı",
        "story": "Beyzbolun en büyük efsanesi. Hem atıcı hem de vurucu olarak kırdığı rekorlar yıllarca geçilemedi. Sporu Amerika'da bir tutku haline getiren isim oldu."
    },
    {
        "name": "Pele",
        "title": "Siyah İnci",
        "story": "Brezilya'nın fakir sokaklarında top yerine çorap yuvarlayarak büyüdü. 17 yaşında Dünya Kupası'nı kaldırdı. 1000'den fazla gol attı. Futbolun kralı olarak tarihe geçti."
    },
    {
        "name": "Diego Maradona",
        "title": "Altın Çocuk",
        "story": "Arjantin'in gecekondu mahallesinden çıktı. Top tekniği insanüstüydü. 1986 Dünya Kupası'nda İngiltere'ye attığı iki gol (biri elle, biri yüzyılın golü) hayatının özeti gibiydi: Hem asi hem dahi."
    },
    {
        "name": "Rosa Parks",
        "title": "Sivil Haklar Annesi",
        "story": "Bir otobüste beyaz bir yolcuya yer vermeyi reddederek bir devrimi ateşledi. O günkü 'Hayır' deyişi, Amerika'daki ırk ayrımcılığına karşı mücadelenin sembolü oldu."
    },
    {
        "name": "Mahatma Gandhi",
        "title": "Yüce Ruh",
        "story": "Şiddetsiz direniş felsefesiyle Hindistan'ı İngiliz sömürgesinden kurtardı. Tuz Yürüyüşü ile milyonları peşinden sürükledi. Basit bir giysi ve bir asa ile dünyaya kafa tuttu."
    },
    {
        "name": "Abraham Lincoln",
        "title": "Köleliği Bitiren Başkan",
        "story": "Defalarca seçim kaybetti, iş hayatında başarısız oldu. Ama Amerika'nın en zor döneminde, İç Savaş'ta ülkeyi bir arada tuttu ve köleliği kaldırdı. Suikaste kurban gitse de mirası yaşıyor."
    },
    {
        "name": "Winston Churchill",
        "title": "İngiliz Aslanı",
        "story": "Okulda başarısızdı, kekemeydi. Ama II. Dünya Savaşı'nda hitabeti ve kararlılığıyla İngiltere'yi ve dünyayı Nazizme karşı direnişte tuttu. 'Asla, asla, asla vazgeçmeyin' sözüyle tarihe geçti."
    },
    {
        "name": "İbni Sina",
        "title": "Hekimlerin Piri",
        "story": "Batı'da Avicenna olarak bilinir. Yazdığı 'El-Kanun fi't-Tıb' kitabı Avrupa üniversitelerinde 600 yıl boyunca ders kitabı olarak okutuldu. Tıbbın yanı sıra felsefe ve astronomide de devleşti."
    },
    {
        "name": "Farabi",
        "title": "Muallim-i Sani",
        "story": "Aristo'dan sonra 'İkinci Öğretmen' olarak anılır. Müzik notalarını kağıda döken, sesin fiziksel açıklamasını yapan ilk bilginlerden. İslam felsefesinin temel taşlarını döşedi."
    },
    {
        "name": "Halide Edip Adıvar",
        "title": "Ateşten Gömlek",
        "story": "Kurtuluş Savaşı'nda cephede onbaşı rütbesiyle görev aldı. Sultanahmet Mitingi'ndeki konuşmasıyla İstanbul halkını işgale karşı direnişe çağırdı. Kalemiyle ve cesaretiyle Türk kadınının simgesi oldu."
    },
    {
        "name": "Kara Fatma",
        "title": "Milli Mücadele Kahramanı",
        "story": "Kocası şehit olduktan sonra kendi müfrezesini kurdu. Sakarya Meydan Muharebesi'ne katıldı. Yakalandı, kaçtı, tekrar savaştı. Üsteğmen rütbesiyle emekli oldu, maaşını Kızılay'a bağışladı."
    },
    {
        "name": "Seyit Onbaşı",
        "title": "Çanakkale Kahramanı",
        "story": "Çanakkale Savaşı'nda vinci bozulan topun 215 kiloluk mermisini sırtlayıp namluya sürdü. Attığı mermi İngiliz zırhlısı Ocean'ı batırdı. 'İman gücüyle kaldırdım' dedi, savaştan sonra köyüne dönüp mütevazı hayatına devam etti."
    },
    {
        "name": "Nene Hatun",
        "title": "Aziziye Müdafisi",
        "story": "93 Harbi'nde Erzurum'da tabyaların düştüğü haberi gelince bebeğini beşiğinde bırakıp eline satırı alarak cepheye koştu. 'Bebem anasız büyür de vatansız büyümez' diyerek tarihe geçti."
    },
    {
        "name": "Hezarfen Ahmed Çelebi",
        "title": "İlk Uçan Türk",
        "story": "Kuşların uçuşunu inceledi, kendi yaptığı kanatlarla Galata Kulesi'nden Üsküdar'a kadar süzüldü. Dünya tarihinde bir kıtadan diğerine uçarak geçen ilk insanlardan biri olarak efsaneleşti."
    },
    {
        "name": "Wright Kardeşler",
        "title": "Gökyüzü Fatihleri",
        "story": "Bisiklet tamircisiydiler ama akılları gökyüzündeydi. Yaptıkları sayısız deneme ve kaza sonunda motorlu bir uçağı havalandırmayı başardılar. 12 saniyelik o ilk uçuş, insanlık tarihini değiştirdi."
    },
    {
        "name": "Charlie Chaplin",
        "title": "Sessiz Komik",
        "story": "Babası evi terk etti, annesi akıl hastanesine yattı. Sokaklarda büyüdü. Yarattığı 'Şarlo' karakteriyle dünyayı güldürürken aslında sistem eleştirisi yaptı. Sessiz sinemanın en büyük dehasıydı. 'Hayat dar planda trajedi, geniş planda komedidir' dedi."
    },
    {
        "name": "Sylvester Stallone",
        "title": "Rocky",
        "story": "Doğum sırasında yüz felci geçirdi, konuşması bozuldu. Aktör olmak istedi, kimse rol vermedi. Köpeğini satmak zorunda kalacak kadar fakirleşti. Rocky senaryosunu yazdı ve başrol oynamak şartıyla sattı. O film Oscar aldı, o da efsane oldu."
    },
    {
        "name": "Henry Ford",
        "title": "Otomobil Kralı",
        "story": "Çiftçi bir aileden geliyordu. Otomobili sadece zenginlerin oyuncağı olmaktan çıkarıp herkesin alabileceği bir araca dönüştürdü. Seri üretim bandını icat ederek sanayi devrimini hızlandırdı. Beş kez iflas etti ama vazgeçmedi."
    },
    {
        "name": "Enzo Ferrari",
        "title": "Hız Tutkunu",
        "story": "Gençliğinde yarış pilotuydu. Yarattığı araba markası, bugün hız ve lüksün sembolü. Oğlu Dino'yu genç yaşta kaybetti, acısını arabalarına gömdü. 'Birine bir Ferrari sattığınızda ona bir motor değil, bir rüya satarsınız' derdi."
    },
    {
        "name": "Soichiro Honda",
        "title": "Honda'nın Kurucusu",
        "story": "Toyota'ya piston halkası satmak için başvurdu, reddedildi. Fabrikası savaşta bombalandı, depremde yıkıldı. Ama o motorlu bisikletler yaparak başladığı işi dev bir imparatorluğa dönüştürdü. 'Başarı, %99 başarısızlıktır' sözünün sahibi."
    },
    {
        "name": "Ferruccio Lamborghini",
        "title": "İnatçı Boğa",
        "story": "Traktör üreticisiydi. Sahip olduğu Ferrari'nin debriyajı bozulunca Enzo Ferrari'ye şikayete gitti. Enzo onu 'Sen traktörden anlarsın, spor arabadan değil' diye kovdu. O da hırs yaptı, Ferrari'den daha iyi bir araba yapmak için Lamborghini'yi kurdu."
    },
    {
        "name": "Jeff Bezos",
        "title": "Amazon'un Sahibi",
        "story": "İnternetten kitap satma fikriyle garajında Amazon'u kurdu. İlk günlerde siparişleri kendisi paketleyip postaneye taşıyordu. Bugün dünyanın her şeyini satan en büyük mağazası oldu. Sabır ve müşteri odaklılığın en büyük örneği."
    },
    {
        "name": "Mark Zuckerberg",
        "title": "Facebook'un Mucidi",
        "story": "Harvard'da yurt odasında kurduğu site, tüm dünyayı birbirine bağladı. Genç yaşında dünyanın en genç milyarderi oldu. Sosyal medya çağını başlatan isim."
    },
    {
        "name": "Larry Page & Sergey Brin",
        "title": "Google'ın Kurucuları",
        "story": "Stanford'da doktora yaparken internetteki bilgiyi düzenlemek için bir arama motoru geliştirdiler. Garajda kurdukları şirket, bugün dünyanın en büyük bilgi kaynağı. 'Kötü olma' sloganıyla yola çıktılar."
    },
    {
        "name": "Bill Gates",
        "title": "Yazılım Devi",
        "story": "Harvard'ı bıraktı. 'Her eve bir bilgisayar' vizyonuyla Microsoft'u kurdu. Yazılımın gücünü donanımdan öne çıkardı. Dünyanın en zengin adamı unvanını uzun süre korudu, şimdi servetini aşı ve eğitim projelerine harcıyor."
    },
    {
        "name": "Madonna",
        "title": "Popun Kraliçesi",
        "story": "New York'a geldiğinde cebinde sadece 35 doları vardı. Taksi şoförüne 'Beni her şeyin merkezine götür' dedi. Dansçı olarak başladı, şarkılarıyla ve tarzıyla tabuları yıktı. Müzik endüstrisinin en güçlü kadınlarından biri oldu."
    },
    {
        "name": "Elvis Presley",
        "title": "Rock'n Roll Kralı",
        "story": "Kamyon şoförlüğü yaparken müziğe başladı. Dansları 'müstehcen' bulundu, yasaklandı. Ama o, Rock'n Roll'u dünyaya sevdirdi. Sesi ve karizmasıyla milyonları etkiledi. Graceland'deki evi hala bir mabet gibi ziyaret ediliyor."
    },
    {
        "name": "Bob Marley",
        "title": "Reggae Efsanesi",
        "story": "Jamaika'nın gettolarından çıktı. Müziğiyle barış ve özgürlük mesajları verdi. Konser öncesi vuruldu ama 'Kötülük yapanlar bir gün bile tatil yapmıyor, ben neden yapayım?' diyerek sahneye çıktı."
    },
    {
        "name": "Bruce Lee",
        "title": "Ejderin Yolu",
        "story": "Dövüş sanatlarını felsefeyle birleştirdi. Hollywood'da Asyalılara başrol verilmezken o kendi filmlerini yarattı. Jeet Kune Do stilini geliştirdi. Hızı ve gücüyle fizik kurallarını altüst etti."
    },
    {
        "name": "Arnold Schwarzenegger",
        "title": "Terminatör",
        "story": "Avusturya'nın bir köyünde doğdu. Vücut geliştirme şampiyonu oldu. 'Aksanınla oyuncu olamazsın' dediler, Hollywood'un en büyük yıldızı oldu. 'Yönetemezsin' dediler, Kaliforniya Valisi oldu. İmkansız kelimesini reddetti."
    },
    {
        "name": "Dwayne Johnson",
        "title": "The Rock",
        "story": "Amerikan futbolunda başarısız oldu, cebinde 7 dolarla ortada kaldı. Güreşe başladı, efsane oldu. Sonra aktörlüğe geçti, dünyanın en çok kazanan oyuncusu oldu. Disiplin ve çalışkanlığıyla tanınır."
    },
    {
        "name": "Keanu Reeves",
        "title": "Mütevazı Yıldız",
        "story": "Babası terk etti, en yakın arkadaşını ve kızını kaybetti. Büyük acılar yaşadı ama insanlığını kaybetmedi. Metroya binen, set ekibine yardım eden, kazancını bağışlayan 'iyi insan' olarak Hollywood'da bir istisna."
    },
    {
        "name": "Tom Cruise",
        "title": "Görevimiz Tehlike",
        "story": "Disleksi hastasıydı, okumakta zorlanıyordu. Ama ezber yeteneği ve cesaretiyle zirveye çıktı. Dublör kullanmadan yaptığı tehlikeli sahnelerle sinemaya tutkusunu her yaşta kanıtlıyor."
    },
    {
        "name": "Will Smith",
        "title": "Umudunu Kaybetme",
        "story": "Rapçi olarak başladı, iflas etti. 'Prince of Bel-Air' ile televizyona, oradan sinemaya geçti. 'Umudunu Kaybetme' filmindeki performansı aslında kendi hayat felsefesini yansıtıyordu."
    },
    {
        "name": "Jim Carrey",
        "title": "Komik Adam",
        "story": "Ailesi fakirleşince karavanda yaşamak zorunda kaldı. Okuldan sonra fabrikada temizlik yaptı. Stand-up yaparak başladı. Yüz mimikleriyle dünyayı güldürdü ama içinde derin bir depresyonla savaştı ve sanata sığındı."
    },
    {
        "name": "Morgan Freeman",
        "title": "Tanrı'nın Sesi",
        "story": "Kariyerine çok geç başladı. 50 yaşına gelene kadar büyük bir şöhreti yoktu. Ama o karakteristik sesi ve oyunculuğuyla sinemanın en saygın isimlerinden biri oldu. Sabrın sonu selamet."
    },
    {
        "name": "Samuel L. Jackson",
        "title": "Efsane Oyuncu",
        "story": "Kekemeydi, konuşmakta zorlanıyordu. (Bir küfür kelimesini kullanarak kekemeliği yendiğini söyler). 40 yaşından sonra şöhret oldu. Bugün gelmiş geçmiş en çok hasılat yapan filmlerde o var."
    },
    {
        "name": "Robert Downey Jr.",
        "title": "Iron Man",
        "story": "Uyuşturucu batağına düştü, hapse girdi, kariyeri bitti denildi. Ama küllerinden doğdu. Iron Man karakteriyle sadece Marvel evrenini değil, kendi hayatını da kurtardı."
    },
    {
        "name": "Novak Djokovic",
        "title": "Sırp Raket",
        "story": "Sırbistan'da savaşın ortasında, bombaların altında tenis antrenmanı yaptı. Federer ve Nadal gibi devlerin arasından sıyrılıp en çok Grand Slam kazanan erkek tenisçi oldu. Zihinsel gücü inanılmaz."
    },
    {
        "name": "Rafael Nadal",
        "title": "Toprak Ağası",
        "story": "Sakatlıklarla dolu bir kariyer. Doktorlar tenisi bırakmasını söylediğinde o daha hırsla döndü. Roland Garros'u 14 kez kazanarak kırılması imkansız bir rekora imza attı. Savaşçı ruhun simgesi."
    },
    {
        "name": "Roger Federer",
        "title": "Ekselansları",
        "story": "Tenisi bir bale gibi estetik oynadı. Sinirli bir çocukken, kortların en beyefendi oyuncusuna dönüştü. Rekorları ve zarif stiliyle tenisi bir üst seviyeye taşıdı."
    },
    {
        "name": "Mike Tyson",
        "title": "Demir Mike",
        "story": "Suç dolu bir mahallede güvercin besleyen, zorbalığa uğrayan bir çocuktu. Boksla tanışınca hayatı değişti. En genç ağırsiklet şampiyonu oldu. Hapis, iflas, skandallar... Dibe vurdu ama yine ayağa kalktı."
    },
    {
        "name": "Tiger Woods",
        "title": "Golf Efsanesi",
        "story": "Golfün beyazlara ait görüldüğü yıllarda sporu domine etti. Zirvedeyken yaşadığı skandallar ve sakatlıklarla dibi gördü. Herkes 'bitti' derken 2019'da Masters'ı tekrar kazanarak tarihin en büyük geri dönüşlerinden birini yaptı."
    },
    {
        "name": "Lewis Hamilton",
        "title": "Formula 1 Kralı",
        "story": "F1 tarihinin ilk siyah pilotu. Çocukken babası ona karting arabası alabilmek için 4 işte çalıştı. Schumacher'in kırılmaz sanılan rekorlarını kırdı. Pist dışında da aktivist kimliğiyle öne çıktı."
    },
    {
        "name": "Schumacher",
        "title": "Efsane Pilot",
        "story": "Babasının işlettiği go-kart pistinde büyüdü. Yağmurlu havalarda sürmeyi severdi. 7 dünya şampiyonluğu ile F1 tarihine geçti. Disiplini ve takımıyla kurduğu bağ onu zirveye taşıdı."
    },
    {
        "name": "Ayrton Senna",
        "title": "Yağmur Adam",
        "story": "Brezilya'nın ulusal kahramanı. Agresif sürüşü ve yağmurdaki yeteneğiyle efsaneleşti. Genç yaşta pistte hayatını kaybettiğinde ülkesinde 3 gün yas ilan edildi."
    },
    {
        "name": "Simone Biles",
        "title": "Jimnastik Kraliçesi",
        "story": "Koruyucu ailede büyüdü. Jimnastikte yerçekimine meydan okuyan hareketler yaptı (kendi adıyla anılan hareketler var). Olimpiyatlarda yaşadığı zihinsel blokajı (twisties) dünyaya duyurarak sporcu sağlığının madalyadan önemli olduğunu gösterdi."
    },
    {
        "name": "Michael Phelps",
        "title": "Baltimore Mermisi",
        "story": "Dikkat eksikliği ve hiperaktivite bozukluğu (DEHB) vardı. Enerjisini atmak için yüzmeye başladı. 28 Olimpiyat madalyası ile tarihin en çok madalya kazanan sporcusu oldu. Depresyonla mücadelesini de saklamadı."
    },
    {
        "name": "Yuri Gagarin",
        "title": "Uzaydaki İlk İnsan",
        "story": "Bir marangozun oğluydu. 1961'de Vostok 1 kapsülüyle uzaya çıkan ilk insan oldu. 'Dünya mavi ve çok güzel' sözleriyle tarihe geçti. 27 yaşında bir efsane oldu."
    },
    {
        "name": "Neil Armstrong",
        "title": "Aydaki İlk Adım",
        "story": "Kore savaşında pilottu. Ay'a ayak bastığında 'Benim için küçük, insanlık için büyük bir adım' dedi. O anı milyonlarca insan nefesini tutarak izledi. Soğukkanlılığıyla bilinirdi."
    },
    {
        "name": "Amelia Earhart",
        "title": "Okyanusu Aşan Kadın",
        "story": "Atlas Okyanusu'nu uçakla tek başına geçen ilk kadın pilot. Kadınların da erkekler kadar cesur olabileceğini kanıtladı. Dünya turuna çıktığı uçuşta kayboldu ve sırrı hala çözülemedi."
    },
    {
        "name": "Florence Nightingale",
        "title": "Lambalı Kadın",
        "story": "Kırım Savaşı'ndaÜsküdar'daki Selimiye Kışlası'nda yaralı askerlere baktı. Hijyen kurallarıyla ölüm oranlarını düşürdü. Modern hemşireliğin kurucusu sayılır. Geceleri elinde lambayla hastaları gezdiği için bu adı aldı."
    },
    {
        "name": "Alexander Graham Bell",
        "title": "Telefonun Mucidi",
        "story": "Annesi ve eşi işitme engelliydi. Onların duyması için çalışırken telefonu icat etti. Sesin teller üzerinden iletilebileceğini keşfettiğinde dünya iletişim tarihini değiştirdi."
    },
    {
        "name": "Guglielmo Marconi",
        "title": "Radyonun Babası",
        "story": "Evindeki tavan arasında deneyler yaptı. Radyo dalgalarıyla kablosuz iletişim kurmayı başardı. Titanik battığında yardım çağrısı onun sistemi sayesinde yapıldı ve yüzlerce kişi kurtuldu."
    },
    {
        "name": "Louis Pasteur",
        "title": "Kuduz Aşısı",
        "story": "Mikrop teorisini kanıtladı. Pastörizasyon tekniğiyle gıdaların bozulmasını önledi. Kuduz aşısını bularak milyonlarca hayat kurtardı. Laboratuvarında felç geçirmesine rağmen çalışmayı bırakmadı."
    },
    {
        "name": "Charles Darwin",
        "title": "Evrim Teorisi",
        "story": "Beagle gemisiyle çıktığı 5 yıllık dünya turunda doğayı gözlemledi. Galapagos ispinozları üzerine yaptığı çalışmalar 'Türlerin Kökeni' kitabına ilham verdi. Bilim dünyasında devrim yarattı."
    },
    {
        "name": "Sigmund Freud",
        "title": "Psikanalizin Babası",
        "story": "İnsan zihninin derinliklerine, bilinçaltına indi. Rüyaların yorumu ve çocukluk travmaları üzerine teoriler geliştirdi. Psikolojiyi bir bilim dalı olarak dönüştürdü."
    },
    {
        "name": "Carl Sagan",
        "title": "Kozmos",
        "story": "Bilimi halkın anlayacağı dille anlattı. 'Soluk Mavi Nokta' konuşmasıyla evrendeki yerimizi ve kibrimizin anlamsızlığını yüzümüze vurdu. Voyager plaklarının hazırlanmasına öncülük etti."
    },
    {
        "name": "Tolkien",
        "title": "Orta Dünya'nın Yaratıcısı",
        "story": "Dilbilim profesörüydü. Çocuklarına anlattığı masallardan 'Hobbit' ve 'Yüzüklerin Efendisi'ni yarattı. Yarattığı elf dilleri ve mitolojiyle fantastik edebiyatın babası oldu."
    },
    {
        "name": "Agatha Christie",
        "title": "Polisiye Kraliçesi",
        "story": "Disleksi olmasına rağmen dünyanın en çok satan romanlarını yazdı (İncil ve Shakespeare'den sonra). Yarattığı Hercule Poirot karakteri efsane oldu. Bir dönem kendisi de gizemli bir şekilde kayboldu."
    },
    {
        "name": "Pablo Picasso",
        "title": "Kübizm",
        "story": "Resim kurallarını yıktı. 'Çocuk gibi resim yapabilmek için bir ömür harcadım' dedi. Guernica tablosuyla savaşın dehşetini anlattı. 20. yüzyıl sanatına yön verdi."
    },
    {
        "name": "Salvador Dali",
        "title": "Sürrealist Dahi",
        "story": "Eriyen saatler, uzun bacaklı filler... Rüyalarını tuvale döktü. Eksantrik bıyığı ve kişiliğiyle de bir sanat eseriydi. 'Ben uyuşturucu kullanmıyorum, uyuşturucu benim' dedi."
    },
    {
        "name": "Ara Güler",
        "title": "İstanbul'un Gözü",
        "story": "Ona 'fotoğrafçı' denmesine kızardı, 'ben foto muhabiriyim' derdi. İstanbul'un ruhunu, eski sokaklarını, insanlarını ölümsüzleştirdi. Picasso'dan Dali'ye, Churchill'den Hitchcock'a tarihe tanıklık etti."
    },
    {
        "name": "Lefter Küçükandonyadis",
        "title": "Ordinaryüs",
        "story": "Futbolculuğu ve beyefendiliğiyle sadece Fenerbahçe'nin değil tüm Türkiye'nin sevgilisi oldu. 'Ver Lefter'e, yaz deftere' sloganıyla anıldı. Milli takımda 50. maçını oynayan ilk futbolcu oldu."
    },
    {
        "name": "Metin Oktay",
        "title": "Taçsız Kral",
        "story": "Galatasaray'ın efsanesi. Ağları delen golüyle tarihe geçti. Rakip takım oyuncusuna elini uzatan, centilmenliğiyle bilinen bir sporcuydu. Ölümü tüm spor camiasını yasa boğdu."
    },
    {
        "name": "Hakkı Yeten",
        "title": "Baba Hakkı",
        "story": "Beşiktaş'ın efsane kaptanı. Otoritesi ve disipliniyle bilinirdi. Hakem haksız penaltı verince 'atmayacaksın' diyerek kendi oyuncusuna penaltıyı dışarı attıran bir adalet timsaliydi."
    },
    {
        "name": "Süleyman Seba",
        "title": "Efsane Başkan",
        "story": "Beşiktaş'ı kısıtlı imkanlarla şampiyonluklara taşıdı, tesisleşmeyi başlattı. 'Şerefli ikincilikler' sözüyle Türk futboluna ahlak dersi verdi. Tüm renklerin saygı duyduğu bir isimdi."
    },
    {
        "name": "Gazi Yaşargil",
        "title": "Yüzyılın Cerrahı",
        "story": "Beyin cerrahisinde devrim yaratan Türk doktor. Mikroswitch tekniğini geliştirdi. Dünyada 'Beyin Cerrahisi'nin Babası' olarak anılır. Binlerce hayat kurtardı, öğrenciler yetiştirdi."
    },
    {
        "name": "Türkan Saylan",
        "title": "Cüzzamın Düşmanı",
        "story": "Cüzzam (lepra) hastalığını Türkiye'den silmek için gece gündüz çalıştı. Kız çocuklarının okuması için 'Kardelenler' projesini başlattı. Hastalığına rağmen son nefesine kadar eğitim ve sağlık için mücadele etti."
    },
    {
        "name": "Zeki Müren",
        "title": "Sanat Güneşi",
        "story": "Türk müziğine getirdiği yenilikler, sahne kostümleri ve kusursuz Türkçesi ile bir ikondu. 'Bodrum Hakimi' şarkısıyla o beldeyi bile meşhur etti. Tüm mal varlığını eğitim ve Mehmetçik vakfına bağışladı."
    },
    {
        "name": "Adile Naşit",
        "title": "Hafize Ana",
        "story": "Attığı o meşhur kahkahaların ardında, erken yaşta kaybettiği oğlunun acısını sakladı. Hababam Sınıfı'nın Hafize Anası, Uykudan Önce'nin masalcı teyzesi olarak milyonlarca çocuğu büyüttü."
    },
    {
        "name": "Kemal Sunal",
        "title": "Gülen Adam",
        "story": "Sadece yüzüyle değil, duruşuyla güldürdü. Oynadığı 'Şaban' karakteri halkın içinden biriydi; saf ama kurnazlara ders veren. Türkiye'nin en zor zamanlarında bile milleti güldürmeyi başardı. Filmleri hala izlenme rekorları kırıyor."
    }
];

// Write file
fs.writeFileSync('stories.json', JSON.stringify(stories, null, 2));
console.log(`Success! Generated ${stories.length} stories.`);
