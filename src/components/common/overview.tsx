"use client"

import { useApp } from "@/context/app-context"
import { ROLES, TAHAP } from "@/lib/constants"
import { SectionHead } from "@/components/shared/section-head"
import { StatusKey } from "@/types"

export default function Overview() {
  const { role, skpdList, usulanList, jadwalList } = useApp()
  if (!role) return null
  const def = ROLES[role]

  const cnt = (s: StatusKey) => usulanList.filter((u) => u.status === s).length

  const kpiMap: Record<string, [string, number | string, string][]> = {
    admin: [
      ["Total SKPD", skpdList.length, "akun terdaftar"],
      ["Jadwal Aktif", jadwalList.length, "tahun 2026"],
      ["Usulan Masuk", usulanList.length, "semua tahap"],
      ["Tahap Usulan", TAHAP.length, ""],
    ],
    skpd: [
      ["Usulan Saya", 3, ""],
      ["Draft", cnt("draft"), ""],
      ["Diproses", cnt("verifikasi") + cnt("tapd"), ""],
      ["Disetujui", cnt("disetujui"), ""],
    ],
    verifikator: [
      ["Perlu Verifikasi", cnt("verifikasi") + cnt("diajukan"), ""],
      ["Diteruskan", cnt("tapd"), ""],
      ["Dikembalikan", cnt("revisi"), ""],
      ["Total Usulan", usulanList.length, ""],
    ],
    tapd: [
      ["Menunggu Keputusan", cnt("tapd"), ""],
      ["Disetujui", cnt("disetujui"), ""],
      ["Ditolak", cnt("ditolak"), ""],
      [
        "Sekda / PPKD / TAPD",
        `${usulanList.filter((u) => u.jenis === "Sekda").length} / ${
          usulanList.filter((u) => u.jenis === "PPKD").length
        } / ${
          usulanList.filter((u) => u.jenis === "TAPD").length
        }`,
        "",
      ],
    ],
  }

  return (
    <div>
      <SectionHead title={`Selamat datang, ${def.name}`} desc={def.desc} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpiMap[role].map((k) => (
          <div
            key={k[0]}
            className="rounded-xl2 border border-border bg-card px-[18px] py-4 shadow-sm2"
          >
            <div className="text-xs font-medium uppercase tracking-[0.04em] text-muted-fg">
              {k[0]}
            </div>
            <div className="mt-1.5 text-2xl font-semibold">{k[1]}</div>
            {k[2] && <div className="mt-0.5 text-xs text-muted-fg">{k[2]}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
