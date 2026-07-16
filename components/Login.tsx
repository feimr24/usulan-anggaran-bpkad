"use client";

import { useState } from "react";
import { ArrowRight, Info, Landmark } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ROLES } from "@/lib/data";
import { Role } from "@/lib/types";
import { Button } from "./ui";

export default function Login() {
  const { login } = useApp();
  const [role, setRole] = useState<Role | "">("");

  const roleDef = role ? ROLES[role] : null;

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-14 text-primary-fg md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
            <Landmark className="h-5 w-5" />
          </span>
          <div className="text-sm leading-tight">
            <p className="font-semibold">BPKAD</p>
            <p className="text-primary-fg/70">Kota Palembang</p>
          </div>
        </div>
        <div className="relative max-w-[26rem]">
          <h1 className="font-serif text-[38px] font-medium leading-[1.1] tracking-tight">
            Sistem Usulan Anggaran Daerah
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-primary-fg/80">
            Pengajuan, verifikasi, dan persetujuan usulan anggaran dalam satu alur
            yang transparan: dari SKPD pengusul hingga keputusan TAPD.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {["Rancangan APBD", "Pergeseran APBD", "APBD Perubahan"].map((c) => (
              <span
                key={c}
                className="rounded-full bg-white/10 px-3 py-[5px] text-xs shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-primary-fg/60">
          © 2026 Badan Pengelola Keuangan dan Aset Daerah Kota Palembang
        </p>
      </aside>

      {/* Login form */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px] animate-fade">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Masuk
          </p>
          <h2 className="mt-1.5 font-serif text-2xl font-medium tracking-tight">
            Pilih aktor untuk pengujian
          </h2>
          <p className="mt-2 text-sm text-muted-fg">
            Satu login untuk mencoba semua peran. Menu &amp; konten menyesuaikan
            aktor yang dipilih.
          </p>

          <div className="mt-[18px]">
            <label htmlFor="roleSel">Aktor</label>
            <select
              id="roleSel"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="" disabled>
                Pilih aktor…
              </option>
              <option value="admin">Admin</option>
              <option value="skpd">SKPD / Pengusul</option>
              <option value="verifikator">Verifikator</option>
              <option value="tapd">TAPD</option>
            </select>
            <p className="mt-2 min-h-[1.2em] text-xs text-muted-fg">
              {roleDef?.desc ?? ""}
            </p>
          </div>

          <div className="mt-[18px]">
            <label htmlFor="uid">User ID</label>
            <input id="uid" defaultValue="196703121990031008" />
          </div>

          <div className="mt-[18px]">
            <label htmlFor="pwd">Password</label>
            <input id="pwd" type="password" defaultValue="testing123" />
          </div>

          <Button
            variant="primary"
            className="mt-5 w-full"
            disabled={!role}
            onClick={() => role && login(role)}
          >
            <span>{role ? `Masuk sebagai ${ROLES[role].name}` : "Masuk sebagai aktor"}</span>
            <ArrowRight className="h-[15px] w-[15px]" />
          </Button>

          <div className="mt-[18px] flex items-start gap-2 rounded-lg bg-muted/70 px-3 py-2.5 text-xs text-muted-fg">
            <Info className="mt-px h-[15px] w-[15px] flex-none" />
            <span>
              Mode pengujian. Kredensial diabaikan. Nanti login dipisah per aktor
              sesuai PRD.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
