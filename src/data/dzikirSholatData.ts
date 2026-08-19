export interface DzikirSholatItem {
  id: number;
  section: 'istighfar_salam' | 'ayat' | 'tasbih33' | 'doa_sholat';
  sectionName: string;
  title: string;
  targetCount?: number;
  countLabel?: string;
  arabic: string;
  latin: string;
  translation: string;
  fadhilah?: string;
}

export const DZIKIR_SHOLAT_DATA: DzikirSholatItem[] = [
  // 1. ISTIGHFAR & KALIMAT TAUHID
  {
    id: 1,
    section: 'istighfar_salam',
    sectionName: 'Istighfar & Salam',
    title: 'Istighfar (3 Kali)',
    targetCount: 3,
    countLabel: 'Dibaca 3x',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    latin: 'Astaghfirullaahal-\'Azhiim, alladzii laa ilaaha illaa Huwal-Hayyul-Qoyyuumu wa atuubu ilaih.',
    translation: 'Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan yang berhak disembah selain Dia, Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya.',
    fadhilah: 'Rasulullah SAW senantiasa beristighfar 3 kali setiap kali selesai sholat fardhu (HR. Muslim).',
  },
  {
    id: 2,
    section: 'istighfar_salam',
    sectionName: 'Istighfar & Salam',
    title: 'Kalimat Tauhid & Pujian Kerajaan Allah',
    targetCount: 3,
    countLabel: 'Dibaca 3x (10x setelah Subuh & Maghrib)',
    arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    latin: 'Laa ilaaha illallaahu wahdahuu laa syariika lah, lahul-mulku wa lahul-hamdu yuhyii wa yumiitu wa Huwa \'alaa kulli syai-in qodiir.',
    translation: 'Tiada Tuhan yang berhak disembah selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya segala kerajaan dan bagi-Nya segala pujian. Dia yang menghidupkan dan mematikan, dan Dia Mahakuasa atas segala sesuatu.',
  },
  {
    id: 3,
    section: 'istighfar_salam',
    sectionName: 'Istighfar & Salam',
    title: 'Doa Keselamatan (Allahumma Antas-Salam)',
    targetCount: 1,
    countLabel: 'Dibaca 1x',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    latin: 'Allaahumma Antas-Salaamu wa minkas-salaam, tabaarokta Yaa Dzal-Jalaali wal-Ikroom.',
    translation: 'Ya Allah, Engkaulah Dzat Yang Memberi Keselamatan, dan dari-Mu lah segala keselamatan. Mahaberkah Engkau wahai Tuhan Pemilik Keagungan dan Kemuliaan.',
  },
  {
    id: 4,
    section: 'istighfar_salam',
    sectionName: 'Istighfar & Salam',
    title: 'Doa Ketetapan Takdir & Penyerahan Diri',
    targetCount: 1,
    countLabel: 'Dibaca 1x',
    arabic: 'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    latin: 'Allaahumma laa maani\'a limaa a\'thoita, wa laa mu\'thiya limaa mana\'ta, wa laa yanfa\'u dzal-jaddi minkal-jadd.',
    translation: 'Ya Allah, tiada yang dapat mencegah apa yang Engkau berikan, tiada yang dapat memberi apa yang Engkau cegah, dan tiada berguna kekayaan/kemuliaan bagi orang yang memilikinya dari siksaan-Mu.',
  },
  {
    id: 5,
    section: 'istighfar_salam',
    sectionName: 'Istighfar & Salam',
    title: 'Doa Memohon Bimbingan Berdzikir & Bersyukur',
    targetCount: 1,
    countLabel: 'Dibaca 1x',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    latin: 'Allaahumma a\'innii \'alaa dzikrika wa syukrika wa husni \'ibaadatik.',
    translation: 'Ya Allah, tolonglah dan bimbinglah aku untuk senantiasa mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan sebaik-baiknya kepada-Mu.',
    fadhilah: 'Wasiat khusus Rasulullah SAW kepada sahabat Mu\'adz bin Jabal RA agar tidak ditinggalkan sehabis sholat.',
  },

  // 2. AYAT-AYAT PILIHAN
  {
    id: 6,
    section: 'ayat',
    sectionName: 'Ayat & Surat Pilihan',
    title: 'Membaca Surat Al-Fatihah',
    targetCount: 1,
    countLabel: 'Dibaca 1x',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
    latin: 'Bismillaahir-rohmaanir-rohiim. Al-hamdu lillaahi robbil-\'aalamiin. Ar-rohmaanir-rohiim. Maaliki yaumid-diin. Iyyaaka na\'budu wa iyyaaka nasta\'iin. Ihdinash-shiroothol-mustaqiim. Shiroothol-ladziina an\'amta \'alaihim ghoiril-maghdhuubi \'alaihim waladh-dhoolliin. Aamiin.',
    translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya, bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.',
  },
  {
    id: 7,
    section: 'ayat',
    sectionName: 'Ayat & Surat Pilihan',
    title: 'Ayat Kursi (QS. Al-Baqarah: 255)',
    targetCount: 1,
    countLabel: 'Dibaca 1x',
    arabic: 'اللَّهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    latin: 'Allaahu laaa ilaaha illaa Huwal-Hayyul-Qoyyuum, laa ta\'khudzuhuu sinatuw wa laa naum, lahuu maa fis-samaawaati wa maa fil-ardh, man dzal-ladzii yasyfa\'u \'indahuuu illaa bi-idznih, ya\'lamu maa baina aidiihim wa maa kholfahum, wa laa yuhiithuuna bisyai-im min \'ilmihiii illaa bimaa syaaa\', wasi\'a Kursiyyuhus-samaawaati wal-ardh, wa laa ya-uuduhuu hifzhuhumaa, wa Huwal-\'Aliyyul-\'Azhiim.',
    translation: 'Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya (ilmu dan kekuasaan-Nya) meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Mahatinggi, Mahabesar.',
    fadhilah: 'Barangsiapa membaca Ayat Kursi sehabis setiap sholat fardhu, tidak ada yang menghalanginya masuk surga selain kematian (HR. An-Nasa\'i).',
  },
  {
    id: 8,
    section: 'ayat',
    sectionName: 'Ayat & Surat Pilihan',
    title: 'Surat Al-Ikhlas, Al-Falaq & An-Nas (Al-Mu\'awwidzat)',
    targetCount: 1,
    countLabel: 'Dibaca 1x (3x setelah Subuh & Maghrib)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ﴿٤﴾\n\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِنْ شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾',
    latin: 'Qul Huwallaahu Ahad. Allaahush-Shomad... \nQul a\'uudzu birobbil-falaq... \nQul a\'uudzu birobbin-naas...',
    translation: 'Membaca tiga surat perlindungan utama: Surat Al-Ikhlas, Surat Al-Falaq, dan Surat An-Nas.',
  },

  // 3. TASBIH, TAHMID & TAKBIR (33x)
  {
    id: 9,
    section: 'tasbih33',
    sectionName: 'Tasbih 33x',
    title: 'Tasbih (Maha Suci Allah)',
    targetCount: 33,
    countLabel: 'Dibaca 33x',
    arabic: 'سُبْحَانَ اللَّهِ',
    latin: 'Subhaanallaah.',
    translation: 'Mahasuci Allah.',
  },
  {
    id: 10,
    section: 'tasbih33',
    sectionName: 'Tasbih 33x',
    title: 'Tahmid (Segala Puji Bagi Allah)',
    targetCount: 33,
    countLabel: 'Dibaca 33x',
    arabic: 'الْحَمْدُ لِلَّهِ',
    latin: 'Al-hamdulillaah.',
    translation: 'Segala puji bagi Allah.',
  },
  {
    id: 11,
    section: 'tasbih33',
    sectionName: 'Tasbih 33x',
    title: 'Takbir (Allah Maha Besar)',
    targetCount: 33,
    countLabel: 'Dibaca 33x',
    arabic: 'اللَّهُ أَكْبَرُ',
    latin: 'Allaahu Akbar.',
    translation: 'Allah Mahabesar.',
  },
  {
    id: 12,
    section: 'tasbih33',
    sectionName: 'Tasbih 33x',
    title: 'Penyempurna Menjadi 100',
    targetCount: 1,
    countLabel: 'Dibaca 1x sebagai penggenap ke-100',
    arabic: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا، لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    latin: 'Allaahu Akbaru kabiiron, wal-hamdu lillaahi katsiiron, wa subhaanallaahi bukrotaw wa ashiilaa. Laa ilaaha illallaahu wahdahuu laa syariika lah, lahul-mulku wa lahul-hamdu yuhyii wa yumiitu wa Huwa \'alaa kulli syai-in qodiir. Wa laa hawla wa laa quwwata illaa billaahil-\'Aliyyil-\'Azhiim.',
    translation: 'Allah Mahabesar dengan segala kebesaran-Nya, segala puji yang banyak bagi Allah, dan Mahasuci Allah di waktu pagi dan petang. Tiada Tuhan selain Allah Yang Maha Esa tiada sekutu bagi-Nya. Milik-Nya segala kerajaan dan pujian, Dia yang menghidupkan dan mematikan, dan Dia Mahakuasa atas segala sesuatu. Serta tiada daya dan upaya kecuali dengan pertolongan Allah Yang Mahatinggi lagi Mahaagung.',
    fadhilah: 'Barangsiapa bertasbih 33x, bertahmid 33x, bertakbir 33x dan menyempurnakan ke-100 dengan kalimat ini, diampuni dosa-dosanya walau sebanyak buih di lautan (HR. Muslim).',
  },

  // 4. SUSUNAN DOA LENGKAP SESUDAH SHOLAT
  {
    id: 13,
    section: 'doa_sholat',
    sectionName: 'Doa Ba\'da Sholat',
    title: 'Doa Bagian 1: Pembuka Hamdalah & Shalawat',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيدَهُ، يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ. اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ',
    latin: 'Bismillaahir-rohmaanir-rohiim. Al-hamdu lillaahi Robbil-\'aalamiin, hamdan yuwaafii ni\'amahuu wa yukaafi-u maziidah, yaa Robbanaa lakal-hamdu kamaa yambaghii lijalaali wajhika wa \'azhiimi sulthoonik. Allaahumma sholli wa sallim \'alaa Sayyidinaa Muhammadin wa \'alaa aali Sayyidinaa Muhammad.',
    translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Segala puji bagi Allah Tuhan semesta alam, pujian yang sebanding dengan nikmat-nikmat-Nya dan menjamin tambahannya. Wahai Tuhan kami, bagi-Mu segala puji sebagaimana layak bagi keagungan Zat-Mu dan kebesaran kekuasaan-Mu. Ya Allah, limpahkanlah shalawat dan salam kepada junjungan kami Nabi Muhammad beserta keluarganya.',
  },
  {
    id: 14,
    section: 'doa_sholat',
    sectionName: 'Doa Ba\'da Sholat',
    title: 'Doa Bagian 2: Keselamatan Agama, Fisik, Rezeki & Husnul Khatimah',
    arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ سَلَامَةً فِي الدِّينِ، وَعَافِيَةً فِي الْجَسَدِ، وَزِيَادَةً فِي الْعِلْمِ، وَبَرَكَةً فِي الرِّزْقِ، وَتَوْبَةً قَبْلَ الْمَوْتِ، وَرَحْمَةً عِنْدَ الْمَوْتِ، وَمَغْفِرَةً بَعْدَ الْمَوْتِ. اللَّهُمَّ هَوِّنْ عَلَيْنَا فِي سَكَرَاتِ الْمَوْتِ، وَالنَّجَاةَ مِنَ النَّارِ، وَالْعَفْوَ عِنْدَ الْحِسَابِ',
    latin: 'Allaahumma innaa nas-aluka salaamatan fid-diin, wa \'aafiyatan fil-jasad, wa ziyaadatan fil-\'ilmi, wa barakatan fir-rizqi, wa taubatan qoblal-maut, wa rohmatan \'indal-maut, wa maghfirotan ba\'dal-maut. Allaahumma hawwin \'alainaa fii sakarootil-maut, wan-najaata minan-naari, wal-\'afwa \'indal-hisaab.',
    translation: 'Ya Allah, sesungguhnya kami memohon kepada-Mu keselamatan dalam agama, kesehatan pada badan, bertambahnya ilmu pengetahuan, keberkahan dalam rezeki, taubat sebelum datangnya maut, rahmat ketika menghadapi maut, dan ampunan setelah mati. Ya Allah, mudahkanlah bagi kami saat menghadapi sakaratul maut, selamatkanlah kami dari siksa api neraka, dan berikanlah ampunan saat hisab (perhitungan amal).',
  },
  {
    id: 15,
    section: 'doa_sholat',
    sectionName: 'Doa Ba\'da Sholat',
    title: 'Doa Bagian 3: Keteguhan Iman & Orang Tua',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً ۚ إِنَّكَ أَنْتَ الْوَهَّابُ. رَبَّنَا اغْفِرْ لَنَا وَلِوَالِدَيْنَا وَلِجَمِيعِ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ',
    latin: 'Robbanaa laa tuzigh quluubanaa ba\'da idz hadaitanaa wa hab lanaa mil ladunka rohmah, innaka Antal-Wahhaab. Robbanaaghfir lanaa wa liwaalidiinaa wa lijamii\'il-muslimiina wal-muslimaati wal-mu\'miniina wal-mu\'minaati al-ahyaa-i minhum wal-amwaat.',
    translation: 'Wahai Tuhan kami, janganlah Engkau condongkan hati kami kepada kesesatan setelah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu, sesungguhnya Engkaulah Yang Maha Pemberi. Wahai Tuhan kami, ampunilah dosa-dosa kami, dosa kedua orang tua kami, dan dosa seluruh kaum muslimin dan muslimat, mukminin dan mukminat, baik yang masih hidup maupun yang telah wafat.',
  },
  {
    id: 16,
    section: 'doa_sholat',
    sectionName: 'Doa Ba\'da Sholat',
    title: 'Doa Bagian 4: Sapu Jagad & Penutup',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. وَصَلَّى اللَّهُ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلَّمَ، وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    latin: 'Robbanaa aatinaa fid-dunyaa hasanataw wa fil-aakhiroti hasanataw wa qinaa \'adzaaban-naar. Wa shollallaahu \'alaa Sayyidinaa Muhammadin wa \'alaa aalihii wa shohbihii wa sallam, wal-hamdu lillaahi Robbil-\'aalamiin.',
    translation: 'Wahai Tuhan kami, anugerahilah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami dari siksaan api neraka. Dan semoga shalawat serta salam senantiasa tercurah kepada junjungan kami Nabi Muhammad, beserta keluarga dan sahabat beliau. Dan segala puji bagi Allah, Tuhan semesta alam.',
  },
];
