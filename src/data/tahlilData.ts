export interface TahlilItem {
  id: number;
  section: 'tawasul' | 'surat' | 'dzikir' | 'doa';
  title: string;
  count?: string;
  arabic: string;
  latin: string;
  translation: string;
}

export const TAHLIL_DATA: TahlilItem[] = [
  // 1. TAWASUL / PENGANTAR HADHRAT
  {
    id: 1,
    section: 'tawasul',
    title: '1. Pengantar Tawasul Rasulullah SAW',
    count: 'Dibaca 1x dilanjutkan Al-Fatihah',
    arabic: 'إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَآلِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَهْلِ بَيْتِهِ الْكِرَامِ، لَهُمُ الْفَاتِحَةُ...',
    latin: 'Ilaa hadhrotin-nabiyyil-mushthofaa Muhammadin shollallaahu \'alaihi wa sallama wa aalihii wa azwaajihii wa dzurriyyatihii wa ahli baitihil-kiroom, lahumul-Faatihah...',
    translation: 'Kepada yang mulia Nabi Terpilih Muhammad SAW, segenap keluarga, istri-istri, keturunan, dan ahli baitnya yang mulia. (Membaca Al-Fatihah)',
  },
  {
    id: 2,
    section: 'tawasul',
    title: '2. Tawasul Para Nabi, Sahabat & Ulama',
    count: 'Dibaca 1x dilanjutkan Al-Fatihah',
    arabic: 'ثُمَّ إِلَى حَضْرَاتِ إِخْوَانِهِ مِنَ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ وَالْأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِينَ وَالصَّحَابَةِ وَالتَّابِعِينَ وَالْعُلَمَاءِ الْعَامِلِينَ وَالْمُصَنِّفِينَ الْمُخْلِصِينَ وَجَمِيعِ الْمَلَائِكَةِ الْمُقَرَّبِينَ، خُصُوصًا سَيِّدِنَا الشَّيْخِ عَبْدِ الْقَادِرِ الْجَيْلَانِيِّ، لَهُمُ الْفَاتِحَةُ...',
    latin: 'Tsumma ilaa hadhrooti ikhwaanihii minal-ambiyaaa-i wal-mursaliin, wal-auliyaaa-i wasy-syuhadaaa-i wash-shoolihiina wash-shohaabati wat-taabi\'iina wal-\'ulamaaa-il-\'aamiliina wal-mushonnifiinal-mukhlishiina wa jamii\'il-malaaa-ikatil-muqorrobiin, khushuushan sayyidinasy-Syaikhi \'Abdil Qoodir Al-Jailaanii, lahumul-Faatihah...',
    translation: 'Kemudian kepada para saudara beliau dari kalangan para nabi, rasul, para wali, syuhada, orang-orang saleh, para sahabat, tabi\'in, para ulama yang mengamalkan ilmunya, pengarang yang ikhlas, dan segenap malaikat muqarrabin, terkhusus Syaikh Abdul Qadir Al-Jailani. (Membaca Al-Fatihah)',
  },
  {
    id: 3,
    section: 'tawasul',
    title: '3. Tawasul Para Orang Tua, Guru & Ahli Kubur (Arwah)',
    count: 'Dibaca 1x dilanjutkan Al-Fatihah',
    arabic: 'ثُمَّ إِلَى جَمِيعِ أَهْلِ الْقُبُورِ مِنَ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ مِنْ مَشَارِقِ الْأَرْضِ إِلَى مَغَارِبِهَا بَرِّهَا وَبَحْرِهَا، خُصُوصًا آبَاءَنَا وَأُمَّهَاتِنَا وَأَجْدَادَنَا وَجَدَّاتِنَا وَمَشَايِخَنَا وَمُعَلِّمِينَا وَلِمَنِ احْتَمَعْنَا هٰهُنَا بِسَبَبِهِ وَخُصُوصًا إِلَى رُوحِ (...sebut nama almarhum/ah...)، لَهُمُ الْفَاتِحَةُ...',
    latin: 'Tsumma ilaa jamii\'i ahlil-qubuuri minal-muslimiina wal-muslimaati wal-mu\'miniina wal-mu\'minaati mim masyaariqil-ardhi ilaa maghooribihaa barrihaa wa bahrihaa, khushuushan aabaaa-anaa wa ummahaatinaa wa ajdaadanaa wa jaddaatinaa wa masyaayikhonaa wa mu\'allimiinaa wa limanihtama\'naa haahunaa bisababihii wa khushuushan ilaa ruuhi (...sebut nama almarhum/ah...), lahumul-Faatihah...',
    translation: 'Kemudian kepada seluruh ahli kubur kaum muslimin dan muslimat, mukminin dan mukminat dari timur hingga barat, di darat maupun di laut, khususnya bapak-ibu kami, kakek-nenek kami, para guru dan pengajar kami, serta siapa saja yang menjadi sebab kami berkumpul di sini, dan terkhusus kepada arwah (...sebut nama almarhum/ah...). (Membaca Al-Fatihah)',
  },

  // 2. SURAT-SURAT PENDEK TAHLIL
  {
    id: 4,
    section: 'surat',
    title: '4. Surat Al-Ikhlas',
    count: 'Dibaca 3x',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ﴿٤﴾',
    latin: 'Bismillaahir-rohmaanir-rohiim. Qul huwallaahu ahad. Allaahush-shomad. Lam yalid wa lam yuulad. Wa lam yakul lahuu kufuwan ahad. (3x)',
    translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia."',
  },
  {
    id: 5,
    section: 'dzikir',
    title: '5. Tahlil & Takbir Penyela',
    count: 'Dibaca 1x',
    arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
    latin: 'Laa ilaaha illallaahu wallaahu akbar wa lillaahil-hamd.',
    translation: 'Tiada Tuhan selain Allah, Allah Maha Besar, dan segala puji hanya bagi Allah.',
  },
  {
    id: 6,
    section: 'surat',
    title: '6. Surat Al-Falaq',
    count: 'Dibaca 1x',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِنْ شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾',
    latin: 'Bismillaahir-rohmaanir-rohiim. Qul a\'uudzu birobbil-falaq. Min syarri maa kholaq. Wa min syarri ghoosiqin idzaa waqob. Wa min syarrin-naffaatsaati fil-\'uqod. Wa min syarri haasidin idzaa hasad.',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk yang Dia ciptakan, dari kejahatan malam apabila telah gelap gulita, dari kejahatan wanita-wanita penyihir yang meniup pada buhul-buhul, dan dari kejahatan orang yang dengki apabila dia dengki."',
  },
  {
    id: 7,
    section: 'dzikir',
    title: '7. Tahlil & Takbir Penyela',
    count: 'Dibaca 1x',
    arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
    latin: 'Laa ilaaha illallaahu wallaahu akbar wa lillaahil-hamd.',
    translation: 'Tiada Tuhan selain Allah, Allah Maha Besar, dan segala puji hanya bagi Allah.',
  },
  {
    id: 8,
    section: 'surat',
    title: '8. Surat An-Nas',
    count: 'Dibaca 1x',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾',
    latin: 'Bismillaahir-rohmaanir-rohiim. Qul a\'uudzu birobbin-naas. Malikin-naas. Ilaahin-naas. Min syarril-waswaasil-khonnaas. Alladzii yuwaswisu fii shuduurin-naas. Minal-jinnati wan-naas.',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia, Raja manusia, Sembahan manusia, dari kejahatan (bisikan) setan yang bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia."',
  },
  {
    id: 9,
    section: 'surat',
    title: '9. Awal Surat Al-Baqarah (Ayat 1-5)',
    count: 'Dibaca 1x',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nالم ﴿١﴾ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ ﴿٢﴾ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ ﴿٣﴾ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٤﴾ أُولَٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٥﴾',
    latin: 'Bismillaahir-rohmaanir-rohiim. Alif-laaam-miiim. Dzaalikal-kitaabu laa roiba fiih, hudal lil-muttaqiin. Alladziina yu\'minuuna bil-ghoibi wa yuqiimuunash-sholaata wa mimmaa rozaqnaahum yunfiquun. Walladziina yu\'minuuna bimaaa unzila ilaika wa maaa unzila min qoblik, wa bil-aakhiroti hum yuuqinuun. Ulaaa-ika \'alaa hudam mir robbihim wa ulaaa-ika humul-muflihuun.',
    translation: 'Alif Lam Mim. Kitab (Al-Qur\'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa, (yaitu) mereka yang beriman kepada yang gaib, melaksanakan salat, dan menginfakkan sebagian rezeki yang Kami berikan kepada mereka, dan mereka yang beriman kepada (Al-Qur\'an) yang diturunkan kepadamu dan (kitab-kitab) yang diturunkan sebelum engkau, serta mereka yakin akan adanya akhirat. Merekalah yang mendapat petunjuk dari Tuhannya, dan mereka itulah orang-orang yang beruntung.',
  },
  {
    id: 10,
    section: 'surat',
    title: '10. Ayat Kursi (Surat Al-Baqarah: 255)',
    count: 'Dibaca 1x',
    arabic: 'اللَّهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    latin: 'Allaahu laaa ilaaha illaa huwal-hayyul-qoyyuum, laa ta\'khudzuhuu sinatuw wa laa nawm, lahuu maa fis-samaawaati wa maa fil-ardh, man dzalladzii yasyfa\'u \'indahuuu illaa bi-idznih, ya\'lamu maa baina aidiihim wa maa kholfahum, wa laa yuhiithuuna bisyai-im min \'ilmihiii illaa bimaa syaaa\', wasi\'a kursiyyuhus-samaawaati wal-ardh, wa laa ya-uuduhuu hifzhuhumaa, wa huwal-\'aliyyul-\'azhiim.',
    translation: 'Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Mahatinggi, Mahabesar.',
  },

  // 3. KALIMAT THAYYIBAH, ISTIGHFAR & DZIKIR TAHLIL
  {
    id: 11,
    section: 'dzikir',
    title: '11. Istighfar',
    count: 'Dibaca 3x',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ (٣×)',
    latin: 'Astaghfirullaahal-\'Azhiim. (3x)',
    translation: 'Aku memohon ampun kepada Allah Yang Maha Agung.',
  },
  {
    id: 12,
    section: 'dzikir',
    title: '12. Kalimat Tahlil (Afdhaludz-Dzikri)',
    count: 'Dibaca 33x atau 100x',
    arabic: 'أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ:\nلَا إِلٰهَ إِلَّا اللَّهُ',
    latin: 'Afdhaludz-dzikri fa\'lam annahu: Laa ilaaha illallaah. (33x / 100x)',
    translation: 'Ketahuilah bahwa sebaik-baik dzikir adalah: Tiada Tuhan selain Allah.',
  },
  {
    id: 13,
    section: 'dzikir',
    title: '13. Penutup Kalimat Tauhid',
    count: 'Dibaca 1x',
    arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، كَلِمَةُ حَقٍّ عَلَيْهَا نَحْيَا وَعَلَيْهَا نَمُوتُ وَبِهَا نُبْعَثُ إِنْ شَاءَ اللَّهُ تَعَالَى مِنَ الْآمِنِينَ.',
    latin: 'Laa ilaaha illallaahu Muhammadur rosuulullaahi shollallaahu \'alaihi wa sallam, kalimatul haqqin \'alaihaa nahyaa wa \'alaihaa namuutu wa bihaa nub\'atsu in syaaa-allaahu ta\'aalaa minal-aaminiin.',
    translation: 'Tiada Tuhan selain Allah, Nabi Muhammad adalah utusan Allah semoga Allah melimpahkan rahmat dan keselamatan kepadanya. Kalimat kebenaran yang di atasnya kami hidup, kami mati, dan kelak kami dibangkitkan insya Allah termasuk golongan orang-orang yang aman.',
  },
  {
    id: 14,
    section: 'dzikir',
    title: '14. Tasbih & Tahmid',
    count: 'Dibaca 33x / 3x',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    latin: 'Subhaanallaahi wa bihamdihii Subhaanallaahil-\'Azhiim.',
    translation: 'Mahasuci Allah dengan memuji-Nya, Mahasuci Allah Yang Maha Agung.',
  },
  {
    id: 15,
    section: 'dzikir',
    title: '15. Shalawat atas Nabi Muhammad SAW',
    count: 'Dibaca 3x',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى حَبِيبِكَ سَيِّدِنَا مُحَمَّدٍ وَآلِهِ وَصَحْبِهِ وَسَلِّمْ (٣×)',
    latin: 'Allaahumma sholli \'alaa habiibika sayyidinaa Muhammadin wa aalihii wa shohbihii wa sallim. (3x)',
    translation: 'Ya Allah, limpahkanlah rahmat dan keselamatan kepada kekasih-Mu, junjungan kami Nabi Muhammad, beserta keluarga dan sahabatnya.',
  },
  {
    id: 16,
    section: 'dzikir',
    title: '16. Hauqalah (Penutup Dzikir)',
    count: 'Dibaca 1x',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    latin: 'Laa hawla wa laa quwwata illaa billaahil-\'Aliyyil-\'Azhiim.',
    translation: 'Tiada daya dan tiada kekuatan melainkan dengan pertolongan Allah Yang Mahatinggi lagi Maha Agung.',
  },

  // 4. DOA TAHLIL & DOA ARWAH LENGKAP
  {
    id: 17,
    section: 'doa',
    title: '17. Pembuka Doa Tahlil',
    count: 'Dibaca Khusyuk',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ حَمْدَ الشَّاكِرِينَ حَمْدَ النَّاعِمِينَ حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيدَهُ. يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ الْكَرِيمِ وَعَظِيمِ سُلْطَانِكَ. اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ.',
    latin: 'A\'uudzu billaahi minasy-syaithoonir-rojiim. Bismillaahir-rohmaanir-rohiim. Al-hamdu lillaahi robbil-\'aalamiin, hamdasy-syaakiriin, hamdan-naa\'imiin, hamday yuwaafii ni\'amahuu wa yukaafi-u maziidah. Yaa robbanaa lakal-hamdu kamaa yambaghii lijalaali wajhikal-kariimi wa \'azhiimi sulthoonik. Allaahumma sholli wa sallim \'alaa sayyidinaa Muhammadin wa \'alaa aali sayyidinaa Muhammad.',
    translation: 'Aku berlindung kepada Allah dari godaan setan yang terkutuk. Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah Tuhan semesta alam, pujian orang-orang yang bersyukur, pujian orang yang memperoleh nikmat, pujian yang sepadan dengan nikmat-Nya dan menjamin tambahannya. Wahai Tuhan kami, hanya bagi-Mu segala puji sebagaimana layaknya keagungan Dzat-Mu dan kebesaran kekuasaan-Mu. Ya Allah, limpahkanlah rahmat dan keselamatan kepada junjungan kami Nabi Muhammad beserta keluarganya.',
  },
  {
    id: 18,
    section: 'doa',
    title: '18. Doa Penyampaian Pahala Bacaan Tahlil',
    count: 'Dibaca Khusyuk',
    arabic: 'اللَّهُمَّ تَقَبَّلْ وَأَوْصِلْ ثَوَابَ مَا قَرَأْنَاهُ مِنْ كِتَابِكَ الْعَزِيزِ، وَمَا هَلَّلْنَا، وَمَا سَبَّحْنَا، وَمَا اسْتَغْفَرْنَا، وَمَا صَلَّيْنَا عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، هَدِيَّةً وَاصِلَةً، وَرَحْمَةً نَازِلَةً، وَبَرَكَةً شَامِلَةً، إِلَى حَضْرَةِ حَبِيبِنَا وَشَفِيعِنَا وَقُرَّةِ أَعْيُنِنَا سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَإِلَى جَمِيعِ إِخْوَانِهِ مِنَ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ وَالْأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِينَ وَالصَّحَابَةِ وَالتَّابِعِينَ وَالْعُلَمَاءِ الْعَامِلِينَ وَالْمُصَنِّفِينَ الْمُخْلِصِينَ.',
    latin: 'Allaahumma taqobbal wa awshil tsawaaba maa qoro\'naahu min kitaabikal-\'aziiz, wa maa hallalnaa, wa maa sabbahnaa, wa mastaghfarnaa, wa maa shollainaa \'alaa sayyidinaa Muhammadin shollallaahu \'alaihi wa sallam, hadiyyatan waashilah, wa rohmatan naazilah, wa barokatan syaamilah, ilaa hadhroti habiibinaa wa syafii\'inaa wa qurroti a\'yuninaa sayyidinaa wa mawlaanaa Muhammadin shollallaahu \'alaihi wa sallam, wa ilaa jamii\'i ikhwaanihii minal-ambiyaaa-i wal-mursaliin wal-auliyaaa-i wasy-syuhadaaa-i wash-shoolihiina wash-shohaabati wat-taabi\'iina wal-\'ulamaaa-il-\'aamiliina wal-mushonnifiinal-mukhlishiin.',
    translation: 'Ya Allah, terimalah dan sampaikanlah pahala ayat-ayat Al-Qur\'an yang telah kami baca, tahlil kami, tasbih kami, istighfar kami, serta shalawat kami atas junjungan kami Nabi Muhammad SAW, sebagai hadiah yang sampai, rahmat yang turun, dan berkah yang merata kepada junjungan dan penyejuk mata kami Nabi Muhammad SAW, serta kepada saudara-saudara beliau para nabi, rasul, para wali, syuhada, shalihin, sahabat, tabi\'in, dan ulama yang tulus.',
  },
  {
    id: 19,
    section: 'doa',
    title: '19. Doa Khusus Pengampunan Ahli Kubur (Arwah)',
    count: 'Dibaca Khusyuk',
    arabic: 'اللَّهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ. اللَّهُمَّ أَنْزِلِ الرَّحْمَةَ وَالْمَغْفِرَةَ عَلَى أَهْلِ الْقُبُورِ مِنْ أَهْلِ لَا إِلٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ. اللَّهُمَّ اجْعَلْ قُبُورَهُمْ رَوْضَةً مِنْ رِيَاضِ الْجِنَانِ، وَلَا تَجْعَلْ قُبُورَهُمْ حُفْرَةً مِنْ حُفَرِ النِّيرَانِ.',
    latin: 'Allaahummaghfir lahum warhamhum wa \'aafihim wa\'fu \'anhum. Allaahumma anzilir-rohmata wal-maghfirota \'alaaa ahlil-qubuuri min ahli laaa ilaaha illallaahu Muhammadur rosuulullaah. Allaahummaj\'al qubuurohum rowdhotam mir riyaadhil-jinaan, wa laa taj\'al qubuurohum hufrotam min hufarin-niiraan.',
    translation: 'Ya Allah, ampunilah mereka, rahmatilah mereka, selamatkanlah mereka, dan maafkanlah segala kesalahan mereka. Ya Allah, turunkanlah rahmat dan ampunan kepada seluruh ahli kubur dari golongan orang-orang yang mengikrarkan Laa ilaaha illallaah Muhammadur Rasulullah. Ya Allah, jadikanlah kubur mereka sebagai taman di antara taman-taman surga, dan janganlah Engkau jadikan kubur mereka sebagai jurang di antara jurang-jurang api neraka.',
  },
  {
    id: 20,
    section: 'doa',
    title: '20. Doa Penutup (Sapu Jagad & Shalawat)',
    count: 'Dibaca 1x',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ، وَسَلَامٌ عَلَى الْمُرْسَلِينَ، وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. (الْفَاتِحَة)',
    latin: 'Robbanaa aatinaa fid-dunyaa hasanataw wa fil-aakhiroti hasanataw wa qinaa \'adzaaban-naar. Subhaana robbika robbil-\'izzati \'ammaa yashifuun, wa salaamun \'alal-mursaliin, wal-hamdu lillaahi robbil-\'aalamiin. (Al-Faatihah)',
    translation: 'Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami dari siksaan api neraka. Mahasuci Tuhanmu, Tuhan Yang Memiliki Keagungan dari apa yang mereka sifatkan. Dan salam sejahtera semoga tercurah kepada para rasul, dan segala puji bagi Allah Tuhan semesta alam. (Membaca Al-Fatihah).',
  },
];
