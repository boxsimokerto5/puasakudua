import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Student } from '../types';
import { processAndCompressImage, getOptimizedPhotoUrl, normalizeImageUrl } from '../utils/imageUtils';
import {
  getImgBbApiKey,
  saveImgBbApiKey,
  uploadToImgBb,
  testImgBbApiKey,
} from '../utils/imgbb';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  Link as LinkIcon,
  User,
  Eye,
  Sliders,
  Cloud,
  Key,
  Globe,
  HardDrive,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface StudentPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  targetStudent?: Student | null; // If opening directly for a single student
}

export const StudentPhotoUploadModal: React.FC<StudentPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  targetStudent: initialTargetStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'gallery'>('single');
  const [selectedStudentId, setSelectedStudentId] = useState<number>(() => {
    return initialTargetStudent?.id || (students.length > 0 ? students[0].id : 1);
  });

  // ImgBB Cloud API Key state
  const [imgBbApiKey, setImgBbApiKeyState] = useState<string>(() => getImgBbApiKey());
  const [isImgBbConfigOpen, setIsImgBbConfigOpen] = useState<boolean>(false);
  const [tempApiKeyInput, setTempApiKeyInput] = useState<string>(() => getImgBbApiKey());
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [keyTestFeedback, setKeyTestFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string>('');

  // When initialTargetStudent changes
  useEffect(() => {
    if (initialTargetStudent) {
      setSelectedStudentId(initialTargetStudent.id);
      setActiveTab('single');
    }
  }, [initialTargetStudent]);

  // Keep temp API key in sync with current saved key
  useEffect(() => {
    const key = getImgBbApiKey();
    setImgBbApiKeyState(key);
    setTempApiKeyInput(key);
  }, [isOpen]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'HAS_PHOTO' | 'NO_PHOTO'>('ALL');

  // Single upload states
  const [urlInput, setUrlInput] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Batch upload states
  const [batchResults, setBatchResults] = useState<
    Array<{ fileName: string; student: Student; previewUrl: string; matchedBy: string; rawFile?: File }>
  >([]);
  const [unmatchedFiles, setUnmatchedFiles] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgressText, setBatchProgressText] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Currently selected student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Unique classes for filter
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.kelas) set.add(s.kelas.trim());
    });
    return Array.from(set);
  }, [students]);

  // Filtered students for gallery & selector
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = filterClass === 'SEMUA' || s.kelas === filterClass;
      const matchStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'HAS_PHOTO'
          ? !!s.foto
          : !s.foto;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        (s.nik && s.nik.includes(q)) ||
        s.kelas.toLowerCase().includes(q) ||
        s.no.toString() === q;
      return matchClass && matchStatus && matchSearch;
    });
  }, [students, filterClass, filterStatus, searchQuery]);

  // Photo stats
  const photoStats = useMemo(() => {
    const total = students.length;
    const hasPhoto = students.filter((s) => !!s.foto).length;
    const cloudPhoto = students.filter((s) => s.foto && (s.foto.startsWith('http://') || s.foto.startsWith('https://'))).length;
    const noPhoto = total - hasPhoto;
    const pct = total > 0 ? Math.round((hasPhoto / total) * 100) : 0;
    return { total, hasPhoto, cloudPhoto, noPhoto, pct };
  }, [students]);

  // Stop camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Test & Save ImgBB API Key
  const handleSaveApiKey = async () => {
    setIsTestingKey(true);
    setKeyTestFeedback(null);
    const cleanKey = tempApiKeyInput.trim();

    if (!cleanKey) {
      saveImgBbApiKey('');
      setImgBbApiKeyState('');
      setIsTestingKey(false);
      setKeyTestFeedback({
        success: true,
        text: 'API Key ImgBB dihapus. Sistem beralih ke mode penyimpanan lokal.',
      });
      return;
    }

    const testRes = await testImgBbApiKey(cleanKey);
    setIsTestingKey(false);
    if (testRes.valid) {
      saveImgBbApiKey(cleanKey);
      setImgBbApiKeyState(cleanKey);
      setKeyTestFeedback({
        success: true,
        text: '✅ Koneksi ImgBB Berhasil! Foto santri akan otomatis di-host gratis di Cloud ImgBB.',
      });
      setTimeout(() => {
        setIsImgBbConfigOpen(false);
      }, 2000);
    } else {
      setKeyTestFeedback({
        success: false,
        text: `❌ Gagal: ${testRes.message}`,
      });
    }
  };

  if (!isOpen) return null;

  // Start Camera
  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to open camera:', err);
      setIsCameraActive(false);
      setMessage({
        type: 'error',
        text: 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.',
      });
    }
  };

  // Capture photo from video stream
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current || !currentStudent) return;
    setIsProcessing(true);
    setUploadProgressStatus(imgBbApiKey ? 'Mengunggah foto ke Cloud ImgBB...' : 'Menyimpan foto...');

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context error');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      let finalPhotoUrl = dataUrl;
      let usedCloud = false;

      // Upload to ImgBB if key exists
      if (imgBbApiKey) {
        setUploadProgressStatus('Mengunggah ke Cloud ImgBB...');
        const cloudRes = await uploadToImgBb(dataUrl, imgBbApiKey);
        if (cloudRes.success && cloudRes.url) {
          finalPhotoUrl = cloudRes.url;
          usedCloud = true;
        } else {
          console.warn('ImgBB fallback to local base64:', cloudRes.error);
        }
      }

      // Update student photo
      const updated = students.map((s) =>
        s.id === currentStudent.id ? { ...s, foto: finalPhotoUrl } : s
      );
      onUpdateStudents(updated);
      stopCamera();

      setMessage({
        type: 'success',
        text: usedCloud
          ? `Foto untuk ${currentStudent.nama} berhasil diambil & disimpan di Cloud ImgBB (Database Ringan)!`
          : `Foto untuk ${currentStudent.nama} berhasil diambil dan disimpan!`,
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal mengambil foto dari kamera.' });
    } finally {
      setIsProcessing(false);
      setUploadProgressStatus('');
    }
  };

  // File Upload (Single)
  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentStudent) return;

    setIsProcessing(true);
    setUploadProgressStatus(imgBbApiKey ? 'Mengunggah foto ke Cloud ImgBB...' : 'Memproses foto...');

    try {
      const compressedDataUrl = await processAndCompressImage(file, 400, 500, 0.85);
      let finalPhotoUrl = compressedDataUrl;
      let usedCloud = false;

      if (imgBbApiKey) {
        setUploadProgressStatus('Mengunggah ke Cloud ImgBB...');
        const cloudRes = await uploadToImgBb(compressedDataUrl, imgBbApiKey);
        if (cloudRes.success && cloudRes.url) {
          finalPhotoUrl = cloudRes.url;
          usedCloud = true;
        } else {
          console.warn('ImgBB upload error:', cloudRes.error);
        }
      }

      const updated = students.map((s) =>
        s.id === currentStudent.id ? { ...s, foto: finalPhotoUrl } : s
      );
      onUpdateStudents(updated);

      setMessage({
        type: 'success',
        text: usedCloud
          ? `Foto untuk ${currentStudent.nama} berhasil diunggah ke Cloud ImgBB (Database Aman & Ringan)!`
          : `Foto untuk ${currentStudent.nama} berhasil diunggah!`,
      });

      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal memproses file foto.' });
    } finally {
      setIsProcessing(false);
      setUploadProgressStatus('');
    }
  };

  // URL Submit
  const handleApplyUrl = () => {
    if (!urlInput.trim() || !currentStudent) return;
    const cleanUrl = normalizeImageUrl(urlInput.trim());
    const updated = students.map((s) =>
      s.id === currentStudent.id ? { ...s, foto: cleanUrl } : s
    );
    onUpdateStudents(updated);
    setUrlInput('');
    setMessage({
      type: 'success',
      text: `Link foto untuk ${currentStudent.nama} berhasil diterapkan!`,
    });
  };

  // Remove Photo
  const handleRemovePhoto = (studentId: number) => {
    const student = students.find((s) => s.id === studentId);
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, foto: undefined } : s
    );
    onUpdateStudents(updated);
    setMessage({
      type: 'success',
      text: `Foto untuk ${student?.nama || 'santri'} berhasil dihapus (kembali ke avatar default).`,
    });
  };

  // Batch Multi-File Upload & Matching Engine
  const handleBatchFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgressText('Mencocokkan file foto dengan data santri...');
    const matched: Array<{ fileName: string; student: Student; previewUrl: string; matchedBy: string; rawFile: File }> = [];
    const unmatched: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').trim();
      const cleanName = nameWithoutExt.toLowerCase();

      // Matching algorithm:
      // 1. Exact NIK match
      let target = students.find(
        (s) => s.nik && s.nik.replace(/\D/g, '') === cleanName.replace(/\D/g, '') && s.nik.length >= 6
      );
      let matchType = 'NIK';

      // 2. Exact No. Urut (e.g. "1.jpg", "no_1.jpg", "001.png")
      if (!target) {
        const numMatch = cleanName.match(/(?:no[_\s-]?)?(\d{1,4})/);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          target = students.find((s) => s.no === num);
          matchType = `No. Urut #${num}`;
        }
      }

      // 3. Name Match
      if (!target) {
        target = students.find(
          (s) =>
            s.nama.toLowerCase().replace(/[^a-z]/g, '') ===
              cleanName.replace(/[^a-z]/g, '') ||
            (cleanName.length > 5 && s.nama.toLowerCase().includes(cleanName))
        );
        matchType = 'Nama Santri';
      }

      if (target) {
        try {
          const dataUrl = await processAndCompressImage(file, 400, 500, 0.85);
          matched.push({
            fileName: file.name,
            student: target,
            previewUrl: dataUrl,
            matchedBy: matchType,
            rawFile: file,
          });
        } catch (err) {
          console.error(err);
          unmatched.push(file.name);
        }
      } else {
        unmatched.push(file.name);
      }
    }

    setBatchResults(matched);
    setUnmatchedFiles(unmatched);
    setIsBatchProcessing(false);
    setBatchProgressText('');
    if (batchFileInputRef.current) batchFileInputRef.current.value = '';
  };

  // Apply Batch Results (with ImgBB Cloud sequential uploading if key is active)
  const handleApplyBatch = async () => {
    if (batchResults.length === 0) return;

    setIsBatchProcessing(true);
    const photoMap = new Map<number, string>();
    let cloudUploadCount = 0;

    for (let i = 0; i < batchResults.length; i++) {
      const item = batchResults[i];
      let photoUrl = item.previewUrl;

      if (imgBbApiKey) {
        setBatchProgressText(
          `Mengunggah ke Cloud ImgBB (${i + 1}/${batchResults.length}): ${item.student.nama}...`
        );
        try {
          const cloudRes = await uploadToImgBb(item.previewUrl, imgBbApiKey);
          if (cloudRes.success && cloudRes.url) {
            photoUrl = cloudRes.url;
            cloudUploadCount++;
          }
        } catch (err) {
          console.error(`Gagal upload ImgBB untuk ${item.student.nama}:`, err);
        }
      }

      photoMap.set(item.student.id, photoUrl);
    }

    const updated = students.map((s) => {
      if (photoMap.has(s.id)) {
        return { ...s, foto: photoMap.get(s.id) };
      }
      return s;
    });

    onUpdateStudents(updated);
    setIsBatchProcessing(false);
    setBatchProgressText('');

    setMessage({
      type: 'success',
      text: imgBbApiKey
        ? `Berhasil menerapkan ${batchResults.length} foto! (${cloudUploadCount} tersimpan di Cloud ImgBB)`
        : `Berhasil menerapkan ${batchResults.length} foto santri sekaligus!`,
    });
    setBatchResults([]);
    setUnmatchedFiles([]);
    setActiveTab('gallery');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Kelola & Upload Foto Santri
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950 uppercase tracking-wider">
                  {photoStats.hasPhoto}/{photoStats.total} Terpasang ({photoStats.pct}%)
                </span>
                {imgBbApiKey ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-400 text-teal-950 flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Cloud ImgBB Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-emerald-100 flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> Mode Lokal
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200">
                Unggah foto per santri, jepret dari kamera langsung, atau impor massal ke Cloud ImgBB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImgBbConfigOpen(!isImgBbConfigOpen)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isImgBbConfigOpen
                  ? 'bg-amber-400 text-emerald-950 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Pengaturan API Key ImgBB"
            >
              <Key className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">API Key ImgBB</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ImgBB Cloud Config Drawer / Banner */}
        {isImgBbConfigOpen && (
          <div className="bg-gradient-to-r from-teal-950 to-emerald-950 text-white p-5 border-b border-teal-800/60 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-800 text-amber-300">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Integrasi ImgBB Cloud Image Hosting</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-500/30 text-teal-200 border border-teal-400/40">
                        Gratis & Hemat Database
                      </span>
                    </h3>
                    <p className="text-xs text-teal-200/90 mt-0.5">
                      Foto santri akan otomatis di-host permanen di cloud ImgBB, sehingga database (Supabase/LocalStorage) hanya menyimpan URL teks pendek (menghemat kuota penyimpanan hingga 99%).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsImgBbConfigOpen(false)}
                  className="text-teal-400 hover:text-white text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {/* API Key Input & Action */}
              <div className="bg-teal-900/50 p-3.5 rounded-2xl border border-teal-700/50 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={tempApiKeyInput}
                      onChange={(e) => setTempApiKeyInput(e.target.value)}
                      placeholder="Tempel API Key ImgBB di sini (contoh: 8e5f1b2c4d...)"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-teal-950/80 border border-teal-600 rounded-xl text-white placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveApiKey}
                      disabled={isTestingKey}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isTestingKey ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menguji...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Uji & Simpan Key</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://api.imgbb.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-teal-600"
                      title="Dapatkan API Key ImgBB Gratis"
                    >
                      <span>Dapatkan API Key Gratis</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {keyTestFeedback && (
                  <p
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      keyTestFeedback.success ? 'text-teal-300' : 'text-rose-300'
                    }`}
                  >
                    <span>{keyTestFeedback.text}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ImgBB Connected Status Strip */}
        {!isImgBbConfigOpen && (
          <div className="bg-teal-50 border-b border-teal-100 px-6 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-teal-700" />
              {imgBbApiKey ? (
                <span className="text-teal-900 font-medium">
                  <strong>ImgBB Cloud Aktif:</strong> Foto santri langsung diunggah ke cloud gratis ImgBB (Database 100% aman & ringan).
                </span>
              ) : (
                <span className="text-slate-600">
                  <strong>Penyimpanan Foto:</strong> Mode Lokal (Base64). Sambungkan ImgBB API Key untuk menghemat kapasitas database.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsImgBbConfigOpen(true)}
              className="text-[11px] font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
            >
              {imgBbApiKey ? 'Kelola API Key' : '+ Hubungkan API Key ImgBB'}
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab('single');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Upload / Foto Satuan</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setActiveTab('batch');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Upload Massal (Batch Match)</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setActiveTab('gallery');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Galeri Seluruh Foto ({photoStats.hasPhoto})</span>
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Ada Foto: <strong>{photoStats.hasPhoto}</strong> ({photoStats.cloudPhoto} di Cloud)
            </span>
            <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Belum Ada: <strong>{photoStats.noPhoto}</strong>
            </span>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between shrink-0 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload in Progress Alert */}
        {(isProcessing || isBatchProcessing) && uploadProgressStatus && (
          <div className="mx-6 mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-900 flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 text-teal-700 animate-spin" />
            <span>{uploadProgressStatus || batchProgressText}</span>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SINGLE SANTRI PHOTO UPLOADER */}
          {activeTab === 'single' && currentStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Student Selector & Info (5 cols) */}
              <div className="lg:col-span-5 bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Pilih Santri yang Ingin Diberi Foto:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(Number(e.target.value));
                      stopCamera();
                    }}
                    className="w-full p-2.5 text-xs font-bold bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.foto ? '✅ ' : '⚪ '} No.{s.no} - {s.nama} ({s.kelas})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Card Summary Mini */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    {/* Avatar Preview */}
                    <div className="w-14 h-18 rounded-xl bg-slate-100 border border-gray-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-xs">
                      {currentStudent.foto ? (
                        <img
                          src={getOptimizedPhotoUrl(currentStudent.foto, { width: 140, height: 180 })}
                          alt={currentStudent.nama}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <span className="text-xl">
                            {currentStudent.jenisKelamin === 'Perempuan' ? '🧕' : '👳'}
                          </span>
                          <p className="text-[7px] text-gray-400 font-bold uppercase mt-0.5">
                            Avatar
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                        Kelas {currentStudent.kelas}
                      </span>
                      <h4 className="text-xs font-extrabold text-gray-900 truncate">
                        {currentStudent.nama}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono">
                        NIK: {currentStudent.nik || '-'} | No. #{currentStudent.no}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {currentStudent.jenisKelamin}
                      </p>
                      {currentStudent.foto && (currentStudent.foto.startsWith('http://') || currentStudent.foto.startsWith('https://')) && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          <Cloud className="w-2.5 h-2.5" /> Ter-host di Cloud
                        </span>
                      )}
                    </div>
                  </div>

                  {currentStudent.foto && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto telah terpasang
                      </span>
                      <button
                        onClick={() => handleRemovePhoto(currentStudent.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus Foto
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Navigation Previous / Next Student */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => {
                      const idx = students.findIndex((s) => s.id === selectedStudentId);
                      if (idx > 0) {
                        setSelectedStudentId(students[idx - 1].id);
                        stopCamera();
                      }
                    }}
                    disabled={students.findIndex((s) => s.id === selectedStudentId) === 0}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-1"
                  >
                    ← Santri Sebelumnya
                  </button>
                  <button
                    onClick={() => {
                      const idx = students.findIndex((s) => s.id === selectedStudentId);
                      if (idx < students.length - 1) {
                        setSelectedStudentId(students[idx + 1].id);
                        stopCamera();
                      }
                    }}
                    disabled={
                      students.findIndex((s) => s.id === selectedStudentId) ===
                      students.length - 1
                    }
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-1"
                  >
                    Santri Berikutnya →
                  </button>
                </div>
              </div>

              {/* Right Column: Upload Actions (Gallery, Camera, URL) (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Pilih Metode Unggah Foto Santri:
                  </h3>
                  {imgBbApiKey ? (
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                      <Cloud className="w-3 h-3" /> Auto-upload ke Cloud ImgBB
                    </span>
                  ) : null}
                </div>

                {/* Action Method 1: Upload from Gallery / Laptop */}
                <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-5 bg-emerald-50/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      Pilih Foto dari Galeri HP / Komputer
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {imgBbApiKey
                        ? 'Foto akan otomatis di-host permanen di ImgBB Cloud & disimpan sebagai link URL.'
                        : 'Mendukung JPG, PNG, atau WebP. Gambar akan otomatis dioptimasi.'}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm active:scale-95">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{uploadProgressStatus || 'Memproses Foto...'}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>Pilih File Gambar</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSingleFileUpload}
                      disabled={isProcessing}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Action Method 2: Live Camera Snapshot */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">
                          Ambil Foto Langsung dari Kamera
                        </h4>
                        <p className="text-[10px] text-gray-500">
                          Gunakan webcam laptop atau kamera HP untuk potret santri langsung
                        </p>
                      </div>
                    </div>

                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Buka Kamera</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Tutup Kamera
                      </button>
                    )}
                  </div>

                  {/* Video viewfinder */}
                  {isCameraActive && (
                    <div className="space-y-3 pt-2">
                      <div className="relative rounded-2xl overflow-hidden bg-black max-w-sm mx-auto aspect-3/4 border-2 border-amber-400 shadow-md flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none m-4" />
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleCaptureSnapshot}
                          disabled={isProcessing}
                          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 mx-auto active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{uploadProgressStatus || 'Menyimpan...'}</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 text-amber-300" />
                              <span>Ambil Foto Sekarang</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Method 3: Tempel URL Link Foto */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Tempel URL Foto Langsung (ImgBB, Google Drive, dsb.)
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Jika sudah memiliki link foto online (https://...), tempel langsung di sini
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://i.ibb.co/.../santri.jpg"
                      className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                    <button
                      onClick={handleApplyUrl}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Terapkan Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BATCH AUTO-MATCH UPLOADER */}
          {activeTab === 'batch' && (
            <div className="space-y-6">
              <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                      <span>Import Foto Santri Sekaligus Banyak (Batch Match)</span>
                      {imgBbApiKey && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-200 text-teal-900">
                          ☁️ Auto-Upload ImgBB
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-purple-900/80 mt-1 leading-relaxed">
                      Sistem akan secara cerdas mencocokkan nama file foto dengan data santri berdasarkan:
                    </p>
                    <ul className="text-[11px] text-purple-950 mt-1 list-disc list-inside space-y-0.5">
                      <li><strong>Nomor NIK Siswa</strong> (contoh: <code className="bg-white/80 px-1 rounded">3506123456789012.jpg</code>)</li>
                      <li><strong>Nomor Urut</strong> (contoh: <code className="bg-white/80 px-1 rounded">1.jpg</code>, <code className="bg-white/80 px-1 rounded">no_12.png</code>)</li>
                      <li><strong>Nama Santri</strong> (contoh: <code className="bg-white/80 px-1 rounded">Ahmad_Fauzi.jpg</code>)</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-all active:scale-95">
                    {isBatchProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{batchProgressText || 'Mencocokkan Foto...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-amber-300" />
                        <span>Pilih / Drop Banyak File Foto Sekaligus</span>
                      </>
                    )}
                    <input
                      ref={batchFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBatchFiles}
                      disabled={isBatchProcessing}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Batch Match Results */}
              {batchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900">
                        Hasil Pencocokan ({batchResults.length} Foto Cocok)
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {imgBbApiKey
                          ? 'Klik tombol di bawah untuk mengunggah semua foto ke Cloud ImgBB secara otomatis.'
                          : 'Periksa hasil pencocokan di bawah sebelum menyimpannya ke data santri.'}
                      </p>
                    </div>
                    <button
                      onClick={handleApplyBatch}
                      disabled={isBatchProcessing}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isBatchProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{batchProgressText || 'Menyimpan ke Cloud...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>
                            {imgBbApiKey
                              ? `Upload ke Cloud ImgBB (${batchResults.length} Foto)`
                              : `Simpan Semua (${batchResults.length} Foto)`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-1">
                    {batchResults.map((res, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-xl p-2 border border-gray-200 space-y-1.5 text-center text-xs"
                      >
                        <div className="w-full aspect-3/4 rounded-lg overflow-hidden bg-slate-200 border border-gray-300">
                          <img
                            src={res.previewUrl}
                            alt={res.student.nama}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="font-extrabold text-gray-900 truncate">{res.student.nama}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-100 text-emerald-800">
                          {res.matchedBy}
                        </span>
                      </div>
                    ))}
                  </div>

                  {unmatchedFiles.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <p className="font-bold">
                        ⚠️ Ada {unmatchedFiles.length} file yang tidak cocok dengan nama/NIK santri:
                      </p>
                      <p className="text-[11px] text-amber-700 font-mono mt-0.5 truncate">
                        {unmatchedFiles.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHOTO GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama santri / NIK..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Class Filter */}
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer font-semibold"
                >
                  <option value="SEMUA">Semua Kelas ({students.length} Siswa)</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer font-semibold"
                >
                  <option value="ALL">Semua Status ({students.length})</option>
                  <option value="HAS_PHOTO">Sudah Ada Foto ({photoStats.hasPhoto})</option>
                  <option value="NO_PHOTO">Belum Ada Foto ({photoStats.noPhoto})</option>
                </select>
              </div>

              {/* Grid of Student Photos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-emerald-500 transition-all shadow-xs hover:shadow-md space-y-2 flex flex-col justify-between group"
                  >
                    {/* Photo / Avatar Viewport */}
                    <div className="w-full aspect-3/4 rounded-xl bg-slate-100 border border-gray-200 overflow-hidden relative flex items-center justify-center">
                      {s.foto ? (
                        <img
                          src={getOptimizedPhotoUrl(s.foto, { width: 200, height: 260 })}
                          alt={s.nama}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-2xl">
                            {s.jenisKelamin === 'Perempuan' ? '🧕' : '👳'}
                          </span>
                          <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                            Belum Ada Foto
                          </p>
                        </div>
                      )}

                      {/* Gender Badge */}
                      <span
                        className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-black text-white ${
                          s.jenisKelamin === 'Perempuan' ? 'bg-pink-600' : 'bg-blue-600'
                        }`}
                      >
                        {s.jenisKelamin === 'Perempuan' ? 'P' : 'L'}
                      </span>

                      {/* Cloud Hosting Badge */}
                      {s.foto && (s.foto.startsWith('http://') || s.foto.startsWith('https://')) && (
                        <span
                          className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 text-teal-300 backdrop-blur-xs shadow-xs"
                          title="Tersimpan di Cloud ImgBB"
                        >
                          <Cloud className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="text-center min-w-0">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase truncate">
                        {s.kelas}
                      </p>
                      <h5 className="text-xs font-bold text-gray-900 truncate leading-tight mt-0.5">
                        {s.nama}
                      </h5>
                      <p className="text-[9px] text-gray-400 font-mono">No. #{s.no}</p>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setActiveTab('single');
                      }}
                      className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-700 hover:text-white text-emerald-800 rounded-xl text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{s.foto ? 'Ganti Foto' : 'Pasang Foto'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            Foto yang terpasang akan otomatis tampil di <strong>Kartu Asrama Santri</strong> dan dokumen raport.
          </p>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
