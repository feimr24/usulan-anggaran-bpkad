export type Role = "admin" | "skpd" | "verifikator" | "tapd"

export type StatusKey =
  | "draft"
  | "diajukan"
  | "verifikasi"
  | "tapd"
  | "disetujui"
  | "ditolak"
  | "revisi"

export type JenisPersetujuan = "Sekda" | "PPKD" | "TAPD"

export type SubKegiatanEntryStatus = "approved" | "rejected" | "adjusted"

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
  | "laporan"

export type ToastKind = "ok" | "err" | "info"
