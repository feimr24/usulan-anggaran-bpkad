# Sistem Usulan Anggaran — BPKAD Kota Palembang (Next.js)

Konversi penuh dari prototipe HTML (`preview-usulan-anggaran-v5.html`) menjadi aplikasi **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, dengan struktur komponen yang rapi dan dapat dikembangkan lebih lanjut.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka http://localhost:3000

Untuk build produksi:

```bash
npm run build
npm run start
```

## Struktur proyek

```
app/
  layout.tsx          -> root layout (font Inter & Newsreader via Google Fonts)
  page.tsx            -> entry point, membungkus AppShell dengan AppProvider
  globals.css         -> token warna & style dasar (setara :root CSS asli)

context/
  AppContext.tsx      -> state global: role aktif, menu aktif, data SKPD/Usulan/Jadwal, toast

components/
  Login.tsx           -> layar login/pilih aktor (mode pengujian)
  Sidebar.tsx          -> navigasi kiri, menyesuaikan menu per role
  Topbar.tsx           -> header + role switcher
  Toast.tsx            -> notifikasi toast
  Modal.tsx            -> dialog generik (head/body/foot)
  DetailHighlight.tsx  -> kartu ringkasan usulan (dipakai di beberapa dialog)
  ui.tsx               -> Button, Badge, Card, SectionHead, EmptyState
  ViewRouter.tsx        -> memilih tampilan sesuai role + menu aktif
  AppShell.tsx          -> switch antara Login <-> Dashboard

  views/
    Overview.tsx         -> ringkasan KPI per role
    AkunSkpd.tsx          -> (Admin) kelola akun SKPD — CRUD
    JadwalUsulan.tsx      -> (Admin) kelola jadwal usulan — CRUD
    MonitorStatus.tsx     -> (SKPD) input usulan + monitor status
    VerifikasiUsulan.tsx  -> (Verifikator) verifikasi usulan masuk & riwayat
    Persetujuan.tsx       -> (TAPD) persetujuan PA/PPKD & TAPD/Sekda (reusable)
    Laporan.tsx           -> (TAPD) rekap laporan

lib/
  types.ts    -> semua tipe domain (Role, Usulan, Skpd, Jadwal, Status, dst)
  data.ts     -> data awal (mock) — SKPD, Usulan, Jadwal, definisi Role & Status
  format.ts   -> helper rupiah(), today(), uid()
```

## Alur & fitur yang sudah direplikasi 1:1 dari prototipe

- **Login mode pengujian**: pilih salah satu dari 4 aktor (Admin, SKPD/Pengusul, Verifikator, TAPD) — kredensial diabaikan.
- **Admin**: kelola Akun SKPD (tambah/edit/hapus, pencarian) dan Jadwal Usulan (tambah/edit/hapus).
- **SKPD**: Monitor Status usulan dengan filter tab per status, Input Usulan (simpan draft / ajukan), dan detail dokumen usulan.
- **Verifikator**: Verifikasi usulan masuk (proses ke PA/PPKD atau TAPD/Sekda, atau kembalikan untuk revisi), serta riwayat verifikasi.
- **TAPD**: Persetujuan PA/PPKD dan TAPD/Sekda (setujui/tolak), serta halaman Laporan.
- **Role switcher** di topbar untuk berpindah aktor tanpa logout penuh.
- **Toast notification**, sidebar collapsible, dan seluruh gaya visual (warna, tipografi Inter + Newsreader, radius, shadow) mengikuti desain asli.

## Catatan pengembangan lanjutan

Saat ini seluruh data (SKPD, Usulan, Jadwal) disimpan di **React state** (in-memory, direset saat refresh) — persis seperti perilaku prototipe asli. Untuk produksi, langkah lanjutan yang wajar:

1. Ganti `AppContext` agar mengambil/menyimpan data lewat API routes (`app/api/...`) atau backend terpisah.
2. Tambahkan autentikasi sungguhan (NextAuth/JWT) menggantikan pemilihan aktor bebas di layar login.
3. Tambahkan validasi & penguncian jadwal (input di luar rentang jadwal dikunci otomatis — saat ini belum divalidasi secara ketat di form Input Usulan).
4. Hubungkan tombol ekspor Excel/PDF di halaman Laporan ke pustaka nyata (mis. `xlsx`, `@react-pdf/renderer`) — saat ini masih placeholder (`window.print()`).
