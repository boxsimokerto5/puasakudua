export interface SholawatItem {
  id: number;
  numberFormatted: string; // e.g. "001", "002"
  title: string;
  arabicTitle: string;
  category: 'fadhilah' | 'wirid' | 'ziarah' | 'syiir' | 'hajat';
  categoryLabel: string;
  fadhilah: string;
  source?: string;
  arabic: string;
  latin: string;
  translation: string;
  benefits?: string[];
}

export const SHOLAWAT_DATA: SholawatItem[] = [
  // 001 - Sholawat Haji
  {
    id: 1,
    numberFormatted: '001',
    title: 'Sholawat Haji & Doa Ziarah Makkah-Madinah',
    arabicTitle: 'صَلَوَاتُ الْحَجِّ وَالْعُمْرَةِ',
    category: 'hajat',
    categoryLabel: 'Hajat & Keberangkatan',
    fadhilah: 'Wasasilah dimudahkan ziarah ke Baitullah Makkah Al-Mukarramah dan Makam Rasulullah SAW di Madinah Al-Munawwarah.',
    source: 'Tradisi Doa & Ijazah Ulama Nusantara',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُبَلِّغُنَا بِهَا حَجَّ بَيْتِكَ الْحَرَامِ ، وَزِيَارَةَ حَبِيْبِكَ وَرَسُوْلِكَ سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ فِيْ لُطْفٍ وَعَافِيَةٍ وَسَلَامَةٍ وَبُلُوْغِ الْمَرَامِ ، وَعَلَى آلِهِ وَصَحْبِهِ وَبَارِكْ وَسَلِّمْ.',
    latin: "Allaahumma sholli 'alaa sayyidinaa Muhammadin sholaatan tuballighunaa bihaa hajja baitikal-haraam, wa ziyaarata habiibika wa rasuulika sayyidinaa Muhammadin shollallaahu 'alaihi wa sallama fii luthfin wa 'aafiyatin wa salaamatin wa buluughil-maraam, wa 'alaa aalihii wa shohbihii wa baarik wa sallim.",
    translation: "Ya Allah, limpahkanlah rahmat ta'zhim kepada junjungan kami Nabi Muhammad SAW, dengan sholawat yang dengannya Engkau sampaikan kami untuk menunaikan ibadah haji ke Baitullah Al-Haram, serta menziarahi makam kekasih-Mu dan utusan-Mu Nabi Muhammad SAW dalam kelembutan, kesehatan, keselamatan, dan tercapainya segala hajat mulia, serta limpahkanlah keberkahan dan keselamatan kepada keluarga dan para sahabat beliau.",
    benefits: [
      'Dibaca istiqamah setiap selesai sholat fardhu sebagai doa kerinduan ke Tanah Suci',
      'Memohon kemudahan rezeki dan takdir untuk berhaji serta berumrah',
      'Mendapatkan ketenangan batin dan berkah silaturahmi ruhani dengan Rasulullah SAW'
    ]
  },

  // 002 - Sholawat Ya Robbibil Musthofa
  {
    id: 2,
    numberFormatted: '002',
    title: 'Sholawat Ya Robbibil Musthofa',
    arabicTitle: 'يَا رَبِّ بِالْمُصْطَفَى بَلِّغْ مَقَاصِدَنَا',
    category: 'syiir',
    categoryLabel: 'Qasidah & Hajat',
    fadhilah: 'Kabulnya segala hajat kebaikan, pengampunan dosa masa lalu, serta penutup majelis berkah.',
    source: 'Bait Penutup Qashidah Burdah Imam Al-Bushiri',
    arabic: 'يَا رَبِّ بِالْمُصْطَفَى بَلِّغْ مَقَاصِدَنَا • وَاغْفِرْ لَنَا مَا مَضَى يَا وَاسِعَ الْكَرَمِ\nهُوَ الْحَبِيْبُ الَّذِي تُرْجَى شَفَاعَتُهُ • لِكُلِّ هَوْلٍ مِنَ الْأَهْوَالِ مُقْتَحَمِ\nيَا أَرْحَمَ الرَّاحِمِيْنَ يَا أَرْحَمَ الرَّاحِمِيْنَ • يَا أَرْحَمَ الرَّاحِمِيْنَ فَرِّجْ عَلَى الْمُسْلِمِيْنَ',
    latin: "Yaa Robbi bil-Musthofaa balligh maqooshidanaa • Waghfir lanaa maa madhoo yaa waasi'al-karami\nHuwal habiibul-ladzii turjaa syafaa'atuhu • Likulli hawlin minal-ahwaali muqtahami\nYaa Arhamar-Roohimiina Yaa Arhamar-Roohimiin • Yaa Arhamar-Roohimiina farrij 'alal-muslimiin",
    translation: "Wahai Tuhanku, demi kemuliaan Sang Insan Pilihan (Nabi Muhammad SAW), sampaikanlah segala maksud cita-cita kebaikan kami, dan ampunilah dosa-dosa kami yang telah lalu, wahai Dzat Yang Maha Luas Kemurahan-Nya. Beliaulah kekasih yang sangat diharapkan syafa'atnya dalam menghadapi setiap huru-hara kesukaran yang melanda. Wahai Dzat Yang Maha Pengasih dari segala yang mengasihi, berikanlah kelapangan dan jalan keluar bagi segenap kaum muslimin.",
    benefits: [
      'Sering dilantunkan di akhir tahlil, majelis dzikir, dan peringatan maulid nabi',
      'Wasasilah terkabulnya permohonan hajat dan pelapang kesulitan hidup'
    ]
  },

  // 003 - Sholawat Nariyah
  {
    id: 3,
    numberFormatted: '003',
    title: 'Sholawat Nariyah (Tafrijiyyah)',
    arabicTitle: 'الصَّلَاةُ النَّارِيَّةُ (التَّفْرِيْجِيَّةُ)',
    category: 'fadhilah',
    categoryLabel: 'Pelapang Kesulitan',
    fadhilah: 'Membuka ikatan kesulitan, melapangkan rezeki, menghindarkan musibah, dan mempermudah urusan besar.',
    source: 'Syaikh Ibrahim bin Muhammad Al-Tazi (Maghrib)',
    arabic: 'اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيْمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيْمِ وَعَلَى آلِهِ وَصَحْبِهِ فِيْ كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُوْمٍ لَكَ.',
    latin: "Allaahumma sholli sholaatan kaamilatan wa sallim salaaman taamman 'alaa sayyidinaa Muhammadinil-ladzii tanhallu bihil-'uqodu wa tanfariju bihil-kurobu wa tuqdhoo bihil-hawaa-iju wa tunaalu bihir-roghoo-ibu wa husnul-khowaatiimi wa yustasqal-ghomaamu biwajhihil-kariimi wa 'alaa aalihii wa shohbihii fii kulli lamhatin wa nafasin bi'adadi kulli ma'luumin lak.",
    translation: "Ya Allah, limpahkanlah sholawat yang sempurna dan keselamatan yang paripurna kepada junjungan kami Nabi Muhammad, yang dengan berkah beliau terurai segala ikatan, lenyap segala kesedihan, terpenuhi segala kebutuhan, tercapai segala keinginan serta husnul khatimah (akhir hidup yang baik), dan dicurahkan air hujan berkat wajah beliau yang mulia, dan semoga tercurah pula kepada keluarga dan sahabat beliau pada setiap kedipan mata dan hembusan nafas sebanyak hitungan segala yang Engkau ketahui.",
    benefits: [
      'Diamalkan 11x atau 41x saat menghadapi kebuntuan dan ujian hidup',
      'Menarik keberkahan rezeki dari arah yang tidak disangka-sangka',
      'Mendatangkan husnul khatimah dan ketenangan jiwa'
    ]
  },

  // 004 - Sholawat Asyghil
  {
    id: 4,
    numberFormatted: '004',
    title: 'Sholawat Asyghil',
    arabicTitle: 'صَلَاةُ الْأَشْغِلْ (لِلْأَمْنِ وَالسَّلَامَةِ)',
    category: 'fadhilah',
    categoryLabel: 'Perlindungan & Keselamatan',
    fadhilah: 'Perlindungan dari orang-orang zhalim, fitnah, huru-hara, serta diselamatkan bersama orang-orang sholeh.',
    source: 'Imam Ja’far Ash-Shadiq RA',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَأَشْغِلِ الظَّالِمِيْنَ بِالظَّالِمِيْنَ ، وَأَخْرِجْنَا مِنْ بَيْنِهِمْ سَالِمِيْنَ ، وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِيْنَ.',
    latin: "Allaahumma sholli 'alaa sayyidinaa Muhammad, wa asyghilizh-zhaalimiina bizh-zhaalimiin, wa akhrijnaa min bainihim saalimiin, wa 'alaa aalihii wa shohbihii ajma'iin.",
    translation: "Ya Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad SAW, dan sibukkanlah orang-orang zhalim dengan sesama orang zhalim lainnya, dan selamatkanlah kami dari tengah-tengah kejahatan mereka dalam keadaan selamat sentosa, serta limpahkanlah sholawat kepada keluarga dan seluruh sahabat beliau.",
    benefits: [
      'Benteng spiritual dari intrik kejahatan, fitnah kedzaliman, dan marabahaya',
      'Menjaga kerukunan dan kedamaian masyarakat serta bangsa'
    ]
  },

  // 005 - Sholawat Bahriyyah
  {
    id: 5,
    numberFormatted: '005',
    title: 'Sholawat Bahriyyah (Laut & Perjalanan)',
    arabicTitle: 'صَلَاةُ الْبَحْرِيَّةِ (لِلْأَسْفَارِ وَالتَّوْسِعَةِ)',
    category: 'wirid',
    categoryLabel: 'Perjalanan & Kelancaran',
    fadhilah: 'Keselamatan perjalanan darat, laut, udara, perlindungan dari badai marabahaya, dan kelancaran rezeki.',
    source: 'Tradisi Thariqah & Salafus Shalih',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنَجِّيْنَا بِهَا فِي الْبَرِّ وَالْبَحْرِ ، وَتُبَلِّغُنَا بِهَا قَضَاءَ الْحَوَائِجِ فِي الْيُسْرِ وَالْعُسْرِ ، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيْمًا كَثِيْرًا.',
    latin: "Allaahumma sholli 'alaa sayyidinaa Muhammadin sholaatan tunajjiinaa bihaa fil-barri wal-bahri, wa tuballighunaa bihaa qodhoo-al hawaa-iji fil-yusri wal-'usri, wa 'alaa aalihii wa shohbihii wa sallim tasliiman katsiiron.",
    translation: "Ya Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad SAW, sholawat yang menyelamatkan kami di daratan maupun di lautan, dan menyampaikan kami pada tercapainya hajat dalam kelapangan maupun kesempitan, serta kepada keluarga dan para sahabat beliau, berikanlah keselamatan yang berlimpah ruah.",
    benefits: [
      'Dibaca saat hendak memulai safar / perjalanan agar dilindungi malaikat',
      'Menenteramkan ombak kekhawatiran batin dan kesulitan ikhtiar'
    ]
  },

  // 006 - Sholawat Busyro
  {
    id: 6,
    numberFormatted: '006',
    title: 'Sholawat Busyro (Kabar Gembira)',
    arabicTitle: 'صَلَاةُ الْبُشْرَى (لِتَيْسِيْرِ الْأُمُوْرِ)',
    category: 'fadhilah',
    categoryLabel: 'Kabar Bahagia & Hajat',
    fadhilah: 'Mendatangkan kabar gembira, melunasi hutang, melancarkan anak keturunan, dan mendapatkan syafa’at.',
    source: 'Ijazah Habib Segaf bin Hasan Baharun (dari mimpi berjumpa Rasulullah SAW)',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ صَاحِبِ الْبُشْرَى ، صَلَاةً تُبَشِّرُنَا بِهَا وَأَهْلَنَا وَأَوْلَادَنَا وَجَمِيْعَ مَشَايِخِنَا وَمُعَلِّمِيْنَا وَطَلَبَتَنَا وَطَالِبَاتِنَا ، مِنْ يَوْمِنَا هَذَا إِلَى يَوْمِ الْآخِرَةِ.',
    latin: "Allaahumma sholli wa sallim 'alaa sayyidinaa Muhammadin shoohibil-busyroo, sholaatan tubasysyirunaa bihaa wa ahlanaa wa awlaadanaa wa jamii'a masyaayikhinaa wa mu'allimiinaa wa tholabatanaa wa thoolibaatinaa, min yauminaa haadzaa ilaa yaumil-aakhirah.",
    translation: "Ya Allah, limpahkanlah sholawat dan salam kepada junjungan kami Nabi Muhammad Sang Pembawa Kabar Gembira, dengan sholawat yang menyampaikan kabar gembira kepada kami, keluarga kami, anak-anak kami, seluruh guru-guru kami, pendidik kami, serta murid-murid kami santriwan dan santriwati, sejak hari ini hingga hari kiamat kelak.",
    benefits: [
      'Sangat dianjurkan dibaca 41x setelah sholat Shubuh',
      'Membawa kebahagiaan rumah tangga dan kesuksesan belajar bagi para santri'
    ]
  },

  // 007 - Sholawat Al-Fatih
  {
    id: 7,
    numberFormatted: '007',
    title: 'Sholawat Al-Fatih (Pembuka Pintu Rahmat)',
    arabicTitle: 'صَلَاةُ الْفَاتِحِ لِمَا أُغْلِقَ',
    category: 'wirid',
    categoryLabel: 'Pembuka Kebaikan',
    fadhilah: 'Membuka pintu kebaikan yang terkunci, menerangi hati, melipatgandakan pahala kebaikan.',
    source: 'Sayyid Muhammad Al-Bakri RA / Syaikh Ahmad At-Tijani',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ الْفَاتِحِ لِمَا أُغْلِقَ ، وَالْخَاتِمِ لِمَا سَبَقَ ، نَاصِرِ الْحَقِّ بِالْحَقِّ ، وَالْهَادِي إِلَى صِرَاطِكَ الْمُسْتَقِيْمِ ، وَعَلَى آلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيْمِ.',
    latin: "Allaahumma sholli 'alaa sayyidinaa Muhammadinil-faatihi limaa ughliq, wal-khoatimi limaa sabaq, naashiril-haqqi bil-haqq, wal-haadii ilaa shiraatikal-mustaqiim, wa 'alaa aalihii haqqa qadrihii wa miqdaarihil-'azhiim.",
    translation: "Ya Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad, sang pembuka terhadap apa yang terkunci, penutup para nabi terdahulu, penolong kebenaran dengan haq, dan penunjuk jalan menuju jalan-Mu yang lurus, serta limpahkanlah sholawat kepada keluarganya sesuai derajat dan kedudukan beliau yang agung.",
    benefits: [
      'Mencerahkan akal pikiran yang buntu dan menghilangkan rasa was-was',
      'Mempercepat terkabulnya cita-cita mulia dan keberkahan ilmu'
    ]
  },

  // 008 - Sholawat Tarhim
  {
    id: 8,
    numberFormatted: '008',
    title: 'Sholawat Tarhim (Panggilan Menjelang Shubuh)',
    arabicTitle: 'صَلَاةُ التَّرْحِيْمِ قَبْلَ الصُّبْحِ',
    category: 'syiir',
    categoryLabel: 'Syiar & Fajar',
    fadhilah: 'Menghidupkan suasana khusyuk sebelum fajar, mengetuk pintu rahmat Allah di sepertiga malam.',
    source: 'Syaikh Mahmud Khalil Al-Hushari (Mesir)',
    arabic: 'الصَّلَاةُ وَالسَّلَامُ عَلَيْكَ ، يَا إِمَامَ الْمُجَاهِدِيْنَ ، يَا رَسُوْلَ اللهِ\nالصَّلَاةُ وَالسَّلَامُ عَلَيْكَ ، يَا نَاصِرَ الْهُدَى ، يَا خَيْرَ خَلْقِ اللهِ\nالصَّلَاةُ وَالسَّلَامُ عَلَيْكَ ، يَا نَاصِرَ الْحَقِّ يَا رَسُوْلَ اللهِ\nالصَّلَاةُ وَالسَّلَامُ عَلَيْكَ ، يَا مَنْ أَسْرَى بِكَ الْمُهَيْمِنُ لَيْلًا نِلْتَ مَا نِلْتَ وَالْأَنَامُ نِيَامُ\nوَتَقَدَّمْتَ لِلصَّلَاةِ فَصَلَّى كُلُّ مَنْ فِي السَّمَاءِ وَأَنْتَ الْإِمَامُ\nوَإِلَى الْمُنْتَهَى رُفِعْتَ كَرِيْمًا وَسَمِعْتَ نِدَاءً عَلَيْكَ السَّلَامُ ، يَا كَرِيْمَ الْأَخْلَاقِ يَا رَسُوْلَ اللهِ\nصَلَّى اللهُ عَلَيْكَ ، وَعَلَى آلِكَ وَأَصْحَابِكَ أَجْمَعِيْنَ.',
    latin: "Ash-shalaatu was-salaamu 'alaik, yaa imaamal-mujaahidiin, yaa Rasuulallaah.\nAsh-shalaatu was-salaamu 'alaik, yaa naashiral-hudaa, yaa khoiro kholqillaah.\nAsh-shalaatu was-salaamu 'alaik, yaa naashiral-haqqi yaa Rasuulallaah.\nAsh-shalaatu was-salaamu 'alaik, yaa man asroo bikal-muhaiminu lailan nilta maa nilta wal-anaamu niyaam,\nWa taqoddamta lish-shalaati fashollaa kullu man fis-samaa-i wa antal-imaam,\nWa ilal-muntahaa rufi'ta kariiman wa sami'ta nidaa-an 'alaikas-salaam, yaa kariimal-akhlaaqi yaa Rasuulallaah,\nShollallaahu 'alaika, wa 'alaa aalika wa ash-haabika ajma'iin.",
    translation: "Sholawat dan salam semoga tercurah kepadamu, wahai pemimpin para pejuang, wahai Rasulullah. Sholawat dan salam semoga tercurah kepadamu, wahai penolong petunjuk kebenaran, wahai sebaik-baik makhluk Allah. Sholawat dan salam semoga tercurah kepadamu, wahai insan yang diperjalankan oleh Dzat Yang Maha Mengawasi di malam hari sehingga engkau memperoleh kemuliaan saat manusia terlelap tidur. Engkau maju memimpin sholat maka sholatlah seluruh penghuni langit di belakangmu dan engkaulah imamnya. Engkau diangkat dengan mulia menuju Sidratul Muntaha dan mendengar seruan keselamatan untukmu, wahai pemilik akhlak yang mulia wahai Rasulullah. Semoga sholawat Allah senantiasa tercurah kepadamu, keluargamu, dan segenap sahabatmu.",
    benefits: [
      'Membangunkan ruhani dan menyambut adzan shubuh dengan hati rindu kepada Allah dan Rasul-Nya'
    ]
  },

  // 009 - Sholawat Tibbil Qulub
  {
    id: 9,
    numberFormatted: '009',
    title: 'Sholawat Tibbil Qulub (Syifa / Obat Hati)',
    arabicTitle: 'صَلَاةُ طِبِّ الْقُلُوْبِ (الشِّفَاءِ)',
    category: 'fadhilah',
    categoryLabel: 'Kesehatan & Obat Hati',
    fadhilah: 'Penyembuh penyakit jasmani dan rohani, penenang hati yang gelisah, penjaga kesehatan raga.',
    source: 'Imam Ahmad Ad-Dardir / Ulama Sholawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوْبِ وَدَوَائِهَا ، وَعَافِيَةِ الْأَبْدَانِ وَشِفَائِهَا ، وَنُوْرِ الْأَبْصَارِ وَضِيَائِهَا ، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ.',
    latin: "Allaahumma sholli 'alaa sayyidinaa Muhammadin thibbil-quluubi wa dawaa-ihaa, wa 'aafiyatil-abdaani wa syifaa-ihaa, wa nuuril-abshoori wa dhiyaa-ihaa, wa 'alaa aalihii wa shohbihii wa sallim.",
    translation: "Ya Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad SAW, sebagai obat hati dan penawarnya, penyehat badan dan penyembuhnya, cahaya penglihatan mata dan penerangnya, serta limpahkanlah keselamatan kepada keluarga dan para sahabat beliau.",
    benefits: [
      'Dibaca saat merasa lelah fisik, sakit kepala, atau batin sedang galau/gelisah',
      'Menjaga ketajaman mata batin dan kesehatan indera penglihatan'
    ]
  },

  // 010 - Sholawat Nuridzati
  {
    id: 10,
    numberFormatted: '010',
    title: 'Sholawat Nuridzati (Cahaya Dzat)',
    arabicTitle: 'صَلَاةُ النُّوْرِ الذَّاتِيِّ',
    category: 'wirid',
    categoryLabel: 'Perlindungan & Nur Ilahi',
    fadhilah: 'Menghilangkan kesusahan besar, pagar keselamatan lahir batin dari sihir/gangguan, dan penerang rahasia ruhani.',
    source: 'Sayyidi Abul Hasan Asy-Syadzili RA',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ النُّوْرِ الذَّاتِيِّ ، وَالسِّرِّ السَّارِيْ فِيْ سَائِرِ الْأَسْمَاءِ وَالصِّفَاتِ ، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ.',
    latin: "Allaahumma sholli wa sallim wa baarik 'alaa sayyidinaa Muhammadinin-nuuridz-dzaatii, was-sirris-saarii fii saa-iril asmaa-i wash-shifaat, wa 'alaa aalihii wa shohbihii wa sallim.",
    translation: "Ya Allah, limpahkanlah sholawat, salam, dan keberkahan kepada junjungan kami Nabi Muhammad SAW, Sang Cahaya Dzat dan rahasia yang mengalir pada seluruh nama dan sifat, serta limpahkanlah sholawat dan keselamatan kepada keluarga dan sahabat beliau.",
    benefits: [
      'Membentengi diri dari marabahaya ghaib dan musuh yang berniat jahat',
      'Dzikir malam untuk membuka kejernihan pikiran dalam mempelajari ilmu agama'
    ]
  },

  // 011 - Sholawat Nuril Anwar
  {
    id: 11,
    numberFormatted: '011',
    title: 'Sholawat Nuril Anwar (Sumber Segala Rahasia)',
    arabicTitle: 'صَلَاةُ نُوْرِ الْأَنْوَارِ وَسِرِّ الْأَسْرَارِ',
    category: 'wirid',
    categoryLabel: 'Penerang Batin & Rezeki',
    fadhilah: 'Menyingkap hijab kegelapan, memudahkan rezeki halal yang luas, dan melancarkan segala hajat.',
    source: 'Sayyid Ahmad Al-Badawi RA',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى نُوْرِ الْأَنْوَارِ ، وَسِرِّ الْأَسْرَارِ ، وَتِرْيَاقِ الْأَغْيَارِ ، وَمِفْتَاحِ بَابِ الْيَسَارِ ، سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ الْمُخْتَارِ ، وَآلِهِ الْأَطْهَارِ ، وَأَصْحَابِهِ الْأَخْيَارِ ، عَدَدَ نِعَمِ اللهِ وَإِفْضَالِهِ.',
    latin: "Allaahumma sholli 'alaa nuuril-anwaar, wa sirril-asraar, wa tiryaaqil-aghyaar, wa miftaahi baabil-yasaar, sayyidinaa wa mawlaanaa Muhammadinil-mukhtaar, wa aalihil-ath-haar, wa ash-haabihil-akhyaar, 'adada ni'amillaahi wa ifdhaalih.",
    translation: "Ya Allah, limpahkanlah sholawat kepada sang cahaya dari segala cahaya, rahasia dari segala rahasia, penawar dari segala duka dan perubahan buruk, pembuka pintu kemudahan rezeki, junjungan dan pemimpin kami Nabi Muhammad yang terpilih, beserta keluarganya yang suci dan para sahabatnya yang pilihan, sebanyak hitungan nikmat-nikmat Allah dan karunia-Nya.",
    benefits: [
      'Menghilangkan aura kesuraman batin dan mendatangkan optimisme',
      'Kunci pembuka kelancaran bisnis, perniagaan, dan rezeki halal'
    ]
  },

  // 012 - Syiir Tanpo Waton (Gus Dur)
  {
    id: 12,
    numberFormatted: '012',
    title: 'Syiir Tanpo Waton (Gus Dur / KH. Moh. Nizam)',
    arabicTitle: 'شِعْرُ تَنْفَا وَطَنْ (شِعْرُ الْحِكْمَةِ)',
    category: 'syiir',
    categoryLabel: 'Nasihat Luhur & Tazkiyatun Nafs',
    fadhilah: 'Pembersih penyakit hati (ujub, riya, takabur), penyejuk kerukunan, pengingat hakikat sholat dan Al-Qur’an.',
    source: 'KH. Mohammad Nizam As-Sofa & Dipopulerkan KH. Abdurrahman Wahid (Gus Dur)',
    arabic: 'أَسْتَغْفِرُ اللهَ رَبَّ الْبَرَايَا • أَسْتَغْفِرُ اللهَ مِنَ الْخَطَايَا\nرَبِّ زِدْنِيْ عِلْمًا نَافِعًا • وَوَافِقْنِيْ عَمَلًا صَالِحًا\nيَا رَسُوْلَ اللهِ سَلَامٌ عَلَيْكْ • يَا رَفِيْعَ الشَّانِ وَالدَّرَجِ\nعَطْفَةً يَا جِيْرَةَ الْعَلَمِ • يَا أُهَيْلَ الْجُوْدِ وَالْكَرَمِ',
    latin: "Astaghfirullaah robbal barooyaa • Astaghfirullaah minal khothooyaa\nRobbi zidnii 'ilman naafi'aa • Wa waafiqnii 'amalan shoolihaa\nYaa Rasuulallaah salaamun 'alaik • Yaa rofii'as-syaani waddaroji\n'Athfatan yaa jiirotal 'alami • Yaa uhailal juudi wal karami\n\n(Lirik Jawa): Ngawiti ingsun nglaras syi'iran, kelawan muji maring Pengeran...\nAkeh kang apal Qur'an Haditse, seneng ngafirke marang liyane...\nKafirke uwong kramane ilang, legane ati amung ngendhang...",
    translation: "Aku memohon ampunan kepada Allah Tuhan sekalian makhluk • Aku memohon ampunan dari segala kesalahan dan dosa.\nWahai Tuhanku, tambahkanlah untukku ilmu yang bermanfaat • Dan bimbinglah aku untuk beramal sholeh yang Engkau ridhai.\nWahai Rasulullah, salam sejahtera untukmu • Wahai insan yang luhur kedudukan dan derajatnya.\nLimpahkanlah kasih sayang wahai tetangga kemuliaan • Wahai keluarga yang penuh kedermawanan dan kemurahan hati.",
    benefits: [
      'Menghaluskan budi pekerti santri agar tidak mudah mencela dan menghakimi sesama',
      'Mengajarkan keikhlasan batin dalam membaca Al-Qur’an dan beribadah sholat'
    ]
  },

  // 013 - Sholawat Ziarah Wali (Salamullahi Ya Sadah)
  {
    id: 13,
    numberFormatted: '013',
    title: 'Sholawat Ziarah Wali (Salamullahi Ya Sadah)',
    arabicTitle: 'سَلَامُ اللهِ يَا سَادَةْ (قَصِيْدَةُ زِيَارَةِ الْأَوْلِيَاءِ)',
    category: 'ziarah',
    categoryLabel: 'Ziarah Makam Auliya',
    fadhilah: 'Adab dan salam memohon keberkahan madad para kekasih Allah saat menziarahi makam para wali.',
    source: 'Tradisi Salafus Shalih Ahlus Sunnah Wal Jamaah',
    arabic: 'سَلَامُ اللهِ يَا سَادَةْ • مِنَ الرَّحْمٰنِ يَغْشَاكُمْ\nعِبَادَ اللهِ جِئْنَاكُمْ • قَصَدْنَاكُمْ طَلَبْنَاكُمْ\nتُعِيْنُوْنَا تُغِيْثُوْنَا • بِهِمَّتِكُمْ وَجَدْوَاكُمْ\nفَأَحْبُوْنَا وَأَعْطُوْنَا • عَطَايَاكُمْ هَدَايَاكُمْ\nفَلَا خَيَّبْتُمُوْا ظَنِّيْ • فَحَاشَاكُمْ وَحَاشَاكُمْ\nسَعِدْنَا إِذْ أَتَيْنَاكُمْ • وَفُزْنَا حِيْنَ زُرْنَاكُمْ\nفَقُوْمُوْا وَاشْفَعُوْا فِيْنَا • إِلَى الرَّحْمٰنِ مَوْلَاكُمْ',
    latin: "Salaamullaahi yaa saadah • Minar-rohmaani yaghsyaakum\n'Ibaadallaahi ji'naakum • Qoshodnaakum tholabnaakum\nTu'iinuunaa tughiitsuunaa • Bihimmatikum wa jadwaakum\nFa-ahbuunaa wa a'thuunaa • 'Athooyaakum hadaayaakum\nFalaa khoyyabtumuu zhonnii • Fahaasyaakum wa haasyaakum\nSa'idnaa idz atainaakum • Wa fuznaa hiina zurnaakum\nFaquumuu wasyfa'uu fiinaa • Ilar-rohmaani mawlaakum.",
    translation: "Keselamatan dari Allah wahai para pemimpin kemuliaan • Limpahan rahmat dari Dzat Maha Pengasih semoga menaungi kalian.\nWahai hamba-hamba pilihan Allah, kami mendatangi kalian • Kami bermaksud menziarahi kalian dan mengharap keberkahan doa kalian.\nSudilah kalian menolong kami dan mengasihi kami • Dengan karamah tekad himmah dan karunia kebaikan kalian.\nMaka cintailah kami dan berikanlah kami • Hadiah kebaikan dan pancaran doa tulus kalian.\nJanganlah kalian mengecewakan harapan baik kami • Sungguh mustahil kalian mengecewakan para peziarah.\nBetapa berbahagia kami tatkala dapat bersilaturahmi mendatangi kalian • Dan kami beruntung saat menziarahi kalian.\nMaka bangkitlah dan berilah syafaat (bantuan doa) untuk kami • Kepada Allah Dzat Maha Pengasih Tuhan Pelindung kalian.",
    benefits: [
      'Dibaca saat tiba di pintu makam waliyullah, guru, atau para ulama sholeh',
      'Menguatkan sambungan mahabbah dan adab ziarah kubur yang penuh hikmah'
    ]
  },

  // 014 - Sholawat Munjiyat
  {
    id: 14,
    numberFormatted: '014',
    title: 'Sholawat Munjiyat (Penyelamat Kesulitan)',
    arabicTitle: 'صَلَاةُ الْمُنْجِيَاتِ',
    category: 'fadhilah',
    categoryLabel: 'Penyelamat & Hajat',
    fadhilah: 'Menyelamatkan dari segala bencana dan ujian besar, mengangkat derajat, dan menyucikan dari dosa.',
    source: 'Syaikh Musa Ad-Dhorir RA (Kisah Badai Kapal Laut)',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَهْوَالِ وَالْآفَاتِ ، وَتَقْضِيْ لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيْعِ السَّيِّئَاتِ ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيْعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ.',
    latin: "Allaahumma sholli 'alaa sayyidinaa Muhammadin sholaatan tunjiinaa bihaa min jamii'il-ahwaali wal-aafaat, wa taqdhii lanaa bihaa jamii'al-haajaat, wa tuthohhirunaa bihaa min jamii'is-sayyi-aat, wa tarfa'unaa bihaa 'indaka a'lad-darajaat, wa tuballighunaa bihaa aqshol-ghooyaati min jamii'il-khoiraati fil-hayaati wa ba'dal mamaat.",
    translation: "Ya Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad SAW, sholawat yang dengannya Engkau selamatkan kami dari segala huru-hara dan marabahaya, Engkau tunaikan bagi kami segala hajat, Engkau bersihkan kami dari segala keburukan dosa, Engkau angkat kami ke derajat yang paling tinggi di sisi-Mu, dan Engkau sampaikan kami pada puncak tujuan dari segala kebaikan di dunia maupun setelah wafat.",
    benefits: [
      'Dibaca 11x setelah sholat fardhu atau 100x saat menghadapi situasi genting',
      'Pelindung ampuh keluarga dan harta benda dari marabahaya'
    ]
  },

  // 015 - Sholawat Ibrahimiyyah
  {
    id: 15,
    numberFormatted: '015',
    title: 'Sholawat Ibrahimiyyah (Sholawat Paling Utama)',
    arabicTitle: 'الصَّلَاةُ الْإِبْرَاهِيْمِيَّةُ',
    category: 'wirid',
    categoryLabel: 'Paling Afdhal & Tasyahhud',
    fadhilah: 'Sholawat paling afdhal yang diajarkan langsung oleh Rasulullah SAW kepada para sahabat dalam tasyahhud sholat.',
    source: 'Hadits Shahih Riwayat Bukhari & Muslim',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيْمَ وَعَلَى آلِ إِبْرَاهِيْمَ ، إِنَّكَ حَمِيْدٌ مَجِيْدٌ . اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيْمَ وَعَلَى آلِ إِبْرَاهِيْمَ ، إِنَّكَ حَمِيْدٌ مَجِيْدٌ.',
    latin: "Allaahumma sholli 'alaa Muhammadin wa 'alaa aali Muhammad, kamaa shollaita 'alaa Ibraahiima wa 'alaa aali Ibraahiim, innaka hamiidum-majiid. Allaahumma baarik 'alaa Muhammadin wa 'alaa aali Muhammad, kamaa baarokta 'alaa Ibraahiima wa 'alaa aali Ibraahiim, innaka hamiidum-majiid.",
    translation: "Ya Allah, limpahkanlah sholawat kepada Nabi Muhammad dan keluarga Nabi Muhammad, sebagaimana Engkau telah melimpahkan sholawat kepada Nabi Ibrahim dan keluarga Nabi Ibrahim, sesungguhnya Engkau Maha Terpuji lagi Maha Mulia. Ya Allah, berkahilah Nabi Muhammad dan keluarga Nabi Muhammad, sebagaimana Engkau telah memberkahi Nabi Ibrahim dan keluarga Nabi Ibrahim, sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.",
    benefits: [
      'Wajib/sunnah muakkadah dibaca dalam tasyahhud akhir setiap sholat fardhu dan sunnah',
      'Pahala paling agung di antara seluruh sighat sholawat yang ada'
    ]
  },

  // 016 - Sholawat Jibril
  {
    id: 16,
    numberFormatted: '016',
    title: 'Sholawat Jibril (Pembuka Rezeki)',
    arabicTitle: 'صَلَاةُ جِبْرِيْلَ عَلَيْهِ السَّلَامُ',
    category: 'fadhilah',
    categoryLabel: 'Rezeki & Berkah',
    fadhilah: 'Sholawat ringkas namun berfadilah besar untuk menarik rezeki dari segala penjuru, ketenangan, dan cinta dari sesama.',
    source: 'Ijazah Para Masyayikh & Salafus Shalih',
    arabic: 'صَلَّى اللهُ عَلَى مُحَمَّدٍ • صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ',
    latin: "Shollallaahu 'alaa Muhammad • Shollallaahu 'alaihi wa sallam",
    translation: "Semoga Allah senantiasa melimpahkan sholawat rahmat kepada Nabi Muhammad • Semoga Allah melimpahkan sholawat dan salam keselamatan kepada beliau.",
    benefits: [
      'Sangat ringan diamalkan 500x atau 1000x setiap hari',
      'Membukakan jalan keluar finansial dan memudahkan hajat usaha'
    ]
  },

  // 017 - Sholawat Badar
  {
    id: 17,
    numberFormatted: '017',
    title: 'Sholawat Badar (Karya Ulama Nusantara)',
    arabicTitle: 'شَلَوَاتُ الْبَدْرِ',
    category: 'syiir',
    categoryLabel: 'Syiar Nusantara & Ahlul Badr',
    fadhilah: 'Wasasilah keberkahan para pejuang Badar, menjaga keutuhan bangsa, menolak bala fitnah, dan penyemangat jiwa.',
    source: 'KH. Ali Manshur (Banyuwangi, 1960-an)',
    arabic: 'صَلَاةُ اللهِ سَلَامُ اللهِ • عَلَى طٰهَ رَسُوْلِ اللهِ\nصَلَاةُ اللهِ سَلَامُ اللهِ • عَلَى يٰسٓ حَبِيْبِ اللهِ\nتَوَسَّلْنَا بِبِسْمِ اللهِ • وَبِالْهَادِي رَسُوْلِ اللهِ\nوَكُلِّ مُجَاهِدٍ لِلّٰهِ • بِأَهْلِ الْبَدْرِ يَا اَللهُ\nإِلٰهِيْ سَلِّمِ الْأُمَّةْ • مِنَ الْآفَاتِ وَالنِّقْمَةْ\nوَمِنْ هَمٍّ وَمِنْ غُمَّةْ • بِأَهْلِ الْبَدْرِ يَا اَللهُ',
    latin: "Sholaatullaah salaamullaah • 'Alaa Thooha Rasuulillaah\nSholaatullaah salaamullaah • 'Alaa Yaasiin Habiibillaah\nTawassalnaa bibismillaah • Wa bil-Haadi Rasuulillaah\nWa kulli mujaahidin lillaah • Bi-ahlil badri yaa Allaah\nIlaahii sallimil ummah • Minal aafaati wan-niqmah\nWa min hammin wa min ghummah • Bi-ahlil badri yaa Allaah",
    translation: "Rahmat dan keselamatan Allah semoga tercurah kepada Thaha (Nabi Muhammad) utusan Allah. Rahmat dan keselamatan Allah semoga tercurah kepada Yasin (Nabi Muhammad) kekasih Allah. Kami bertawassul dengan bismillah dan dengan petunjuk Rasulullah, serta setiap pejuang di jalan Allah berkat kemuliaan para syuhada perang Badar ya Allah. Wahai Tuhanku, selamatkanlah umat ini dari segala marabahaya dan siksa, serta dari segala duka dan kesusahan berkat para pahlawan Badar ya Allah.",
    benefits: [
      'Menjadi lagu sholawat resmi penyatu umat di Indonesia',
      'Membangkitkan semangat spiritual santri dan kecintaan pada tanah air'
    ]
  },

  // 018 - Sholawat Nahdliyyah
  {
    id: 18,
    numberFormatted: '018',
    title: 'Sholawat Nahdliyyah (Perjuangan & Syiar)',
    arabicTitle: 'الصَّلَاةُ النَّهْضِيَّةُ',
    category: 'syiir',
    categoryLabel: 'Perjuangan & Jamiyyah',
    fadhilah: 'Menumbuhkan semangat khidmah memperjuangkan Islam Ahlussunnah wal Jamaah dan menegakkan panji kemuliaan.',
    source: 'KH. Hasan Abdul Wafi (Paiton, Probolinggo)',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُرَغِّبُ وَتُنَشِّطُ ، وَتُحَمِّسُ بِهَا الْجِهَادَ لِإِحْيَاءِ وَإِعْلَاءِ دِيْنِ الْإِسْلَامِ ، وَإِظْهَارِ شَعَائِرِهِ عَلَى طَرِيْقَةِ جَمْعِيَّةِ نَهْضَةِ الْعُلَمَاءِ ، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ.',
    latin: "Allaahumma sholli 'alaa sayyidinaa Muhammadin sholaatan turogh-ghibu wa tunasy-syithu, wa tuhammisu bihal-jihaada li-ihyaa-i wa i'laa-i diinil-Islaam, wa izh-haari sya'aa-irihii 'alaa thoriiqoti jam'iyyati Nahdlatil 'Ulamaa', wa 'alaa aalihii wa shohbihii wa sallim.",
    translation: "Ya Allah, limpahkanlah sholawat kepada junjungan kami Nabi Muhammad SAW, sholawat yang menumbuhkan kecintaan, kesegaran semangat, dan menggelorakan perjuangan untuk menghidupkan serta meninggikan agama Islam, serta menampakkan syiar-syiarnya di atas manhaj Jam'iyyah Nahdlatul Ulama, serta limpahkanlah sholawat dan keselamatan kepada keluarga dan sahabat beliau.",
    benefits: [
      'Menjaga kekompakan, ukhuwah islamiyyah, dan keberkahan belajar di pondok pesantren'
    ]
  }
];
