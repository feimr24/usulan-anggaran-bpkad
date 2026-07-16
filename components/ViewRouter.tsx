"use client";

import { useApp } from "@/context/AppContext";
import Overview from "./views/Overview";
import AkunSkpd from "./views/AkunSkpd";
import JadwalUsulan from "./views/JadwalUsulan";
import MonitorStatus from "./views/MonitorStatus";
import VerifikasiUsulan from "./views/VerifikasiUsulan";
import Persetujuan from "./views/Persetujuan";
import Laporan from "./views/Laporan";
import SubKegiatanView from "./views/SubKegiatan";
import TahunAnggaranView from "./views/TahunAnggaran";
import AdminMonitor from "./views/AdminMonitor";

export default function ViewRouter() {
  const { role, menu } = useApp();
  if (!role) return null;

  if (menu === "overview") return <Overview />;
  if (role === "admin") {
    if (menu === "akun") return <AkunSkpd />;
    if (menu === "jadwal") return <JadwalUsulan />;
    if (menu === "subkegiatan") return <SubKegiatanView />;
    if (menu === "tahun") return <TahunAnggaranView />;
    if (menu === "adminmonitor") return <AdminMonitor />;
  }
  if (role === "skpd" && menu === "monitor") return <MonitorStatus />;
  if (role === "verifikator" && menu === "verifikasi") return <VerifikasiUsulan />;
  if (role === "tapd") {
    if (menu === "sekda") return <Persetujuan jenis="Sekda" />;
    if (menu === "ppkd") return <Persetujuan jenis="PPKD" />;
    if (menu === "tapd") return <Persetujuan jenis="TAPD" />;
    if (menu === "laporan") return <Laporan />;
  }
  return <Overview />;
}
