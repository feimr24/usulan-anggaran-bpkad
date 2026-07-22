"use client"

import { useApp } from "@/context/app-context"
import Overview from "@/components/common/overview"
import AkunSkpd from "@/components/common/akun-skpd"
import JadwalUsulan from "@/components/common/jadwal-usulan"
import MonitorStatus from "@/components/common/monitor-status"
import VerifikasiUsulan from "@/components/common/verifikasi-usulan"
import Persetujuan from "@/components/common/persetujuan"
import Laporan from "@/components/common/laporan"
import SubKegiatanView from "@/components/common/sub-kegiatan"
import TahunAnggaranView from "@/components/common/tahun-anggaran"
import AdminMonitor from "@/components/common/admin-monitor"

export default function ViewRouter() {
  const { role, menu } = useApp()
  if (!role) return null

  if (menu === "overview") return <Overview />
  if (role === "admin") {
    if (menu === "akun") return <AkunSkpd />
    if (menu === "jadwal") return <JadwalUsulan />
    if (menu === "subkegiatan") return <SubKegiatanView />
    if (menu === "tahun") return <TahunAnggaranView />
    if (menu === "adminmonitor") return <AdminMonitor />
  }
  if (role === "skpd" && menu === "monitor") return <MonitorStatus />
  if (role === "verifikator" && menu === "verifikasi") return <VerifikasiUsulan />
  if (role === "tapd") {
    if (menu === "sekda") return <Persetujuan jenis="Sekda" />
    if (menu === "ppkd") return <Persetujuan jenis="PPKD" />
    if (menu === "tapd") return <Persetujuan jenis="TAPD" />
    if (menu === "laporan") return <Laporan />
  }
  return <Overview />
}
