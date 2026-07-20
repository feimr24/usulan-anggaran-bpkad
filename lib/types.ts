export type Role = "admin" | "skpd" | "verifikator" | "tapd";

export type StatusKey =
  | "draft"
  | "diajukan"
  | "verifikasi"
  | "tapd"
  | "disetujui"
  | "ditolak"
  | "revisi";

export type JenisPersetujuan = "Sekda" | "PPKD" | "TAPD";

export interface Skpd {
  id: string;
  nama: string;
  kepala: string;
  nip: string;
  pangkat: string;
  userId: string;
  password: string;
}

export interface Jadwal {
  id: string;
  tahun: string;
  tahap: string;
  buka: string;
  tutup: string;
  ket: string;
  aktif: boolean;
}

export type SubKegiatanEntryStatus = "approved" | "rejected" | "adjusted";

export interface SubKegiatanEntry {
  subKegiatanId: string;
  anggaran: number;
  status?: SubKegiatanEntryStatus;
}

export interface Usulan {
  id: string;
  nomorUsulan?: string;
  skpd: string;
  tanggal: string;
  tahap: string;
  ket?: string;
  nilai: number;
  status: StatusKey;
  jenis?: JenisPersetujuan;
  tglVerifikasi?: string;
  catatan?: string;
  nominalFinal?: number;
  catatanPersetujuan?: string;
  tglPersetujuan?: string;
  dokumen?: string;
  subKegiatanEntries?: SubKegiatanEntry[];
}

export interface RoleDef {
  key: Role;
  name: string;
  short: string;
  initials: string;
  desc: string;
  colorClass: string;
  color: string;
  nav: { key: string; label: string }[];
}

export type MenuKey =
  | "overview"
  | "akun"
  | "jadwal"
  | "subkegiatan"
  | "tahun"
  | "adminmonitor"
  | "monitor"
  | "verifikasi"
  | "ppkd"
  | "sekda"
  | "tapd"
  | "laporan";

export type ToastKind = "ok" | "err" | "info";

export interface SubKegiatan {
  id: string;
  kode?: string;
  nama: string;
  deskripsi: string;
}

export interface TahunAnggaran {
  id: string;
  tahun: string;
  aktif: boolean;
}
