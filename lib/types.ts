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

export interface Usulan {
  id: string;
  skpd: string;
  tanggal: string;
  tahap: string;
  ket: string;
  nilai: number;
  status: StatusKey;
  jenis?: JenisPersetujuan;
  tglVerifikasi?: string;
  catatan?: string;
  disetujui?: number;
  dokumen?: string;
  subKegiatanId?: string;
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
  | "monitor"
  | "verifikasi"
  | "ppkd"
  | "sekda"
  | "tapd"
  | "laporan";

export type ToastKind = "ok" | "err" | "info";

export interface SubKegiatan {
  id: string;
  nama: string;
  deskripsi: string;
}
