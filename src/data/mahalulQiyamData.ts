export interface MahalulQiyamVerse {
  id: number;
  arabic: string;
  latin: string;
  translation: string;
  isReff?: boolean;
  section?: 'salam' | 'pujian' | 'syauq' | 'marhaban' | 'doa';
}

export const MAHALUL_QIYAM_DATA: MahalulQiyamVerse[] = [
  // 1. BAIT SALAM UTAMA (REFF)
  {
    id: 1,
    isReff: true,
    section: 'salam',
    arabic: 'يَا نَبِي سَلَامْ عَلَيْكَ • يَا رَسُوْلْ سَلَامْ عَلَيْكَ\nيَا حَبِيْبْ سَلَامْ عَلَيْكَ • صَلَوَاتُ اللهِ عَلَيْكَ',
    latin: 'Yaa Nabii salaam \'alaika • Yaa Rasuul salaam \'alaika\nYaa Habiib salaam \'alaika • Sholawaatullaah \'alaika',
    translation: 'Wahai Nabi, salam sejahtera untukmu • Wahai Rasul, salam sejahtera untukmu\nWahai Kekasih, salam sejahtera untukmu • Shalawat Allah senantiasa tercurah untukmu.',
  },

  // 2. BAIT PUJIAN CAHAYA PURNAMA
  {
    id: 2,
    section: 'pujian',
    arabic: 'أَشْرَقَ الْبَدْرُ عَلَيْنَا • فَاخْتَفَتْ مِنْهُ الْبُدُوْرُ\nمِثْلَ حُسْنِكْ مَا رَأَيْنَا • قَطُّ يَا وَجْهَ السُّرُوْرِ',
    latin: 'Asyroqol badru \'alainaa • Fakhtafat minhul buduuru\nMitsla husnik maa ro-ainaa • Qotthu yaa wajhas-suruuri',
    translation: 'Telah terbit bulan purnama menyinari kami • Maka reduplah segala rembulan lainnya\nKeindahan sepertimu tak pernah kami lihat • Sama sekali, wahai wajah yang penuh kegembiraan.',
  },
  {
    id: 3,
    section: 'pujian',
    arabic: 'أَنْتَ شَمْسٌ أَنْتَ بَدْرٌ • أَنْتَ نُوْرٌ فَوْقَ نُوْرِ\nأَنْتَ إِكْسِيْرٌ وَغَالِي • أَنْتَ مِصْبَاحُ الصُّدُوْرِ',
    latin: 'Anta syamsun anta badrun • Anta nuurun fawqo nuuri\nAnta iksiirun wa ghaalii • Anta mishbaahush-shuduuri',
    translation: 'Engkau laksana matahari, engkau laksana bulan purnama • Engkau adalah cahaya di atas segala cahaya\nEngkau adalah permata mulia yang tak ternilai harganya • Engkau adalah pelita penerang hati manusia.',
  },
  {
    id: 4,
    section: 'pujian',
    arabic: 'يَا حَبِيْبِي يَا مُحَمَّدُ • يَا عَرُوْسَ الْخَافِقَيْنِ\nيَا مُؤَيَّدُ يَا مُمَجَّدُ • يَا إِمَامَ الْقِبْلَتَيْنِ',
    latin: 'Yaa habiibii yaa Muhammad • Yaa \'aruusal-khoofiqoini\nYaa mu-ayyadu yaa mumajjad • Yaa imaamal-qiblataini',
    translation: 'Wahai kekasihku, wahai Nabi Muhammad • Wahai pengantin penghulu timur dan barat\nWahai sosok yang dikokohkan wahyu lagi dimuliakan • Wahai imam dua kiblat.',
  },
  {
    id: 5,
    section: 'pujian',
    arabic: 'مَنْ رَأَى وَجْهَكَ يَسْعَدْ • يَا كَرِيْمَ الْوَالِدَيْنِ\nحَوْضُكَ الصَّافِي الْمُبَرَّدْ • وِرْدُنَا يَوْمَ النُّشُوْرِ',
    latin: 'Man ro-aa wajhaka yas\'ad • Yaa kariimal-waalidaini\nHawdhukash-shoofil-mubarrod • Wirdunaa yauman-nusyuuri',
    translation: 'Siapa pun yang memandang wajahmu pasti berbahagia • Wahai insan yang mulia kedua orang tuanya\nTelagamu yang jernih lagi sejuk menyegarkan • Menjadi sumber minum kami di hari kebangkitan.',
  },

  // 3. BAIT MUKJIZAT & KERINDUAN ALAM SEMESTA
  {
    id: 6,
    section: 'syauq',
    arabic: 'مَا رَأَيْنَا الْعِيْسَ حَنَّتْ • بِالسُّرَى إِلَّا إِلَيْكَ\nوَالْغَمَامَةْ قَدْ أَظَلَّتْ • وَالْمَلَا صَلُّوْا عَلَيْكَ',
    latin: 'Maa ro-ainal-\'iisa hannat • Bis-suroo illaa ilaika\nWal-ghomaamah qod azhollat • Wal-malaa sholluu \'alaika',
    translation: 'Belum pernah kami melihat unta merintih rindu berjalan malam hari • Kecuali hanya menuju kepadamu\nDan awan senantiasa berarak memayungimu • Serta para malaikat bershalawat untukmu.',
  },
  {
    id: 7,
    section: 'syauq',
    arabic: 'وَأَتَاكَ الْعُوْدُ يَبْكِي • وَتَذَلَّلْ بَيْنَ يَدَيْكَ\nوَاسْتَجَارَتْ يَا حَبِيْبِي • عِنْدَكَ الظَّبْيُ النُّفُوْرُ',
    latin: 'Wa ataakal-\'uudu yabkii • Wa tadzallal baina yadaika\nWastajaarot yaa habiibii • \'Indakazh-zhabyun-nufuuru',
    translation: 'Dan sebatang pohon kurma datang menangis kepadamu • Merendahkan diri tersungkur di hadapanmu\nDan rusa yang liar itu memohon perlindungan • Kepadamu, wahai kekasih yang penyayang.',
  },
  {
    id: 8,
    section: 'syauq',
    arabic: 'عِنْدَمَا شَدُّوْا الْحُمُوْلَا • وَتَنَادَوْا لِلرَّحِيْلِ\nجِئْتُهُمْ وَالدَّمْعُ سَائِلْ • قُلْتُ قِفْ لِي يَا دَلِيْلُ',
    latin: '\'Indamaa syaddul-humuulaa • Wa tanaadau lir-rohiili\nJi\'tuhum wad-dam\'u saa-il • Qultu qif lii yaa daliilu',
    translation: 'Ketika para kafilah mengikat muatan bekal • Dan berseru untuk segera berangkat\nAku mendatangi mereka dengan air mata bercucuran • Kukatakan: Berhentilah sejenak wahai penunjuk jalan!',
  },
  {
    id: 9,
    section: 'syauq',
    arabic: 'وَاتَّحِمْ لِي رَسَائِلْ • أَيُّهَا الشَّوْقُ الْجَزِيْلُ\nنَحْوَ هَاتِيْكَ الْمَنَازِلْ • بِالْعَشِيِّ وَالْبُكُوْرِ',
    latin: 'Watta-him lii rosaa-il • Ayyuhasy-syauqul-jaziilu\nNahwa haatiikal-manaazil • Bil-\'asyiyyi wal-bukuuri',
    translation: 'Tolong bawakan surat-surat rinduku • Wahai rasa rindu yang membuncah amat besar\nMenuju kota tempat tinggal kekasih Nabi tercinta • Di kala sore maupun waktu fajar menyingsing.',
  },
  {
    id: 10,
    section: 'syauq',
    arabic: 'كُلُّ مَنْ فِي الْكَوْنِ هَامُوْا • فِيْكَ يَا بَاهِي الْجَبِيْنِ\nوَلَهُمْ فِيْكَ غَرَامُ • وَاشْتِيَاقُ وَحَنِيْنُ',
    latin: 'Kullu man fil-kawni haamuu • Fiika yaa baahil-jabiini\nWa lahum fiika ghoroomu • Wasytiyaaquw wa haniinu',
    translation: 'Semua penghuni alam semesta mabuk kepayang rindu • Kepadamu wahai insan yang bercahaya dahinya\nDan mereka memiliki rasa cinta yang mendalam • Serta kerinduan dan getaran cinta kepadamu.',
  },

  // 4. BAIT MARHABAN (SAMBUTAN KEHADIRAN)
  {
    id: 11,
    section: 'marhaban',
    arabic: 'مَرْحَبًا يَا مَرْحَبًا يَا نُوْرَ عَيْنِي • مَرْحَبًا جَدَّ الْحُسَيْنِ مَرْحَبًا\nمَرْحَبًا يَا خَيْرَ دَاعٍ • مَرْحَبًا يَا خَيْرَ هَادٍ',
    latin: 'Marhaban yaa marhaban yaa nuuro \'ainii • Marhaban jaddal-Husaini marhaban\nMarhaban yaa khoiro daa\'in • Marhaban yaa khoiro haadin',
    translation: 'Selamat datang, selamat datang wahai penyejuk mataku • Selamat datang wahai kakek dari Sayyidina Husain\nSelamat datang wahai sebaik-baik penyeru kebenaran • Selamat datang wahai sebaik-baik pembawa petunjuk.',
  },
  {
    id: 12,
    section: 'marhaban',
    arabic: 'صَلَّى اللهُ عَلَى مُحَمَّدْ • صَلَّى اللهُ عَلَيْهِ وَسَلَّمْ\nصَلَّى اللهُ عَلَى مُحَمَّدْ • يَا رَبِّ صَلِّ وَسَلِّمْ',
    latin: 'Shollallaahu \'alaa Muhammad • Shollallaahu \'alaihi wa sallam\nShollallaahu \'alaa Muhammad • Yaa Robbi sholli wa sallim',
    translation: 'Semoga shalawat Allah tercurah kepada Nabi Muhammad • Semoga shalawat dan salam tercurah kepadanya\nSemoga shalawat Allah tercurah kepada Nabi Muhammad • Wahai Tuhanku limpahkanlah shalawat dan keselamatan.',
  },

  // 5. DOA PENUTUP MAHALUL QIYAM & TAWASSUL
  {
    id: 13,
    section: 'doa',
    arabic: 'رَبِّ فَاغْفِرْ لِي ذُنُوْبِي • بِبَرْكَةِ الْهَادِي الْمُحَمَّدْ\nيَا الله بِهَا يَا الله بِهَا • يَا الله بِحُسْنِ الْخَاتِمَةْ',
    latin: 'Robbi faghfir lii dzunuubii • Bibarkatil-Haadil-Muhammad\nYaa Allaah bihaa yaa Allaah bihaa • Yaa Allaah bihusnil-khootimah',
    translation: 'Wahai Tuhanku, ampunilah segala dosa-dosaku • Berkat keberkahan Nabi Muhammad sang pembawa petunjuk\nYa Allah anugerahilah kami • Ya Allah wafatkanlah kami dalam keadaan husnul khatimah.',
  },
  {
    id: 14,
    section: 'doa',
    arabic: 'وَصَلَاةُ اللهِ تَغْشَى • أَحْمَدَ الْهَادِي الْأَمِيْنَ\nوَآلِهِ وَصَحْبِهِ • وَجَمِيْعِ التَّابِعِيْنَ',
    latin: 'Wa sholaatullaahi taghsyaa • Ahmadal-haadil-amiina\nWa aalihii wa shohbihii • Wa jamii\'it-taabi\'iina',
    translation: 'Dan semoga shalawat Allah senantiasa melimpah • Kepada Nabi Ahmad sang pembawa petunjuk yang terpercaya\nBeserta segenap keluarga, para sahabat • Dan seluruh pengikut beliau hingga akhir zaman.',
  },
];
