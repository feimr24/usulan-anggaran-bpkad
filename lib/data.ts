import { Jadwal, JenisPersetujuan, RoleDef, Skpd, StatusKey, TahunAnggaran, Usulan } from "./types";

export const ROLES: Record<string, RoleDef> = {
  admin: {
    key: "admin",
    name: "Admin",
    short: "Administrator",
    initials: "AD",
    desc: "Mengelola data master: akun SKPD dan jadwal usulan.",
    color: "hsl(8 58% 44%)",
    colorClass: "bg-primary",
    nav: [
      { key: "overview", label: "Ringkasan" },
      { key: "akun", label: "Akun SKPD" },
      { key: "jadwal", label: "Jadwal Usulan" },
      { key: "subkegiatan", label: "Sub Kegiatan" },
      { key: "tahun", label: "Tahun Anggaran" },
      { key: "adminmonitor", label: "Monitoring" },
    ],
  },
  skpd: {
    key: "skpd",
    name: "SKPD / Pengusul",
    short: "Pengusul",
    initials: "SK",
    desc: "Menginput, menyimpan draft, dan mengirim usulan anggaran serta memantau status.",
    color: "hsl(220 50% 44%)",
    colorClass: "bg-blue-700",
    nav: [
      { key: "overview", label: "Ringkasan" },
      { key: "monitor", label: "Monitor Status" },
    ],
  },
  verifikator: {
    key: "verifikator",
    name: "Verifikator",
    short: "Verifikator BPKAD",
    initials: "VF",
    desc: "Memverifikasi kelengkapan data dan kesesuaian usulan dengan pedoman anggaran.",
    color: "hsl(38 60% 42%)",
    colorClass: "bg-amber-700",
    nav: [
      { key: "overview", label: "Ringkasan" },
      { key: "verifikasi", label: "Verifikasi Usulan" },
    ],
  },
  tapd: {
    key: "tapd",
    name: "TAPD",
    short: "Pemutus",
    initials: "TP",
    desc: "Menyetujui atau menolak usulan melalui jalur Sekda, PPKD, atau TAPD.",
    color: "hsl(295 45% 42%)",
    colorClass: "bg-fuchsia-800",
    nav: [
      { key: "overview", label: "Ringkasan" },
      { key: "sekda", label: "Persetujuan Sekda" },
      { key: "ppkd", label: "Persetujuan PPKD" },
      { key: "tapd", label: "Persetujuan TAPD" },
      { key: "laporan", label: "Laporan" },
    ],
  },
};

export const ORDER: Array<keyof typeof ROLES> = ["admin", "skpd", "verifikator", "tapd"];

export const STATUS: Record<StatusKey, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-fg border-border" },
  diajukan: {
    label: "Diajukan",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  verifikasi: {
    label: "Menunggu Verifikasi",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  tapd: {
    label: "Menunggu Persetujuan TAPD",
    className: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  },
  disetujui: {
    label: "Disetujui",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  ditolak: {
    label: "Ditolak",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  revisi: {
    label: "Revisi",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

export const TAHAP = [
  "Rancangan APBD",
  "Pergeseran APBD",
  "Rancangan APBD Perubahan",
  "Pergeseran APBD Perubahan",
];

export const JENIS: JenisPersetujuan[] = ["Sekda", "PPKD", "TAPD"];

export const INITIAL_SKPD: Skpd[] = [
  {
    id: "1",
    nama: "Dinas Pendidikan",
    kepala: "Drs. H. Ardiansyah, M.Si.",
    nip: "196703121990031008",
    pangkat: "Pembina Utama Muda (IV/c)",
    userId: "pendidikan01",
    password: "pendidikan123",
  },
  {
    id: "2",
    nama: "Dinas Kesehatan",
    kepala: "dr. Fenty Aprina, M.Kes.",
    nip: "197105182000122003",
    pangkat: "Pembina Tk. I (IV/b)",
    userId: "kesehatan01",
    password: "kesehatan123",
  },
  {
    id: "3",
    nama: "Dinas PU dan Penataan Ruang",
    kepala: "Ir. Ahmad Bastari",
    nip: "196812101995031004",
    pangkat: "Pembina Utama Muda (IV/c)",
    userId: "pupr01",
    password: "pupr123",
  },
];

export const CURRENT_SKPD = INITIAL_SKPD[0];

export const INITIAL_USULAN: Usulan[] = [
  {
    id: "USL-2026-001",
    skpd: "Dinas Pendidikan",
    tanggal: "2026-07-02",
    tahap: "Rancangan APBD",
    ket: "Rehabilitasi ruang kelas SDN 12",
    nilai: 1250000000,
    status: "tapd",
    jenis: "TAPD",
    tglVerifikasi: "2026-07-03",
    dokumen: "usulan-rehab-sdn12.pdf",
  },
  {
    id: "USL-2026-002",
    skpd: "Dinas Kesehatan",
    tanggal: "2026-07-03",
    tahap: "Rancangan APBD",
    ket: "Pengadaan alat kesehatan puskesmas",
    nilai: 875000000,
    status: "verifikasi",
    dokumen: "alkes-puskesmas.pdf",
  },
  {
    id: "USL-2026-003",
    skpd: "Dinas PU dan Penataan Ruang",
    tanggal: "2026-07-03",
    tahap: "Pergeseran APBD",
    ket: "Perbaikan drainase Jl. Sudirman",
    nilai: 2100000000,
    status: "tapd",
    jenis: "PPKD",
    tglVerifikasi: "2026-07-04",
    dokumen: "drainase-sudirman.pdf",
  },
  {
    id: "USL-2026-004",
    skpd: "Dinas Sosial",
    tanggal: "2026-07-04",
    tahap: "Rancangan APBD",
    ket: "Bantuan sosial warga terdampak",
    nilai: 540000000,
    status: "revisi",
    tglVerifikasi: "2026-07-05",
    catatan: "Lampirkan rincian penerima bantuan.",
    dokumen: "bansos-warga.pdf",
  },
  {
    id: "USL-2026-005",
    skpd: "Badan Perencanaan Pembangunan Daerah",
    tanggal: "2026-07-05",
    tahap: "Rancangan APBD",
    ket: "Penyusunan dokumen perencanaan",
    nilai: 320000000,
    status: "disetujui",
    jenis: "PPKD",
    nominalFinal: 300000000,
    tglVerifikasi: "2026-07-06",
    tglPersetujuan: "2026-07-07",
    dokumen: "dokumen-perencanaan.pdf",
  },
  {
    id: "USL-2026-006",
    skpd: "Dinas Pendidikan",
    tanggal: "2026-07-06",
    tahap: "Rancangan APBD",
    ket: "Pengadaan buku perpustakaan",
    nilai: 180000000,
    status: "diajukan",
    dokumen: "buku-perpustakaan.pdf",
  },
  {
    id: "USL-2026-007",
    skpd: "Dinas Kesehatan",
    tanggal: "2026-07-06",
    tahap: "Rancangan APBD",
    ket: "Renovasi gedung puskesmas Ilir Barat",
    nilai: 960000000,
    status: "ditolak",
    jenis: "Sekda",
    tglVerifikasi: "2026-07-07",
    dokumen: "renovasi-puskesmas.pdf",
  },
  {
    id: "USL-2026-008",
    skpd: "Dinas Pendidikan",
    tanggal: "2026-07-07",
    tahap: "Rancangan APBD",
    ket: "Penerangan perpustakaan sekolah",
    nilai: 430000000,
    status: "draft",
    dokumen: "penerangan-perpus.pdf",
  },
];

export const INITIAL_JADWAL: Jadwal[] = [
  {
    id: "1",
    tahun: "2026",
    buka: "2026-07-01 08:00",
    tutup: "2026-07-15 23:59",
    tahap: "Rancangan APBD",
    ket: "Pengusulan awal APBD murni",
    aktif: true,
  },
  {
    id: "2",
    tahun: "2026",
    buka: "2026-09-01 08:00",
    tutup: "2026-09-10 23:59",
    tahap: "Pergeseran APBD",
    ket: "Pergeseran antar sub kegiatan",
    aktif: false,
  },
];

export const INITIAL_TAHUN: TahunAnggaran[] = [
  { id: "1", tahun: "2026", aktif: true },
  { id: "2", tahun: "2025", aktif: false },
  { id: "3", tahun: "2024", aktif: false },
];
