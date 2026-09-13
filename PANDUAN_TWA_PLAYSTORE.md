# 📱 PANDUAN LENGKAP: BUILD TWA (AAB & APK SIGNED) DENGAN GITHUB ACTIONS

Dokumen ini adalah panduan langkah-demi-langkah untuk membangun aplikasi **PUASAKU - SRT 1 KEDIRI** menjadi **Android App Bundle (`.aab`)** dan **APK Release** bertanda tangan (*Signed Keystore*) menggunakan **Trusted Web Activity (TWA)** dan **GitHub Actions**.

---

## 🌟 Mengapa Menggunakan Metode TWA?
1. **Pembaruan Instan (Zero-Delay Update)**:
   Setiap kali ada perubahan fitur, data fiqih, barcode kartu, atau tampilan di web, **aplikasi yang terpasang di HP siswa otomatis berubah saat itu juga**, tanpa perlu merilis ulang AAB ke Google Play Console!
2. **Ukuran File Sangat Ringan**: Ukuran file aplikasi hanya berkisar 2–3 MB.
3. **Kamera & PWA Tetap Aktif**: Scan QR/Barcode kartu santri dan notifikasi audio bekerja penuh.

---

## 🛠️ Persiapan Sebelum Menjalankan Workflow

### 1. Tentukan Domain Web Anda
TWA memerlukan domain HTTPS aktif.
- Jika menggunakan domain sekolah: misal `https://puasaku.sekolahrakyat.sch.id`
- Atau URL preview saat ini: `https://ais-pre-i5tusnjnohh6qfhmyvnunv-95670230943.asia-east1.run.app`

### 2. Opsi Keystore (Tanda Tangan Digital)
Workflow GitHub Actions (`.github/workflows/build-twa.yml`) sudah diprogram secara cerdas:
- **Opsi A (Paling Mudah)**: Anda tidak perlu menyiapkan apa-apa! Workflow akan secara otomatis membuat Keystore release berkekuatan RSA 2048-bit yang valid selama 25 tahun, mengekstrak SHA-256 fingerprint, menandatangani AAB & APK, dan memberikan file cadangan `release-keystore.zip` di hasil artifact.
- **Opsi B (Rekomendasi untuk Play Store Produksi Jangka Panjang)**:
  Jika Anda ingin menggunakan Keystore pribadi yang permanen:
  1. Buat keystore di komputer Anda:
     ```bash
     keytool -genkey -v -keystore my-release-key.keystore -alias puasaku_key -keyalg RSA -keysize 2048 -validity 10000
     ```
  2. Ubah file keystore menjadi teks Base64:
     ```bash
     # Linux / Mac:
     base64 -w 0 my-release-key.keystore > keystore_base64.txt
     
     # Windows PowerShell:
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.keystore")) | Out-File -Encoding utf8 keystore_base64.txt
     ```
  3. Buka GitHub Repository Anda: **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:
     - `ANDROID_KEYSTORE_BASE64`: Isi dengan teks Base64 tadi.
     - `ANDROID_KEY_ALIAS`: `puasaku_key`
     - `ANDROID_KEY_PASSWORD`: password key Anda
     - `ANDROID_KEYSTORE_PASSWORD`: password keystore Anda

---

## 🚀 Cara Menjalankan Build di GitHub Actions

1. **Buka Tab "Actions"** di repositori GitHub Anda.
2. Di sebelah kiri, klik workflow **"🚀 Build TWA Android (Signed AAB & APK for Play Store)"**.
3. Klik tombol **"Run workflow"** di sebelah kanan:
   - **Domain Host TWA**: Masukkan domain web Anda (tanpa `https://`, misal: `ais-pre-i5tusnjnohh6qfhmyvnunv-95670230943.asia-east1.run.app` atau domain sekolah).
   - **Android Version Code**: `1` (naikkan jadi `2`, `3`, dst. jika nanti ada perubahan manifest Android).
   - **Android Version Name**: `1.0.0`
4. Klik tombol hijau **"Run workflow"**.
5. Tunggu sekitar 2–3 menit hingga proses selesai bertanda centang hijau ✅.

---

## 📦 Hasil File yang Dihasilkan (Download di Menu Artifacts)

Setelah workflow selesai, Anda dapat mengunduh paket **`Puasaku-TWA-GooglePlay-Build`** yang berisi:

| Nama File | Fungsi |
| :--- | :--- |
| **`PUASAKU-SRT1Kediri-PlayStore-Release.aab`** | File bertanda tangan (*Signed*) yang langsung diunggah ke **Google Play Console** |
| **`PUASAKU-SRT1Kediri-Release-Signed.apk`** | File APK bertanda tangan untuk di-install & dites langsung di HP santri / pembina |
| **`assetlinks.json`** | File verifikasi Digital Asset Links (sudah otomatis terisi SHA-256 fingerprint dari keystore) |
| **`release-keystore.zip`** | Cadangan file keystore release beserta passwordnya |

---

## 🔗 Langkah Terakhir: Memasang `assetlinks.json` di Hosting

Agar tampilan aplikasi di HP **bersih tanpa bilah alamat browser (full screen native look)**, Google mewajibkan domain Anda menyajikan file `assetlinks.json`.

1. Ambil file `assetlinks.json` dari hasil build di atas.
2. Salin isi atau file tersebut ke dalam folder:
   `public/.well-known/assetlinks.json`
3. Deploy / unggah web Anda ke server hosting.
4. Pastikan file tersebut dapat diakses melalui browser di alamat:
   `https://domain-anda.com/.well-known/assetlinks.json`

Sekarang aplikasi Anda siap diunggah ke Google Play Store dan akan selalu otomatis ter-update setiap kali ada perubahan pada sistem web!
