export interface FastingWisdom {
  id: number;
  category: 'ramadhan' | 'senin_kamis' | 'keutamaan_adab' | 'doa_pahala';
  categoryLabel: string;
  badgeColor: string;
  title: string;
  arabic?: string;
  translation: string;
  source: string;
  explanation: string;
}

export const FASTING_WISDOM_LIST: FastingWisdom[] = [
  {
    id: 1,
    category: 'senin_kamis',
    categoryLabel: 'Puasa Sunnah Senin - Kamis',
    badgeColor: 'from-amber-500 to-yellow-600',
    title: 'Amalan Diperlihatkan di Hadapan Allah',
    arabic: 'تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ',
    translation: '“Berbagai amalan dihadapkan (pada Allah) pada hari Senin dan Kamis, maka aku suka jika amalanku dihadapkan sedangkan aku dalam keadaan berpuasa.”',
    source: 'HR. Tirmidzi no. 747 (Hadits Shahih)',
    explanation: 'Rasulullah SAW sangat gemar berpuasa Senin dan Kamis karena saat laporan amal manusia diangkat ke langit, beliau sedang dalam kondisi ibadah terbaik.',
  },
  {
    id: 2,
    category: 'ramadhan',
    categoryLabel: 'Keutamaan Puasa Ramadhan',
    badgeColor: 'from-emerald-500 to-teal-600',
    title: 'Pengampunan Dosa yang Telah Lalu',
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    translation: '“Barangsiapa yang berpuasa di bulan Ramadhan karena iman dan mengharap pahala (dari Allah), maka dosanya yang telah lalu akan diampuni.”',
    source: 'HR. Bukhari no. 38 & Muslim no. 760',
    explanation: 'Puasa yang dilandasi keimanan yang kokoh dan keikhlasan mutlak menjadi sarana pelebur dosa-dosa masa lalu.',
  },
  {
    id: 3,
    category: 'senin_kamis',
    categoryLabel: 'Puasa Sunnah Senin - Kamis',
    badgeColor: 'from-amber-500 to-yellow-600',
    title: 'Hari Dibukanya Pintu-Pintu Surga',
    arabic: 'تُفْتَحُ أَبْوَابُ الْجَنَّةِ يَوْمَ الاِثْنَيْنِ وَيَوْمَ الْخَمِيسِ فَيُغْفَرُ لِكُلِّ عَبْدٍ لاَ يُشْرِكُ بِاللَّهِ شَيْئًا',
    translation: '“Pintu-pintu surga dibuka pada hari Senin dan Kamis. Maka semua hamba yang tidak menyekutukan Allah dengan sesuatu apapun akan diampuni dosanya.”',
    source: 'HR. Muslim no. 2565',
    explanation: 'Hari Senin dan Kamis adalah hari penuh rahmat dan maghfirah, sangat mulia untuk dihiasi dengan puasa dan silaturahmi.',
  },
  {
    id: 4,
    category: 'doa_pahala',
    categoryLabel: 'Keistimewaan & Doa Puasa',
    badgeColor: 'from-purple-500 to-indigo-600',
    title: 'Doa Orang Berpuasa Tidak Ditolak',
    arabic: 'ثَلاَثُ دَعَوَاتٍ لاَ تُرَدُّ: دَعْوَةُ الْوَالِدِ، وَدَعْوَةُ الصَّائِمِ، وَدَعْوَةُ الْمُسَافِرِ',
    translation: '“Tiga doa yang tidak tertolak: Doa orang tua kepada anaknya, doa orang yang sedang berpuasa, dan doa musafir (orang yang bepergian).”',
    source: 'HR. Baihaqi no. 6619 (Shahih)',
    explanation: 'Gunakan waktu berpuasa, terutama menjelang berbuka, untuk memperbanyak doa kebaikan untuk diri sendiri, orang tua, dan bangsa.',
  },
  {
    id: 5,
    category: 'keutamaan_adab',
    categoryLabel: 'Pintu Surga Ar-Rayyan',
    badgeColor: 'from-cyan-500 to-blue-600',
    title: 'Pintu Khusus Bagi Orang yang Rajin Puasa',
    arabic: 'إِنَّ فِي الْجَنَّةِ بَابًا يُقَالُ لَهُ الرَّيَّانُ، يَدْخُلُ مِنْهُ الصَّائِمُونَ يَوْمَ الْقِيَامَةِ، لاَ يَدْخُلُ مِنْهُ أَحَدٌ غَيْرُهُمْ',
    translation: '“Sesungguhnya di surga ada sebuah pintu yang bernama Ar-Rayyan. Orang-orang yang berpuasa akan masuk melaluinya pada hari kiamat, tidak ada seorang pun selain mereka yang memasukinya.”',
    source: 'HR. Bukhari no. 1896 & Muslim no. 1152',
    explanation: 'Allah menyiapkan kemuliaan eksklusif bagi hamba-Nya yang gemar berpuasa dengan panggilan istimewa masuk surga melalui pintu Ar-Rayyan.',
  },
  {
    id: 6,
    category: 'senin_kamis',
    categoryLabel: 'Puasa Sunnah Senin - Kamis',
    badgeColor: 'from-amber-500 to-yellow-600',
    title: 'Hari Lahir & Turunnya Wahyu Rasulullah',
    arabic: 'ذَاكَ يَوْمٌ وُلِدْتُ فِيهِ، وَيَوْمٌ بُعِثْتُ فِيهِ، أَوْ أُنْزِلَ عَلَيَّ فِيهِ',
    translation: '“Hari Senin adalah hari aku dilahirkan, hari aku diutus, dan hari diturunkannya wahyu Al-Qur’an kepadaku.”',
    source: 'HR. Muslim no. 1162',
    explanation: 'Puasa hari Senin adalah bentuk rasa syukur mendalam atas kelahiran suri tauladan kita, Nabi Muhammad SAW, serta turunnya petunjuk Al-Qur’an.',
  },
  {
    id: 7,
    category: 'keutamaan_adab',
    categoryLabel: 'Perisai & Benteng Diri',
    badgeColor: 'from-emerald-500 to-teal-600',
    title: 'Puasa Sebagai Perisai dari Maksiat & Api Neraka',
    arabic: 'الصِّيَامُ جُنَّةٌ فَلَا يَرْفُثْ وَلَا يَجْهَلْ، وَإِنِ امْرُؤٌ قَاتَلَهُ أَوْ شَاتَمَهُ فَلْيَقُلْ: إِنِّي صَائِمٌ',
    translation: '“Puasa adalah perisai (benteng). Maka janganlah berkata kotor dan jangan berbuat kebodohan. Jika ada orang yang mencela atau memeranginya, katakanlah: Sesungguhnya aku sedang berpuasa.”',
    source: 'HR. Bukhari no. 1894 & Muslim no. 1151',
    explanation: 'Hakikat puasa bukan hanya menahan lapar dan dahaga, melainkan juga menahan lisan, emosi, serta akhlak dari hal yang sia-sia.',
  },
  {
    id: 8,
    category: 'doa_pahala',
    categoryLabel: 'Dua Kegembiraan Orang Berpuasa',
    badgeColor: 'from-purple-500 to-indigo-600',
    title: 'Bahagia Saat Berbuka & Saat Bertemu Allah',
    arabic: 'لِلصَّائِمِ فَرْحَتَانِ: فَرْحَةٌ عِنْدَ فِطْرِهِ، وَفَرْحَةٌ عِنْدَ لِقَاءِ رَبِّهِ',
    translation: '“Bagi orang yang berpuasa ada dua kebahagiaan: kebahagiaan ketika berbuka puasa, dan kebahagiaan ketika berjumpa dengan Tuhannya (Allah).”',
    source: 'HR. Bukhari no. 1904 & Muslim no. 1151',
    explanation: 'Kenikmatan berbuka adalah kebahagiaan duniawi, dan balasan pahala tak terhingga adalah kebahagiaan ukhrawi di akhirat kelak.',
  },
  {
    id: 9,
    category: 'ramadhan',
    categoryLabel: 'Keutamaan Puasa Ramadhan',
    badgeColor: 'from-emerald-500 to-teal-600',
    title: 'Pahala Berpuasa Langsung Dibalas oleh Allah',
    arabic: 'كُلُّ عَمَلِ ابْنِ آدَمَ يُضَاعَفُ... إِلَّا الصَّوْمَ، فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ',
    translation: '“Setiap amalan kebaikan anak cucu Adam dilipatgandakan sepuluh hingga tujuh ratus kali lipat, kecuali puasa. Sesungguhnya puasa itu untuk-Ku dan Aku sendiri yang akan membalasnya.”',
    source: 'HR. Muslim no. 1151',
    explanation: 'Puasa adalah rahasia antara hamba dengan Sang Pencipta, sehingga Allah memberikan ganjaran istimewa tanpa batasan hisab.',
  },
  {
    id: 10,
    category: 'senin_kamis',
    categoryLabel: 'Puasa Sunnah Senin - Kamis',
    badgeColor: 'from-amber-500 to-yellow-600',
    title: 'Menjaga Kebiasaan Istiqomah Kebaikan',
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    translation: '“Amalan yang paling dicintai oleh Allah adalah amalan yang kontinu (istiqomah dikerjakan), meskipun sedikit.”',
    source: 'HR. Bukhari no. 6464 & Muslim no. 783',
    explanation: 'Merutinkan puasa Senin dan Kamis setiap pekan mendidik jiwa santri menjadi disiplin, sehat jasmani, dan senantiasa dekat dengan Allah SWT.',
  },
  {
    id: 11,
    category: 'keutamaan_adab',
    categoryLabel: 'Keberkahan Waktu Sahur',
    badgeColor: 'from-cyan-500 to-blue-600',
    title: 'Makan Sahur Membawa Keberkahan',
    arabic: 'تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً',
    translation: '“Makan sahurlah kalian, karena sesungguhnya pada makan sahur itu terdapat keberkahan.”',
    source: 'HR. Bukhari no. 1923 & Muslim no. 1095',
    explanation: 'Sahur memberi kekuatan fisik untuk beribadah sepanjang hari dan waktu sahur adalah waktu mustajab untuk beristighfar.',
  },
  {
    id: 12,
    category: 'doa_pahala',
    categoryLabel: 'Jauh dari Api Neraka',
    badgeColor: 'from-purple-500 to-indigo-600',
    title: 'Puasa Menjauhkan 70 Tahun dari Neraka',
    arabic: 'مَا مِنْ عَبْدٍ يَصُومُ يَوْمًا فِي سَبِيلِ اللَّهِ إِلَّا بَاعَدَ اللَّهُ بِذَلِكَ الْيَوْمِ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا',
    translation: '“Tidaklah seorang hamba berpuasa satu hari di jalan Allah melainkan Allah akan menjauhkan wajahnya dari api neraka sejauh perjalanan 70 tahun.”',
    source: 'HR. Bukhari no. 2840 & Muslim no. 1153',
    explanation: 'Satu hari puasa yang tulus karena Allah memberikan perlindungan yang sangat dahsyat di akhirat kelak.',
  },
];

/**
 * Returns the wisdom index based on current hourly epoch.
 * This guarantees the quote changes automatically every 1 hour (60 minutes).
 */
export function getHourlyWisdomIndex(now = Date.now()): number {
  const currentHourEpoch = Math.floor(now / (1000 * 60 * 60));
  return Math.abs(currentHourEpoch) % FASTING_WISDOM_LIST.length;
}

/**
 * Get the wisdom item corresponding to the current 1-hour time window.
 */
export function getCurrentHourlyWisdom(): FastingWisdom {
  const index = getHourlyWisdomIndex();
  return FASTING_WISDOM_LIST[index];
}
