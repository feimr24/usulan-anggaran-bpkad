import { Role, StatusKey, JenisPersetujuan, SubKegiatanEntryStatus } from "./index"

export interface Skpd {
  id: string
  nama: string
  kepala: string
  nip: string
  pangkat: string
  userId: string
  password: string
}

export interface Jadwal {
  id: string
  tahun: string
  tahap: string
  buka: string
  tutup: string
  ket: string
  aktif: boolean
}

export interface SubKegiatanEntry {
  subKegiatanId: string
  anggaran: number
  status?: SubKegiatanEntryStatus
}

export interface Usulan {
  id: string
  nomorUsulan?: string
  skpd: string
  tanggal: string
  tahap: string
  ket?: string
  nilai: number
  status: StatusKey
  jenis?: JenisPersetujuan
  tglVerifikasi?: string
  catatan?: string
  nominalFinal?: number
  catatanPersetujuan?: string
  tglPersetujuan?: string
  dokumen?: string
  subKegiatanEntries?: SubKegiatanEntry[]
}

export interface RoleDef {
  key: Role
  name: string
  short: string
  initials: string
  desc: string
  colorClass: string
  color: string
  nav: { key: string; label: string }[]
}

export interface SubKegiatan {
  id: string
  kode?: string
  nama: string
  deskripsi: string
}

export interface TahunAnggaran {
  id: string
  tahun: string
  aktif: boolean
}
