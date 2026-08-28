export type SholatCategory =
  | 'fardhu'
  | 'gerakan_bacaan'
  | 'sunnah'
  | 'wudhu_tayamum'
  | 'sujud_khusus'
  | 'syarat_rukun';

export interface SholatStepItem {
  stepNumber: number;
  title: string;
  postureDescription?: string;
  arabic?: string;
  latin?: string;
  translation?: string;
  note?: string;
}

export interface SholatGuideItem {
  id: string;
  category: SholatCategory;
  categoryLabel: string;
  title: string;
  arabicTitle?: string;
  summary: string;
  rakaat?: string;
  waktuPelaksanaan?: string;
  niat?: {
    munfarid?: { arabic: string; latin: string; translation: string };
    imam?: { arabic: string; latin: string; translation: string };
    makmum?: { arabic: string; latin: string; translation: string };
  };
  steps?: SholatStepItem[];
  doaKhusus?: {
    title: string;
    arabic: string;
    latin: string;
    translation: string;
    keutamaan?: string;
  };
  keutamaan?: string;
  ketentuanKhusus?: string[];
}

export const SHOLAT_GUIDE_CATEGORIES: { id: SholatCategory | 'all'; label: string; iconEmoji: string }[] = [
  { id: 'all', label: 'Semua Panduan', iconEmoji: '✨' },
  { id: 'gerakan_bacaan', label: 'Gerakan & Bacaan', iconEmoji: '🧎' },
  { id: 'fardhu', label: 'Sholat Fardhu 5 Waktu', iconEmoji: '🕌' },
  { id: 'sunnah', label: 'Sholat Sunnah Pilihan', iconEmoji: '🌙' },
  { id: 'wudhu_tayamum', label: 'Wudhu & Tayamum', iconEmoji: '💧' },
  { id: 'sujud_khusus', label: 'Sujud Sahwi / Tilawah', iconEmoji: '🤲' },
  { id: 'syarat_rukun', label: 'Syarat & Rukun Sholat', iconEmoji: '📜' },
];

export const SHOLAT_GUIDE_DATA: SholatGuideItem[] = [
  // ===========================================================================
  // 1. GERAKAN & BACAAN LENGKAP SHOLAT (STEP-BY-STEP)
  // ===========================================================================
  {
    id: 'bacaan_lengkap_sholat',
    category: 'gerakan_bacaan',
    categoryLabel: 'Urutan Rukun & Bacaan',
    title: 'Urutan Gerakan & Bacaan Sholat Lengkap',
    arabicTitle: 'كَيْفِيَّةُ الصَّلَاةِ وَأَدْعِيَتُهَا',
    summary: 'Panduan lengkap tata cara gerakan dan bacaan sholat dari Takbiratul Ihram hingga Salam sesuai sunnah Rasulullah SAW.',
    rakaat: 'Standar Setiap Sholat',
    keutamaan: 'Sholat yang dilakukan dengan tuma\'ninah dan memahami bacaannya akan mendatangkan kekhusyukan dan mencegah dari perbuatan keji dan munkar.',
    steps: [
      {
        stepNumber: 1,
        title: '1. Berdiri Tegak & Niat Menghadap Kiblat',
        postureDescription: 'Berdiri tegak menghadap kiblat bagi yang mampu, pandangan mata diarahkan ke tempat sujud, serta menghadirkan niat di dalam hati secara ikhlas.',
        arabic: 'أُصَلِّي فَرْضَ ... رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardho ... (sebutkan sholatnya) rak\'aatim-mustaqbilal-qiblati adaa-an lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu ... karena menghadap kiblat tepat pada waktunya karena Allah Ta\'ala.',
        note: 'Niat wajib di dalam hati bersamaan saat mengangkat takbiratul ihram (melafadzkan niat secara lisan adalah sunnah dalam mazhab Syafi\'i untuk memantapkan hati).'
      },
      {
        stepNumber: 2,
        title: '2. Takbiratul Ihram',
        postureDescription: 'Mengangkat kedua belah tangan sejajar telinga/bahu dengan jari-jari direnggangkan wajar, telapak tangan menghadap kiblat sambil mengucap Takbir.',
        arabic: 'اللَّهُ أَكْبَرُ',
        latin: 'Allaahu Akbar',
        translation: 'Allah Maha Besar.',
        note: 'Takbiratul Ihram adalah rukun qauliy (ucapan) yang menandai masuknya seseorang ke dalam ibadah sholat.'
      },
      {
        stepNumber: 3,
        title: '3. Bersedekap & Membaca Doa Iftitah',
        postureDescription: 'Meletakkan tangan kanan di atas punggung tangan/pergelangan tangan kiri di antara pusar dan dada (atau di atas dada).',
        arabic: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا. وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا مُسْلِمًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ، إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ، لَا شَرِيكَ لَهُ وَبِذَٰلِكَ أُمِرْتُ وَأَنَا مِنَ الْمُسْلِمِينَ',
        latin: 'Allaahu Akbaru kabiiraa, wal-hamdu lillaahi katsiiroo, wa Subhaanallaahi bukrotaw-wa ashiilaa. Wajjahtu wajhiya lilladzii fathoros-samaawaati wal-ardho haniifam-muslimaw-wa maa ana minal-musyrikiin. Inna sholaatii wa nusukii wa mahyaaya wa mamaatii lillaahi Robbil-\'aalamiin. Laa syariika lahuu wa bidzaalika umirtu wa ana minal-muslimiin.',
        translation: 'Allah Maha Besar dengan sebesar-besarnya, segala puji bagi Allah dengan sebanyak-banyaknya, dan Mahasuci Allah di waktu pagi dan petang. Kuhadapkan wajahku kepada Dzat yang menciptakan langit dan bumi dengan lurus dan berserah diri, dan aku bukanlah termasuk orang-orang yang musyrik. Sesungguhnya sholatku, ibadahku, hidupku, dan matiku hanyalah untuk Allah Tuhan semesta alam. Tiada sekutu bagi-Nya dan dengan demikianlah aku diperintahkan, dan aku termasuk golongan orang-orang muslim.',
        note: 'Membaca Doa Iftitah hukumnya sunnah muakkadah pada rakaat pertama setelah Takbiratul Ihram.'
      },
      {
        stepNumber: 4,
        title: '4. Membaca Ta\'awwudz, Surat Al-Fatihah & Aamiin',
        postureDescription: 'Membaca Surat Al-Fatihah dengan tartil dan tajwid yang benar di setiap rakaat sholat, lalu mengucapkan Aamiin.',
        arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (١) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (٢) الرَّحْمَٰنِ الرَّحِيمِ (٣) مَالِكِ يَوْمِ الدِّينِ (٤) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (٥) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (٦) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (٧)\nآمِينَ',
        latin: 'A\'uudzu billaahi minasy-syaithoonir-rojiim. Bismillaahir-rohmaanir-rohiim. Al-hamdu lillaahi Robbil-\'aalamiin. Ar-Rohmaanir-Rohiim. Maaliki yawmid-diin. Iyyaaka na\'budu wa iyyaaka nasta\'iin. Ihdinash-shiroothol-mustaqiim. Shiroothol-ladziina an\'amta \'alaihim ghoiril-maghdhuubi \'alaihim waladh-dhoolliin. Aamiin.',
        translation: 'Aku berlindung kepada Allah dari godaan setan yang terkutuk. Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam. Yang Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan. Tunjukilah kami jalan yang lurus. (Yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat. Kabulkanlah ya Allah.',
        note: 'Membaca Al-Fatihah adalah rukun sholat. Tidak sah sholat seseorang tanpa membaca Surat Al-Fatihah (HR. Bukhari & Muslim).'
      },
      {
        stepNumber: 5,
        title: '5. Membaca Ayat / Surat Pendek Al-Qur\'an',
        postureDescription: 'Setelah Al-Fatihah pada rakaat 1 dan rakaat 2, disunnahkan membaca ayat atau surat pendek Al-Qur\'an (seperti Al-Ikhlas, Al-Falaq, An-Nas, Al-Kafirun, dll).',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ (١) اللَّهُ الصَّمَدُ (٢) لَمْ يَلِدْ وَلَمْ يُولَدْ (٣) وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ (٤)',
        latin: 'Bismillaahir-Rohmaanir-Rohiim. Qul Huwallaahu Ahad. Allaahush-Shomad. Lam yalid wa lam yuulad. Wa lam yakul-lahuu kufuwan ahad.',
        translation: 'Katakanlah (Muhammad): "Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. (Allah) tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia."',
        note: 'Membaca surat pendek disunnahkan pada rakaat 1 dan 2, baik dalam sholat sendiri maupun saat menjadi imam/makmum sholat sirriyyah (bacaan pelan).'
      },
      {
        stepNumber: 6,
        title: '6. Ruku\' Disertai Tuma\'ninah',
        postureDescription: 'Mengangkat kedua tangan sambil mengucap Takbir intiqal, lalu membungkukkan punggung sejajar lurus, kedua telapak tangan memegang lutut dengan jari terbuka renggang, dan diam sejenak (tuma\'ninah).',
        arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ',
        latin: 'Subhaana Robbiyal-\'Azhiimi wa bihamdih. (Dibaca 3x)',
        translation: 'Mahasuci Tuhanku Yang Maha Agung dan dengan memuji kepada-Nya.',
        note: 'Tuma\'ninah (berhenti diam sejenak minimal selama ucapan "Subhanallah") saat ruku\' adalah rukun yang wajib dipenuhi.'
      },
      {
        stepNumber: 7,
        title: '7. I\'tidal (Bangkit dari Ruku\') & Tuma\'ninah',
        postureDescription: 'Bangkit berdiri tegak dari ruku\' sambil mengangkat kedua belah tangan sejajar telinga/bahu dan melafalkan tasmi\' dan tahmid.',
        arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ\nرَبَّنَا لَكَ الْحَمْدُ مِلْءَ السَّمَاوَاتِ وَمِلْءَ الْأَرْضِ وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ',
        latin: 'Sami\'allaahu liman hamidah.\nRobbanaa lakal-hamdu mil-us-samaawaati wa mil-ul-ardhi wa mil-u maa syi\'ta min syai-im ba\'d.',
        translation: 'Semoga Allah mendengar pujian orang yang memuji-Nya.\nWahai Tuhan kami, bagi-Mulah segala puji sepenuh langit dan sepenuh bumi, serta sepenuh apa saja yang Engkau kehendaki sesudah itu.',
        note: 'Pada sholat Subuh di rakaat ke-2 saat I\'tidal sebelum sujud, disunnahkan membaca Doa Qunut bagi yang mengamalkannya.'
      },
      {
        stepNumber: 8,
        title: '8. Sujud Pertama Disertai Tuma\'ninah',
        postureDescription: 'Turun bersujud dengan menempelkan 7 anggota sujud ke lantai secara sempurna: dahi & hidung, kedua telapak tangan, kedua lutut, dan ujung jari-jari kedua kaki yang ditekuk menghadap kiblat.',
        arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ وَبِحَمْدِهِ',
        latin: 'Subhaana Robbiyal-A\'laa wa bihamdih. (Dibaca 3x)',
        translation: 'Mahasuci Tuhanku Yang Mahatinggi dan dengan memuji kepada-Nya.',
        note: 'Saat sujud posisi kepala lebih rendah dari pinggul, siku tidak boleh menempel ke lantai bagi laki-laki dan merapat wajar bagi perempuan.'
      },
      {
        stepNumber: 9,
        title: '9. Duduk di Antara Dua Sujud (Iftirasy) & Tuma\'ninah',
        postureDescription: 'Bangkit dari sujud pertama sambil bertakbir, duduk di atas telapak kaki kiri yang dihamparkan (iftirasy) dan menegakkan telapak kaki kanan dengan jari menekuk menghadap kiblat, kedua tangan di atas paha.',
        arabic: 'رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي وَاعْفُ عَنِّي',
        latin: 'Robbighfir lii warhamnii wajburnii warfa\'nii warzuqnii wahdinii wa \'aafinii wa\'fu \'annii.',
        translation: 'Wahai Tuhanku, ampunilah aku, sayangilah aku, cukupkanlah kekuranganku, tinggikanlah derajatku, berilah aku rezeki, berilah aku petunjuk, berilah aku kesehatan/kesejahteraan, dan maafkanlah kesalahanku.',
        note: 'Duduk dengan tuma\'ninah dan membaca doa dengan penuh permohonan ampunan.'
      },
      {
        stepNumber: 10,
        title: '10. Sujud Kedua Disertai Tuma\'ninah',
        postureDescription: 'Melakukan sujud yang kedua dengan tata cara dan bacaan yang sama persis seperti pada sujud pertama.',
        arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ وَبِحَمْدِهِ',
        latin: 'Subhaana Robbiyal-A\'laa wa bihamdih. (Dibaca 3x)',
        translation: 'Mahasuci Tuhanku Yang Mahatinggi dan dengan memuji kepada-Nya.',
        note: 'Sujud kedua menyempurnakan satu rakaat sholat. Setelah ini bangkit berdiri untuk rakaat berikutnya (atau duduk tasyahud jika pada rakaat ke-2).'
      },
      {
        stepNumber: 11,
        title: '11. Duduk Tasyahud Awal (Rakaat ke-2 pada sholat 3 & 4 rakaat)',
        postureDescription: 'Duduk iftirasy di rakaat ke-2, meletakkan tangan di paha, mengepalkan jari tangan kanan kecuali telunjuk yang diacungkan saat mengucapkan "Illallaah".',
        arabic: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ. اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ',
        latin: 'At-tahiyyaatul-mubaarokaatush-sholawaatuth-thoyyibaatu lillaah. As-salaamu \'alaika ayyuhan-Nabiyyu wa rohmatullaahi wa barokaatuh. As-salaamu \'alainaa wa \'alaa \'ibaadillaahish-shoolihiin. Asyhadu allaa ilaaha illallaah, wa asyhadu anna Muhammadar-Rasuulullaah. Allaahumma sholli \'alaa Sayyidinaa Muhammad.',
        translation: 'Segala kehormatan yang penuh berkah, kebahagiaan, dan kebaikan hanyalah milik Allah. Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu wahai Nabi (Muhammad). Semoga keselamatan tercurah kepada kami dan hamba-hamba Allah yang sholeh. Aku bersaksi bahwa tiada Tuhan selain Allah dan aku bersaksi bahwa Nabi Muhammad adalah utusan Allah. Ya Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad.',
        note: 'Tasyahud Awal hukumnya sunnah ab\'adh dalam mazhab Syafi\'i. Jika lupa, disunnahkan diganti dengan sujud sahwi di akhir sholat.'
      },
      {
        stepNumber: 12,
        title: '12. Duduk Tasyahud Akhir (Tawarruk) & Sholawat Ibrahimiyyah',
        postureDescription: 'Duduk tawarruk (memasukkan kaki kiri di bawah kaki kanan dan mendudukkan pantat langsung ke lantai). Membaca Tasyahud lengkap dengan Sholawat Ibrahimiyyah.',
        arabic: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ.\n\nاللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
        latin: 'At-tahiyyaatul-mubaarokaatush-sholawaatuth-thoyyibaatu lillaah. As-salaamu \'alaika ayyuhan-Nabiyyu wa rohmatullaahi wa barokaatuh. As-salaamu \'alainaa wa \'alaa \'ibaadillaahish-shoolihiin. Asyhadu allaa ilaaha illallaah, wa asyhadu anna Muhammadar-Rasuulullaah.\n\nAllaahumma sholli \'alaa Sayyidinaa Muhammad wa \'alaa aali Sayyidinaa Muhammad, kamaa shollaita \'alaa Sayyidinaa Ibroohiima wa \'alaa aali Sayyidinaa Ibroohiim. Wa baarik \'alaa Sayyidinaa Muhammad wa \'alaa aali Sayyidinaa Muhammad, kamaa baarokta \'alaa Sayyidinaa Ibroohiima wa \'alaa aali Sayyidinaa Ibroohiim, fil-\'aalamiina innaka Hamiidum-Majiid.',
        translation: 'Segala kehormatan yang penuh berkah, kebahagiaan, dan kebaikan hanyalah milik Allah. Salam sejahtera kepadamu wahai Nabi, beserta rahmat Allah dan berkah-Nya. Salam sejahtera semoga terlimpah kepada kami dan hamba-hamba Allah yang sholeh. Aku bersaksi bahwa tiada Tuhan selain Allah dan aku bersaksi bahwa Muhammad adalah utusan Allah.\n\nYa Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad dan kepada keluarga Nabi Muhammad, sebagaimana Engkau telah melimpahkan sholawat kepada Nabi Ibrahim dan kepada keluarga Nabi Ibrahim. Dan berkahilah Nabi Muhammad dan keluarga Nabi Muhammad, sebagaimana Engkau telah memberkahi Nabi Ibrahim dan keluarga Nabi Ibrahim. Di seluruh alam semesta, sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.',
        note: 'Membaca tasyahud akhir dan sholawat kepada Nabi SAW di tasyahud akhir adalah rukun sholat.'
      },
      {
        stepNumber: 13,
        title: '13. Doa Perlindungan Sebelum Salam (Disunnahkan)',
        postureDescription: 'Sebelum menolehkan salam, disunnahkan berdoa memohon perlindungan dari 4 fitnah besar.',
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
        latin: 'Allaahumma innii a\'uudzu bika min \'adzaabi jahannama, wa min \'adzaabil-qobri, wa min fitnatil-mahyaa wal-mamaati, wa min syarri fitnatil-Masiihid-Dajjaal.',
        translation: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari azab neraka Jahannam, dari azab kubur, dari fitnah kehidupan dan kematian, serta dari keburukan fitnah Al-Masih Ad-Dajjal.',
        note: 'Doa perlindungan dari 4 perkara ini sangat dianjurkan oleh Rasulullah SAW (HR. Muslim).'
      },
      {
        stepNumber: 14,
        title: '14. Salam ke Kanan dan ke Kiri',
        postureDescription: 'Menolehkan wajah ke kanan sampai pipi terlihat dari belakang sambil melafalkan salam pertama (rukun), kemudian menoleh ke kiri sambil melafalkan salam kedua (sunnah).',
        arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
        latin: 'As-Salaamu \'alaikum wa Rohmatullaah.',
        translation: 'Semoga keselamatan dan rahmat Allah terlimpah kepadamu.',
        note: 'Salam pertama adalah rukun yang menjadi penutup rangkaian sholat. Niatkan salam kepada malaikat di kanan-kiri dan sesama kaum muslimin.'
      }
    ]
  },

  // ===========================================================================
  // 2. SHOLAT FARDHU 5 WAKTU
  // ===========================================================================
  {
    id: 'sholat_subuh',
    category: 'fardhu',
    categoryLabel: 'Sholat Fardhu',
    title: 'Sholat Subuh (2 Rakaat)',
    arabicTitle: 'صَلَاةُ الصُّبْحِ',
    summary: 'Sholat fardhu 2 rakaat yang dikerjakan saat terbit fajar shadiq hingga menjelang terbit matahari, disunnahkan membaca Doa Qunut pada rakaat kedua.',
    rakaat: '2 Rakaat (Jahar / Bersuara Nyaring)',
    waktuPelaksanaan: 'Mulai terbit fajar shadiq sampai terbitnya matahari.',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhosh-shubhi rok\'ataini mustaqbilal-qiblati adaa-an lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Subuh dua rakaat menghadap kiblat tepat pada waktunya karena Allah Ta\'ala.'
      },
      imam: {
        arabic: 'أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً إِمَامًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhosh-shubhi rok\'ataini mustaqbilal-qiblati adaa-an imaaman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Subuh dua rakaat menghadap kiblat tepat pada waktunya sebagai imam karena Allah Ta\'ala.'
      },
      makmum: {
        arabic: 'أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُومًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhosh-shubhi rok\'ataini mustaqbilal-qiblati adaa-an ma\'muuman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Subuh dua rakaat menghadap kiblat tepat pada waktunya sebagai makmum karena Allah Ta\'ala.'
      }
    },
    doaKhusus: {
      title: 'Doa Qunut Subuh (Dibaca saat I\'tidal rakaat ke-2)',
      arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَىٰ عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ، فَلَكَ الْحَمْدُ عَلَىٰ مَا قَضَيْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ، وَصَلَّى اللَّهُ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلَّمَ',
      latin: 'Allaahummahdinii fiiman hadait, wa \'aafinii fiiman \'aafait, wa tawallanii fiiman tawallait, wa baarik lii fiimaa a\'thoit, wa qinii syarro maa qodhoit, fa-innaka taqdhii wa laa yuqdhoo \'alaik, wa innahuu laa yadzillu maw-waalait, wa laa ya\'izzu man \'aadait, tabaarokta Robbanaa wa ta\'aalait, fa-lakal-hamdu \'alaa maa qodhoit, astaghfiruka wa atuubu ilaik, wa shollallaahu \'alaa Sayyidinaa Muhammadinin-Nabiyyil-Ummiyyi wa \'alaa aalihii wa shohbihii wa sallam.',
      translation: 'Ya Allah, berilah aku petunjuk sebagaimana orang-orang yang telah Engkau beri petunjuk, berilah aku keselamatan sebagaimana orang-orang yang telah Engkau beri keselamatan, peliharalah aku sebagaimana orang-orang yang telah Engkau pelihara, berkahilah bagiku pada apa yang telah Engkau berikan, dan lindungilah aku dari keburukan takdir yang telah Engkau tentukan. Sesungguhnya Engkaulah yang menentukan dan tidak ada yang menentukan atas-Mu. Sesungguhnya tidak akan hina orang yang Engkau cintai, dan tidak akan mulia orang yang Engkau musuhi. Mahaberkah Engkau wahai Tuhan kami dan Mahatinggi Engkau. Maka bagi-Mu segala puji atas apa yang telah Engkau putuskan. Aku memohon ampunan kepada-Mu dan bertaubat kepada-Mu. Dan semoga Allah melimpahkan sholawat dan salam kepada junjungan kami Nabi Muhammad, Nabi yang ummi, beserta keluarga dan para sahabatnya.',
      keutamaan: 'Doa Qunut Subuh merupakan sunnah ab\'adh dalam mazhab Syafi\'i yang dipraktikkan oleh para sahabat dan ulama salaf.'
    },
    ketentuanKhusus: [
      'Sholat Subuh terdiri dari 2 rakaat dengan bacaan Al-Fatihah dan surat secara jahar (bersuara terang/nyaring).',
      'Tidak ada tasyahud awal, langsung tasyahud akhir di rakaat kedua.',
      'Sangat dianjurkan sholat sunnah Qabliyyah Subuh (2 rakaat sebelum Subuh) yang pahalanya lebih baik dari dunia seisinya.'
    ]
  },
  {
    id: 'sholat_dzuhur',
    category: 'fardhu',
    categoryLabel: 'Sholat Fardhu',
    title: 'Sholat Dzuhur (4 Rakaat)',
    arabicTitle: 'صَلَاةُ الظُّهْرِ',
    summary: 'Sholat fardhu 4 rakaat dengan bacaan sirriyyah (pelan), dikerjakan setelah matahari tergelincir dari puncaknya ke arah barat.',
    rakaat: '4 Rakaat (Sirri / Suara Pelan)',
    waktuPelaksanaan: 'Mulai tergelincirnya matahari (zawal) hingga bayangan benda sama panjang dengan aslinya.',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhadh-dhuhri arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Dzuhur empat rakaat menghadap kiblat tepat pada waktunya karena Allah Ta\'ala.'
      },
      imam: {
        arabic: 'أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً إِمَامًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhadh-dhuhri arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an imaaman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Dzuhur empat rakaat menghadap kiblat tepat pada waktunya sebagai imam karena Allah Ta\'ala.'
      },
      makmum: {
        arabic: 'أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُومًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhadh-dhuhri arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an ma\'muuman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Dzuhur empat rakaat menghadap kiblat tepat pada waktunya sebagai makmum karena Allah Ta\'ala.'
      }
    },
    ketentuanKhusus: [
      'Terdiri dari 4 rakaat: Tasyahud awal di rakaat ke-2 dan Tasyahud akhir di rakaat ke-4.',
      'Bacaan Al-Fatihah dan surat dibaca secara pelan (sirr) yang hanya terdengar oleh diri sendiri.',
      'Disunnahkan 2 atau 4 rakaat Qabliyyah Dzuhur dan 2 rakaat Ba\'diyyah Dzuhur.'
    ]
  },
  {
    id: 'sholat_ashar',
    category: 'fardhu',
    categoryLabel: 'Sholat Fardhu',
    title: 'Sholat Ashar (4 Rakaat)',
    arabicTitle: 'صَلَاةُ الْعَصْرِ',
    summary: 'Sholat fardhu 4 rakaat (sholat wustha) yang memiliki keutamaan besar dalam menjaga amal ibadah harian.',
    rakaat: '4 Rakaat (Sirri / Suara Pelan)',
    waktuPelaksanaan: 'Mulai bayangan benda melebihi panjang aslinya hingga menjelang matahari terbenam.',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-\'ashri arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Ashar empat rakaat menghadap kiblat tepat pada waktunya karena Allah Ta\'ala.'
      },
      imam: {
        arabic: 'أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً إِمَامًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-\'ashri arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an imaaman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Ashar empat rakaat menghadap kiblat tepat pada waktunya sebagai imam karena Allah Ta\'ala.'
      },
      makmum: {
        arabic: 'أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُومًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-\'ashri arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an ma\'muuman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Ashar empat rakaat menghadap kiblat tepat pada waktunya sebagai makmum karena Allah Ta\'ala.'
      }
    },
    keutamaan: 'Rasulullah SAW bersabda: "Barangsiapa meninggalkan sholat Ashar, maka terhapuslah amal perbuatannya." (HR. Bukhari).',
    ketentuanKhusus: [
      'Tata cara sama persis dengan Sholat Dzuhur (4 rakaat dengan bacaan sirr).',
      'Tidak ada sholat sunnah Ba\'diyyah sesudah sholat Ashar (waktu makruh sholat sunnah mutlaq).'
    ]
  },
  {
    id: 'sholat_maghrib',
    category: 'fardhu',
    categoryLabel: 'Sholat Fardhu',
    title: 'Sholat Maghrib (3 Rakaat)',
    arabicTitle: 'صَلَاةُ الْمَغْرِبِ',
    summary: 'Sholat fardhu 3 rakaat yang dikerjakan sesaat setelah terbenamnya seluruh piringan matahari di ufuk barat.',
    rakaat: '3 Rakaat (Jahar di Rakaat 1-2, Sirr di Rakaat 3)',
    waktuPelaksanaan: 'Mulai matahari terbenam sempurna sampai mega merah (syafaqul ahmar) hilang.',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-maghribi tsalaatsa roka\'aatim-mustaqbilal-qiblati adaa-an lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Maghrib tiga rakaat menghadap kiblat tepat pada waktunya karena Allah Ta\'ala.'
      },
      imam: {
        arabic: 'أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً إِمَامًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-maghribi tsalaatsa roka\'aatim-mustaqbilal-qiblati adaa-an imaaman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Maghrib tiga rakaat menghadap kiblat tepat pada waktunya sebagai imam karena Allah Ta\'ala.'
      },
      makmum: {
        arabic: 'أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُومًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-maghribi tsalaatsa roka\'aatim-mustaqbilal-qiblati adaa-an ma\'muuman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Maghrib tiga rakaat menghadap kiblat tepat pada waktunya sebagai makmum karena Allah Ta\'ala.'
      }
    },
    ketentuanKhusus: [
      'Rakaat 1 dan 2 dibaca secara jahar (bersuara terang).',
      'Duduk Tasyahud awal di rakaat ke-2.',
      'Rakaat ke-3 hanya membaca Al-Fatihah secara sirr (pelan), lalu tasyahud akhir dan salam.',
      'Sangat dianjurkan sholat sunnah 2 rakaat Ba\'diyyah Maghrib.'
    ]
  },
  {
    id: 'sholat_isya',
    category: 'fardhu',
    categoryLabel: 'Sholat Fardhu',
    title: 'Sholat Isya (4 Rakaat)',
    arabicTitle: 'صَلَاةُ الْعِشَاءِ',
    summary: 'Sholat fardhu 4 rakaat di malam hari dengan waktu terpanjang, dibaca jahar pada dua rakaat pertama.',
    rakaat: '4 Rakaat (Jahar di Rakaat 1-2, Sirr di Rakaat 3-4)',
    waktuPelaksanaan: 'Mulai hilangnya mega merah di barat hingga terbit fajar shadiq (sepertiga malam terakhir).',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-\'isyaa-i arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Isya empat rakaat menghadap kiblat tepat pada waktunya karena Allah Ta\'ala.'
      },
      imam: {
        arabic: 'أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً إِمَامًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-\'isyaa-i arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an imaaman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Isya empat rakaat menghadap kiblat tepat pada waktunya sebagai imam karena Allah Ta\'ala.'
      },
      makmum: {
        arabic: 'أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُومًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii fardhal-\'isyaa-i arba\'a roka\'aatim-mustaqbilal-qiblati adaa-an ma\'muuman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat fardhu Isya empat rakaat menghadap kiblat tepat pada waktunya sebagai makmum karena Allah Ta\'ala.'
      }
    },
    keutamaan: 'Rasulullah SAW bersabda: "Barangsiapa sholat Isya berjamaah, maka seakan-akan ia sholat separuh malam." (HR. Muslim).',
    ketentuanKhusus: [
      'Rakaat 1 dan 2 dibaca jahar, rakaat 3 dan 4 dibaca sirr.',
      'Disunnahkan sholat sunnah 2 rakaat Ba\'diyyah Isya dan dilanjutkan Sholat Witir/Tahajjud.'
    ]
  },

  // ===========================================================================
  // 3. SHOLAT SUNNAH UTAMA
  // ===========================================================================
  {
    id: 'sholat_dhuha',
    category: 'sunnah',
    categoryLabel: 'Sholat Sunnah',
    title: 'Sholat Dhuha (2 - 8 Rakaat)',
    arabicTitle: 'صَلَاةُ الضُّحَىٰ',
    summary: 'Sholat sunnah penjemput rezeki dan sedekah untuk seluruh persendian tubuh, dikerjakan di pagi hari saat matahari naik setinggi tombak.',
    rakaat: 'Minimal 2 Rakaat (Bisa 4, 6, atau 8 rakaat tiap 2 rakaat salam)',
    waktuPelaksanaan: 'Mulai matahari naik setinggi tombak (+/- 15 menit setelah Syuruq/terbit) hingga 15 menit sebelum masuk waktu Dzuhur.',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي سُنَّةَ الضُّحَى رَكْعَتَيْنِ لِلَّهِ تَعَالَى',
        latin: 'Ushallii sunnatadh-Dhuhaa rok\'ataini lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat sunnah Dhuha dua rakaat karena Allah Ta\'ala.'
      }
    },
    doaKhusus: {
      title: 'Doa Sesudah Sholat Dhuha',
      arabic: 'اللَّهُمَّ إِنَّ الضُّحَاءَ ضُحَاؤُكَ، وَالْبَهَاءَ بَهَاؤُكَ، وَالْجَمَالَ جَمَالُكَ، وَالْقُوَّةَ قُوَّتُكَ، وَالْقُدْرَةَ قُدْرَتُكَ، وَالْعِصْمَةَ عِصْمَتُكَ. اللَّهُمَّ إِنْ كَانَ رِزْقِي فِي السَّمَاءِ فَأَنْزِلْهُ، وَإِنْ كَانَ فِي الْأَرْضِ فَأَخْرِجْهُ، وَإِنْ كَانَ مُعْسِرًا فَيَسِّرْهُ، وَإِنْ كَانَ حَرَامًا فَطَهِّرْهُ، وَإِنْ كَانَ بَعِيدًا فَقَرِّبْهُ، بِحَقِّ ضُحَائِكَ وَبَهَائِكَ وَجَمَالِكَ وَقُوَّتِكَ وَقُدْرَتِكَ، آتِنِي مَا آتَيْتَ عِبَادَكَ الصَّالِحِينَ',
      latin: 'Allaahumma innadh-dhuhaa-a dhuhaa-uka, wal-bahaa-a bahaa-uka, wal-jamaala jamaaluka, wal-quwwata quwwatuka, wal-qudrota qudrotuka, wal-\'ishmata \'ishmatuka. Allaahumma in kaana rizqii fis-samaa-i fa-anzilhu, wa in kaana fil-ardhi fa-akhrijhu, wa in kaana mu\'siron fa-yassirhu, wa in kaana harooman fa-thohhirhu, wa in kaana ba\'iidan fa-qorribhu, bihaqqi dhuhaa-ika wa bahaa-ika wa jamaalika wa quwwatika wa qudrotika, aatinii maa aataita \'ibaadakash-shoolihiin.',
      translation: 'Ya Allah, sesungguhnya waktu dhuha adalah waktu dhuha-Mu, keagungan adalah keagungan-Mu, keindahan adalah keindahan-Mu, kekuatan adalah kekuatan-Mu, kekuasaan adalah kekuasaan-Mu, dan penjagaan adalah penjagaan-Mu. Ya Allah, jikalau rezekiku berada di atas langit maka turunkanlah, jikalau berada di dalam bumi maka keluarkanlah, jikalau sukar maka mudahkanlah, jikalau haram maka sucikanlah, jikalau jauh maka dekatkanlah, berkat hak waktu dhuha-Mu, keagungan-Mu, keindahan-Mu, kekuatan-Mu, dan kekuasaan-Mu, limpahkanlah kepadaku apa yang telah Engkau berikan kepada hamba-hamba-Mu yang sholeh.',
      keutamaan: 'Membuka pintu rezeki yang berkah dan sebagai ganti sedekah bagi 360 persendian tulang tubuh manusia setiap hari.'
    },
    ketentuanKhusus: [
      'Surat yang dianjurkan dibaca: Surat Asy-Syams pada rakaat pertama dan Adh-Dhuha pada rakaat kedua (atau Al-Kafirun & Al-Ikhlas).',
      'Dikerjakan setiap 2 rakaat satu salam.'
    ]
  },
  {
    id: 'sholat_tahajjud',
    category: 'sunnah',
    categoryLabel: 'Sholat Sunnah',
    title: 'Sholat Tahajjud & Qiyamul Lail',
    arabicTitle: 'صَلَاةُ التَّهَجُّدِ',
    summary: 'Sholat sunnah yang dikerjakan di malam hari setelah tidur terlebih dahulu, sarana mendekatkan diri paling utama kepada Allah SWT.',
    rakaat: 'Minimal 2 Rakaat (Bisa 4, 8, hingga tanpa batas jumlah genap)',
    waktuPelaksanaan: 'Mulai setelah sholat Isya dan sesudah bangun tidur malam hingga menjelang adzan Subuh (waktu terbaik: sepertiga malam terakhir, sekitar pukul 02.00 - 04.00).',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي سُنَّةَ التَّهَجُّدِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى',
        latin: 'Ushallii sunnatat-Tahajjudi rok\'ataini lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat sunnah Tahajjud dua rakaat karena Allah Ta\'ala.'
      }
    },
    doaKhusus: {
      title: 'Doa Munajat Sholat Tahajjud (Sesuai Hadits Shahih Bukhari & Muslim)',
      arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ الْحَقُّ، وَوَعْدُكَ الْحَقُّ، وَقَوْلُكَ الْحَقُّ، وَلِقَاؤُكَ حَقٌّ، وَالْجَنَّةُ حَقٌّ، وَالنَّارُ حَقٌّ، وَالنَّبِيُّونَ حَقٌّ، وَمُحَمَّدٌ حَقٌّ، وَالسَّاعَةُ حَقٌّ. اللَّهُمَّ لَكَ أَسْلَمْتُ، وَبِكَ آمَنْتُ، وَعَلَيْكَ تَوَكَّلْتُ، وَإِلَيْكَ أَنَبْتُ، وَبِكَ خَاصَمْتُ، وَإِلَيْكَ حَاكَمْتُ، فَاغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ، لَا إِلٰهَ إِلَّا أَنْتَ',
      latin: 'Allaahumma lakal-hamdu Anta Nuurus-samaawaati wal-ardhi wa man fiihinna, wa lakal-hamdu Anta Qoyyimus-samaawaati wal-ardhi wa man fiihinna, wa lakal-hamdu Antal-Haqqu, wa wa\'dukal-haqq, wa qoulukal-haqq, wa liqoo-uka haqq, wal-jannatu haqq, wan-naaru haqq, wan-nabiyyuuna haqq, wa Muhammadun haqq, was-saa\'atu haqq. Allaahumma laka aslamtu, wa bika aamantu, wa \'alaika tawakkaltu, wa ilaika anabtu, wa bika khooshomtu, wa ilaika haakamtu, faghfir lii maa qoddamtu wa maa akh-khortu, wa maa asrortu wa maa a\'lantu, Antal-Muqoddimu wa Antal-Muakh-khiru, laa ilaaha illaa Anta.',
      translation: 'Ya Allah, bagi-Mu segala puji, Engkaulah Cahaya langit dan bumi serta apa yang ada di dalamnya. Bagi-Mu segala puji, Engkaulah Pemelihara langit dan bumi serta apa yang ada di dalamnya. Bagi-Mu segala puji, Engkaulah Yang Mahabenar, janji-Mu benar, firman-Mu benar, pertemuan dengan-Mu benar, surga adalah benar, neraka adalah benar, para nabi adalah benar, Nabi Muhammad adalah benar, dan hari kiamat adalah benar. Ya Allah, kepada-Mulah aku berserah diri, kepada-Mulah aku beriman, kepada-Mulah aku bertawakal, kepada-Mulah aku kembali, dengan pertolongan-Mulah aku berdebat, dan kepada-Mulah aku berhukum. Maka ampunilah dosa-dosaku yang telah lalu dan yang akan datang, yang aku sembunyikan dan yang aku tampakkan. Engkaulah Yang Mendahulukan dan Engkaulah Yang Mengakhirkan, tiada Tuhan selain Engkau.',
      keutamaan: 'Mendapat tempat terpuji (Maqamam Mahmuda), doa dikabulkan secara mustajab, dan diangkat derajatnya oleh Allah SWT.'
    }
  },
  {
    id: 'sholat_witir',
    category: 'sunnah',
    categoryLabel: 'Sholat Sunnah',
    title: 'Sholat Witir (1 - 3 Rakaat)',
    arabicTitle: 'صَلَاةُ الْوِتْرِ',
    summary: 'Sholat sunnah berbilang ganjil sebagai penutup seluruh ibadah sholat di malam hari.',
    rakaat: 'Ganjil (1, 3, 5, 7, 9, atau 11 Rakaat)',
    waktuPelaksanaan: 'Mulai sesudah sholat Isya hingga sebelum adzan Subuh berkumandang.',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي سُنَّةَ الْوِتْرِ ثَلَاثَ رَكَعَاتٍ لِلَّهِ تَعَالَى',
        latin: 'Ushallii sunnatal-witri tsalaatsa roka\'aatim lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat sunnah Witir tiga rakaat karena Allah Ta\'ala.'
      }
    },
    doaKhusus: {
      title: 'Dzikir & Doa Sesudah Sholat Witir',
      arabic: 'سُبْحَانَ الْمَلِكِ الْقُدُّوسِ (٣×)\nسُبُّوحٌ قُدُّوسٌ رَبُّنَا وَرَبُّ الْمَلَائِكَةِ وَالرُّوحِ\n\nاللَّهُمَّ إِنَّا نَسْأَلُكَ إِيمَانًا دَائِمًا، وَنَسْأَلُكَ قَلْبًا خَاشِعًا، وَنَسْأَلُكَ عِلْمًا نَافِعًا، وَنَسْأَلُكَ يَقِينًا صَادِقًا، وَنَسْأَلُكَ عَمَلًا صَالِحًا، وَنَسْأَلُكَ دِينًا قَيِّمًا، وَنَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ وَالْمُعَافَاةَ الدَّائِمَةَ فِي الدِّينِ وَالدُّنْيَا وَالْآخِرَةِ',
      latin: 'Subhaanal-Malikil-Qudduus (3x). Subbuuhun Qudduusun Robbunaa wa Robbul-malaa-ikati war-ruuh.\n\nAllaahumma innaa nas-aluka iimaanan daa-iman, wa nas-aluka qolban khoosyi\'an, wa nas-aluka \'ilman naafi\'an, wa nas-aluka yaqiinan shoodiqon, wa nas-aluka \'amalan shoolihaa, wa nas-aluka diinan qoyyiman, wa nas-alukal-\'afwa wal-\'aafiyata wal-mu\'aafaatad-daa-imata fid-diini wad-dunyaa wal-aakhiroh.',
      translation: 'Mahasuci Tuhan Raja Yang Mahakudus (3x). Mahasuci lagi Mahakudus, Tuhan kami dan Tuhan para malaikat serta malaikat Jibril.\n\nYa Allah, sesungguhnya kami memohon kepada-Mu iman yang langgeng, hati yang khusyuk, ilmu yang bermanfaat, keyakinan yang benar, amal yang sholeh, agama yang lurus, serta ampunan, keselamatan, dan kesehatan yang sempurna dalam agama, dunia, dan akhirat.'
    }
  },
  {
    id: 'sholat_tarawih',
    category: 'sunnah',
    categoryLabel: 'Sholat Sunnah',
    title: 'Sholat Tarawih Ramadhan',
    arabicTitle: 'صَلَاةُ التَّرَاوِيحِ',
    summary: 'Sholat sunnah muakkad khusus di malam bulan suci Ramadhan, dikerjakan setelah sholat Isya berjamaah maupun sendiri.',
    rakaat: '8 Rakaat (4x salam) atau 20 Rakaat (10x salam) + 3 Witir',
    waktuPelaksanaan: 'Malam hari di bulan suci Ramadhan setelah sholat fardhu Isya dan Ba\'diyyah Isya.',
    niat: {
      imam: {
        arabic: 'أُصَلِّي سُنَّةَ التَّرَاوِيحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً إِمَامًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii sunnatat-Tarooswiihi rok\'ataini mustaqbilal-qiblati adaa-an imaaman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat sunnah Tarawih dua rakaat menghadap kiblat sebagai imam karena Allah Ta\'ala.'
      },
      makmum: {
        arabic: 'أُصَلِّي سُنَّةَ التَّرَاوِيحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُومًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii sunnatat-Tarooswiihi rok\'ataini mustaqbilal-qiblati adaa-an ma\'muuman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat sunnah Tarawih dua rakaat menghadap kiblat sebagai makmum karena Allah Ta\'ala.'
      }
    },
    doaKhusus: {
      title: 'Doa Kamilin (Dibaca Sesudah Sholat Tarawih)',
      arabic: 'اللَّهُمَّ اجْعَلْنَا بِالْإِيمَانِ كَامِلِينَ، وَلِلْفَرَائِضِ مُؤَدِّينَ، وَلِلصَّلَاةِ حَافِظِينَ، وَلِلزَّكَاةِ فَاعِلِينَ، وَلِمَا عِنْدَكَ طَالِبِينَ، وَلِعَفْوِكَ رَاجِينَ، وَبِالْهُدَىٰ مُتَمَسِّكِينَ، وَعَنِ اللَّغْوِ مُعْرِضِينَ، وَفِي الدُّنْيَا زَاهِدِينَ، وَفِي الْآخِرَةِ رَاغِبِينَ، وَبِالْقَضَاءِ رَاضِينَ، وَلِلنَّعْمَاءِ شَاكِرِينَ، وَعَلَىٰ الْبَلَاءِ صَابِرِينَ',
      latin: 'Allaahummaj\'alnaa bil-iimaani kaamiliin, wa lil-faroo-idhi mu-addiin, wa lish-sholaati haafizhiin, wa liz-zakaati faa\'iliin, wa limaa \'indaka thoolibiin, wa li\'afwika roojiin, wa bil-hudaa mutamassikiin, wa \'anil-laghwi mu\'ridhiin, wa fid-dunyaa zaahidiin, wa fil-aakhiroti rooghibiin, wa bil-qodhoo-i roodhiin, wa lin-na\'maa-i syaakiriin, wa \'alal-balaa-i shoobiriin.',
      translation: 'Ya Allah, jadikanlah kami orang-orang yang sempurna imannya, yang menunaikan kewajiban-kewajiban, yang memelihara sholat, yang mengeluarkan zakat, yang mencari apa yang ada di sisi-Mu, yang mengharapkan ampunan-Mu, yang berpegang teguh pada petunjuk, yang berpaling dari kesia-siaan, yang zuhud di dunia, yang mendambakan akhirat, yang rela dengan ketetapan takdir, yang bersyukur atas nikmat, dan yang sabar atas cobaan.'
    }
  },
  {
    id: 'sholat_hajat',
    category: 'sunnah',
    categoryLabel: 'Sholat Sunnah',
    title: 'Sholat Hajat (Memohon Terkabulnya Impian/Urusan)',
    arabicTitle: 'صَلَاةُ الْحَاجَةِ',
    summary: 'Sholat sunnah yang dikerjakan saat memiliki hajat/keinginan tertentu agar dimudahkan dan dikabulkan oleh Allah SWT.',
    rakaat: '2 Rakaat (bisa sampai 12 rakaat)',
    waktuPelaksanaan: 'Kapan saja di luar waktu yang diharamkan untuk sholat (waktu terbaik: sepertiga malam terakhir).',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي سُنَّةَ الْحَاجَةِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى',
        latin: 'Ushallii sunnatal-haajati rok\'ataini lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat sunnah Hajat dua rakaat karena Allah Ta\'ala.'
      }
    },
    doaKhusus: {
      title: 'Doa Khusus Sholat Hajat (HR. Tirmidzi & Ibnu Majah)',
      arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ الْحَلِيمُ الْكَرِيمُ، سُبْحَانَ اللَّهِ رَبِّ الْعَرْشِ الْعَظِيمِ، الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، لَا تَدَعْ لِي ذَنْبًا إِلَّا غَفَرْتَهُ، وَلَا هَمًّا إِلَّا فَرَّجْتَهُ، وَلَا حَاجَةً هِيَ لَكَ رِضًا إِلَّا قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ',
      latin: 'Laa ilaaha illallaahul-Haliimul-Kariim, Subhaanallaahi Robbil-\'Arsyil-\'Azhiim, Al-Hamdu lillaahi Robbil-\'Aalamiin. As-aluka muujibaati rohmatik, wa \'azaa-ima maghfirotik, wal-ghoniimata min kulli birr, was-salaamata min kulli itsm, laa tada\' lii dzanban illaa ghofartah, wa laa hamman illaa farrojtah, wa laa haajatan hiya laka ridhon illaa qodhoitahaa Yaa Arhamar-Roohimiin.',
      translation: 'Tiada Tuhan selain Allah Yang Maha Penyantun lagi Maha Pemurah. Mahasuci Allah, Tuhan Pemilik \'Arsy yang agung. Segala puji bagi Allah Tuhan semesta alam. Aku memohon kepada-Mu segala hal yang mendatangkan rahmat-Mu, kepastian ampunan-Mu, keuntungan dari segala kebajikan, dan keselamatan dari segala dosa. Janganlah Engkau biarkan dosa padaku melainkan Engkau ampuni, janganlah Engkau biarkan kesusahan melainkan Engkau beri jalan keluar, dan tiada suatu hajat yang Engkau ridhai melainkan Engkau penuhi, wahai Dzat Yang Maha Pengasih lagi Maha Penyayang.'
    }
  },
  {
    id: 'sholat_taubat',
    category: 'sunnah',
    categoryLabel: 'Sholat Sunnah',
    title: 'Sholat Taubat (Menghapus Dosa & Khilaf)',
    arabicTitle: 'صَلَاةُ التَّوْبَةِ',
    summary: 'Sholat sunnah 2 rakaat yang dikerjakan saat seseorang menyesali dosa dan bertekad untuk kembali taat kepada Allah SWT.',
    rakaat: '2 Rakaat',
    waktuPelaksanaan: 'Kapan saja saat timbul kesadaran taubat (waktu terbaik: malam hari dalam suasana hening).',
    niat: {
      munfarid: {
        arabic: 'أُصَلِّي سُنَّةَ التَّوْبَةِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى',
        latin: 'Ushallii sunnatat-taubati rok\'ataini lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat sunnah Taubat dua rakaat karena Allah Ta\'ala.'
      }
    },
    doaKhusus: {
      title: 'Sayyidul Istighfar (Raja Istighfar Sesudah Sholat Taubat)',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      latin: 'Allaahumma Anta Robbii laa ilaaha illaa Anta, kholaqtanii wa ana \'abduka, wa ana \'alaa \'ahdika wa wa\'dika mastatho\'tu, a\'uudzu bika min syarri maa shona\'tu, abuu-u laka bini\'matika \'alayya, wa abuu-u bidzanbii faghfir lii fa-innahuu laa yaghfirudz-dzunuuba illaa Anta.',
      translation: 'Ya Allah, Engkaulah Tuhanku, tiada Tuhan selain Engkau. Engkau yang telah menciptakan aku dan aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang telah aku perbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku, karena sesungguhnya tidak ada yang dapat mengampuni dosa-dosa selain Engkau.'
    }
  },
  {
    id: 'sholat_jenazah',
    category: 'sunnah',
    categoryLabel: 'Fardhu Kifayah',
    title: 'Tata Cara Sholat Jenazah Lengkap (4 Takbir Tanpa Ruku\' & Sujud)',
    arabicTitle: 'صَلَاةُ الْجَنَازَةِ',
    summary: 'Sholat fardhu kifayah untuk mendoakan jenazah muslim dengan 4 kali takbir dalam posisi berdiri sempurna.',
    rakaat: '4 Takbir (Berdiri Penuh, Tanpa Ruku\' dan Sujud)',
    waktuPelaksanaan: 'Saat pengurusan jenazah sebelum dimakamkan.',
    niat: {
      imam: {
        arabic: 'أُصَلِّي عَلَىٰ هٰذَا الْمَيِّتِ أَرْبَعَ تَكْبِيرَاتٍ فَرْضَ الْكِفَايَةِ إِمَامًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii \'alaa haadzal-mayyiti arba\'a takbiiraatim fardhol-kifaayati imaaman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat atas jenazah (laki-laki) ini empat takbir fardhu kifayah sebagai imam karena Allah Ta\'ala.'
      },
      makmum: {
        arabic: 'أُصَلِّي عَلَىٰ هٰذَا الْمَيِّتِ أَرْبَعَ تَكْبِيرَاتٍ فَرْضَ الْكِفَايَةِ مَأْمُومًا لِلَّهِ تَعَالَى',
        latin: 'Ushallii \'alaa haadzal-mayyiti arba\'a takbiiraatim fardhol-kifaayati ma\'muuman lillaahi Ta\'aalaa.',
        translation: 'Aku berniat sholat atas jenazah (laki-laki) ini empat takbir fardhu kifayah sebagai makmum karena Allah Ta\'ala.'
      }
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Takbir 1 (Pertama): Membaca Surat Al-Fatihah',
        postureDescription: 'Mengangkat takbiratul ihram disertai niat sholat jenazah, bersedekap, lalu membaca ta\'awwudz dan Surat Al-Fatihah.',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ... (سُورَةُ الْفَاتِحَةِ)',
        latin: 'Bismillaahir-Rohmaanir-Rohiim... (Membaca Surat Al-Fatihah sampai akhir)',
        translation: 'Membaca Surat Al-Fatihah secara lengkap.'
      },
      {
        stepNumber: 2,
        title: 'Takbir 2 (Kedua): Membaca Sholawat atas Nabi SAW',
        postureDescription: 'Mengangkat tangan bertakbir kedua, bersedekap kembali, lalu membaca sholawat atas Nabi Muhammad SAW.',
        arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
        latin: 'Allaahumma sholli \'alaa Sayyidinaa Muhammad wa \'alaa aali Sayyidinaa Muhammad, kamaa shollaita \'alaa Sayyidinaa Ibroohiim wa \'alaa aali Sayyidinaa Ibroohiim. Wa baarik \'alaa Sayyidinaa Muhammad wa \'alaa aali Sayyidinaa Muhammad, kamaa baarokta \'alaa Sayyidinaa Ibroohiim wa \'alaa aali Sayyidinaa Ibroohiim, fil-\'aalamiina innaka Hamiidum-Majiid.',
        translation: 'Membaca Sholawat Ibrahimiyyah lengkap.'
      },
      {
        stepNumber: 3,
        title: 'Takbir 3 (Ketiga): Doa Pengampunan untuk Jenazah',
        postureDescription: 'Bertakbir ketiga, lalu mendoakan jenazah agar diampuni segala dosanya dan dirahmati.',
        arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مَدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ',
        latin: 'Allaahummaghfir lahuu warhamhu wa \'aafihii wa\'fu \'anhu, wa akrim nuzulahuu, wa wassi\' madkholahuu, waghsilhu bil-maa-i wats-tsalji wal-barod, wa naqqihii minal-khothooyaa kamaa yunaqqots-tsaubul-abyadhu minad-danas. (Jika jenazah perempuan, ubah "lahuu" menjadi "lahaa").',
        translation: 'Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia, dan maafkanlah kesalahannya. Muliakanlah tempat tinggalnya, luaskanlah kuburnya, mandikanlah dia dengan air, salju, dan embun. Dan bersihkanlah dia dari segala dosa sebagaimana dibersihkannya kain putih dari kotoran.'
      },
      {
        stepNumber: 4,
        title: 'Takbir 4 (Keempat): Doa Penutup & Salam',
        postureDescription: 'Bertakbir keempat, membaca doa untuk keluarga yang ditinggalkan dan kaum muslimin, kemudian menolehkan salam ke kanan dan kiri.',
        arabic: 'اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تَفْتِنَّا بَعْدَهُ وَاغْفِرْ لَنَا وَلَهُ\n\nالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
        latin: 'Allaahumma laa tahrimnaa ajrahuu wa laa taftinnaa ba\'dahuu waghfir lanaa wa lahuu.\n\nAs-Salaamu \'alaikum wa Rohmatullaahi wa Barokaatuh.',
        translation: 'Ya Allah, janganlah Engkau halangi kami dari pahalanya, dan janganlah Engkau beri kami fitnah sesudahnya, serta ampunilah kami dan dia.\n\nSemoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu sekalian.'
      }
    ]
  },

  // ===========================================================================
  // 4. PANDUAN WUDHU & TAYAMUM
  // ===========================================================================
  {
    id: 'panduan_wudhu',
    category: 'wudhu_tayamum',
    categoryLabel: 'Bersuci (Thaharah)',
    title: 'Tata Cara Wudhu Sesuai Sunnah',
    arabicTitle: 'كَيْفِيَّةُ الْوُضُوءِ',
    summary: 'Panduan bersuci dari hadats kecil sebagai syarat sah utama sebelum melaksanakan sholat.',
    keutamaan: 'Wudhu yang sempurna menggugurkan dosa-dosa dari anggota tubuh bersamaan dengan tetesan air wudhu (HR. Muslim).',
    steps: [
      {
        stepNumber: 1,
        title: '1. Niat & Membaca Bismillah',
        postureDescription: 'Berniat di dalam hati untuk menghilangkan hadats kecil dan mencuci kedua telapak tangan hingga pergelangan sebanyak 3 kali.',
        arabic: 'نَوَيْتُ الْوُضُوءَ لِرَفْعِ الْحَدَثِ الْأَصْغَرِ فَرْضًا لِلَّهِ تَعَالَى',
        latin: 'Nawaitul-wudhuu-a li-rof\'il-hadatsil-ashghori fardhon lillaahi Ta\'aalaa.',
        translation: 'Aku berniat wudhu untuk menghilangkan hadats kecil fardhu karena Allah Ta\'ala.'
      },
      {
        stepNumber: 2,
        title: '2. Berkumur-kumur & Istinsyaq (3x)',
        postureDescription: 'Memasukkan air ke dalam mulut untuk berkumur dan menghirup sebagian air ke hidung lalu mengeluarkannya sebanyak 3 kali.',
        latin: 'Berkumur-kumur dan membersihkan rongga hidung sebanyak 3 kali secara merata.'
      },
      {
        stepNumber: 3,
        title: '3. Membasuh Muka / Wajah (3x - RUKUN)',
        postureDescription: 'Membasuh seluruh wajah secara merata dari tempat tumbuhnya rambut kepala sampai bawah dagu, dan dari telinga kanan sampai telinga kiri.',
        note: 'Membasuh wajah adalah rukun wudhu yang wajib mengenai seluruh permukaan muka.'
      },
      {
        stepNumber: 4,
        title: '4. Membasuh Kedua Tangan Sampai Siku (3x - RUKUN)',
        postureDescription: 'Membasuh tangan kanan dari ujung jari hingga melebihi siku 3 kali, lalu tangan kiri 3 kali.',
        note: 'Pastikan sela-sela jari tangan terbasuh dan tidak ada kotoran yang menghalangi air (seperti cat/kutek).'
      },
      {
        stepNumber: 5,
        title: '5. Mengusap Sebagian Rambut Kepala (3x - RUKUN)',
        postureDescription: 'Mengusap sebagian kulit/rambut kepala dengan tangan yang basah sebanyak 3 kali.'
      },
      {
        stepNumber: 6,
        title: '6. Mengusap Kedua Daun Telinga (3x - Sunnah)',
        postureDescription: 'Memasukkan jari telunjuk ke lubang telinga dan ibu jari mengusap bagian belakang daun telinga sebanyak 3 kali.'
      },
      {
        stepNumber: 7,
        title: '7. Membasuh Kedua Kaki Sampai Mata Kaki (3x - RUKUN)',
        postureDescription: 'Membasuh kaki kanan hingga di atas mata kaki sebanyak 3 kali termasuk sela-sela jari kaki, lalu kaki kiri 3 kali.'
      },
      {
        stepNumber: 8,
        title: '8. Tertib & Membaca Doa Sesudah Wudhu',
        postureDescription: 'Menghadap kiblat dan mengangkat tangan sambil membaca doa sesudah wudhu.',
        arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ، وَاجْعَلْنِي مِنْ عِبَادِكَ الصَّالِحِينَ',
        latin: 'Asyhadu allaa ilaaha illallaahu wahdahuu laa syariika lah, wa asyhadu anna Muhammadan \'abduhuu wa Rasuuluh. Allaahummaj\'alnii minat-tawwaabiin, waj\'alnii minal-mutathohhiriin, waj\'alnii min \'ibaadikash-shoolihiin.',
        translation: 'Aku bersaksi bahwa tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya, dan aku bersaksi bahwa Nabi Muhammad adalah hamba dan utusan-Nya. Ya Allah, jadikanlah aku termasuk golongan orang-orang yang bertaubat, jadikanlah aku termasuk golongan orang-orang yang suci, dan jadikanlah aku termasuk hamba-hamba-Mu yang sholeh.',
        keutamaan: 'Barangsiapa berwudhu lalu membaca doa ini, maka akan dibukakan baginya 8 pintu surga dan ia boleh masuk dari pintu mana saja yang ia kehendaki (HR. Muslim).'
      }
    ]
  },
  {
    id: 'panduan_tayamum',
    category: 'wudhu_tayamum',
    categoryLabel: 'Bersuci (Thaharah)',
    title: 'Tata Cara Tayamum Pengganti Wudhu / Mandi',
    arabicTitle: 'كَيْفِيَّةُ التَّيَمُّمِ',
    summary: 'Rukhsah (keringanan) bersuci menggunakan debu yang suci ketika tidak ada air atau ada halangan medis menggunakan air.',
    niat: {
      munfarid: {
        arabic: 'نَوَيْتُ التَّيَمُّمَ لِاسْتِبَاحَةِ الصَّلَاةِ فَرْضًا لِلَّهِ تَعَالَى',
        latin: 'Nawaitut-tayammuma li-istibaahatish-sholaati fardhon lillaahi Ta\'aalaa.',
        translation: 'Aku berniat tayamum agar diperbolehkan melaksanakan sholat fardhu karena Allah Ta\'ala.'
      }
    },
    steps: [
      {
        stepNumber: 1,
        title: '1. Meletakkan Kedua Telapak Tangan pada Debu Suci',
        postureDescription: 'Menempelkan kedua telapak tangan ke permukaan yang berdebu bersih/suci (seperti dinding, kaca, batu), lalu meniupnya ringan agar debu kasar hilang.'
      },
      {
        stepNumber: 2,
        title: '2. Mengusap Wajah Disertai Niat',
        postureDescription: 'Mengusapkan kedua telapak tangan ke seluruh bagian wajah secara merata satu kali sambil menghadirkan niat di dalam hati.'
      },
      {
        stepNumber: 3,
        title: '3. Mengusap Kedua Tangan Sampai Siku',
        postureDescription: 'Menempelkan telapak tangan kembali ke debu di tempat berbeda, lalu mengusap tangan kanan mulai punggung tangan hingga siku dengan tangan kiri, lalu tangan kiri dengan tangan kanan.'
      }
    ]
  },

  // ===========================================================================
  // 5. SUJUD-SUJUD KHUSUS DALAM ISLAM
  // ===========================================================================
  {
    id: 'sujud_sahwi',
    category: 'sujud_khusus',
    categoryLabel: 'Sujud Khusus',
    title: 'Sujud Sahwi (Karena Lupa / Ragu dalam Sholat)',
    arabicTitle: 'سُجُودُ السَّهْوِ',
    summary: 'Dua kali sujud yang dilakukan di akhir sholat sebelum salam ketika seseorang lupa meninggalkan sunnah ab\'adh atau ragu jumlah rakaat.',
    arabicTitle: 'سُجُودُ السَّهْوِ',
    doaKhusus: {
      title: 'Bacaan Sujud Sahwi (Dibaca saat 2 kali sujud)',
      arabic: 'سُبْحَانَ مَنْ لَا يَنَامُ وَلَا يَسْهُو',
      latin: 'Subhaana Mal-laa yanaamu wa laa yas-huu.',
      translation: 'Mahasuci Dzat yang tidak pernah tidur dan tidak pernah lupa.',
      keutamaan: 'Menyempurnakan kekurangan sholat dan menghinakan setan yang membisikkan keraguan.'
    },
    ketentuanKhusus: [
      'Dilakukan sebanyak 2 kali sujud setelah membaca tasyahud akhir sebelum mengucapkan salam.',
      'Sebab dilakukannya: Ragu jumlah rakaat (ambil yang paling sedikit/yakin), kelebihan rakaat/ruku\' karena lupa, atau tertinggal Tasyahud Awal / Qunut.'
    ]
  },
  {
    id: 'sujud_tilawah',
    category: 'sujud_khusus',
    categoryLabel: 'Sujud Khusus',
    title: 'Sujud Tilawah (Saat Membaca / Mendengar Ayat Sajdah)',
    arabicTitle: 'سُجُودُ التِّلَاوَةِ',
    summary: 'Sujud satu kali yang disunnahkan ketika membaca atau mendengar ayat-ayat Sajdah dalam Al-Qur\'an (baik di dalam sholat maupun di luar sholat).',
    doaKhusus: {
      title: 'Bacaan Sujud Tilawah (HR. Abu Dawud & Tirmidzi)',
      arabic: 'سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ، وَصَوَّرَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ بِحَوْلِهِ وَقُوَّتِهِ، فَتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ',
      latin: 'Sajada wajhiya lilladzii kholaqohuu, wa showwarohuu, wa syaqqo sam\'ahuu wa bashorohuu bihauliihii wa quwwatih, fatabaarokallaahu Ahsanul-Khooliqiin.',
      translation: 'Bersujud wajahku kepada Dzat yang telah menciptakannya, membentuk rupanya, dan membuka pendengaran serta penglihatannya dengan daya dan kekuatan-Nya. Mahaberkah Allah, sebaik-baik Pencipta.'
    }
  },
  {
    id: 'sujud_syukur',
    category: 'sujud_khusus',
    categoryLabel: 'Sujud Khusus',
    title: 'Sujud Syukur (Saat Mendapat Nikmat / Terhindar dari Bahaya)',
    arabicTitle: 'سُجُودُ الشُّكْرِ',
    summary: 'Sujud satu kali di luar sholat sebagai ungkapan terima kasih yang mendalam atas nikmat besar yang baru datang atau terhindar dari musibah.',
    doaKhusus: {
      title: 'Bacaan Sujud Syukur',
      arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ',
      latin: 'Subhaanallaahi wal-hamdu lillaahi wa laa ilaaha illallaahu wallaahu Akbar. Robbi auzi\'nii an asykuro ni\'matakal-latii an\'amta \'alayya wa \'alaa waalidayya wa an a\'mala shoolihan tardhooh.',
      translation: 'Mahasuci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, dan Allah Maha Besar. Wahai Tuhanku, berilah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau anugerahkan kepadaku dan kepada kedua orang tuaku dan untuk mengerjakan kebajikan yang Engkau ridhai.'
    }
  },

  // ===========================================================================
  // 6. SYARAT SAH & RUKUN SHOLAT
  // ===========================================================================
  {
    id: 'rukun_syarat_sholat',
    category: 'syarat_rukun',
    categoryLabel: 'Fikih Sholat',
    title: 'Syarat Sah, Syarat Wajib & 13 Rukun Sholat',
    arabicTitle: 'شُرُوطُ وَأَرْكَانُ الصَّلَاةِ',
    summary: 'Ketentuan pokok dalam fikih Islam yang menentukan sah tidaknya sholat seseorang.',
    ketentuanKhusus: [
      'Syarat Wajib Sholat: 1. Islam, 2. Baligh, 3. Berakal sehat, 4. Suci dari haid & nifas, 5. Sampai dakwah Islam.',
      'Syarat Sah Sholat: 1. Suci dari hadats kecil & besar, 2. Suci badan, pakaian, dan tempat dari najis, 3. Menutup aurat, 4. Mengetahui masuknya waktu sholat, 5. Menghadap kiblat.',
      '13 Rukun Sholat (Jika salah satu ditinggalkan sengaja/lupa maka sholat batal): 1. Niat, 2. Berdiri bagi yang mampu, 3. Takbiratul Ihram, 4. Membaca Surat Al-Fatihah, 5. Ruku\' disertai tuma\'ninah, 6. I\'tidal disertai tuma\'ninah, 7. Sujud 2 kali disertai tuma\'ninah, 8. Duduk di antara dua sujud disertai tuma\'ninah, 9. Duduk Tasyahud Akhir, 10. Membaca Tasyahud Akhir, 11. Membaca Sholawat atas Nabi SAW di Tasyahud Akhir, 12. Mengucapkan Salam yang pertama, 13. Tertib (berurutan).'
    ]
  }
];
