"use client";

import {
  BarChart3,
  CalendarClock,
  Landmark,
  LayoutDashboard,
  ListChecks,
  ClipboardCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ROLES } from "@/lib/data";
import { MenuKey } from "@/lib/types";

const MENU_ICONS: Record<string, React.ElementType> = {
  overview: LayoutDashboard,
  akun: Users,
  jadwal: CalendarClock,
  monitor: ListChecks,
  verifikasi: ClipboardCheck,
  ppkd: Landmark,
  sekda: ShieldCheck,
  laporan: BarChart3,
};

export default function Sidebar() {
  const { role, menu, setMenu, sidebarCollapsed, currentSkpd } = useApp();
  if (!role) return null;
  const def = ROLES[role];

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-none flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ${
        sidebarCollapsed ? "w-[70px]" : "w-64"
      }`}
    >
      <div className="flex h-[60px] items-center gap-2.5 px-4">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-[9px] bg-primary text-primary-fg">
          <Landmark className="h-[17px] w-[17px]" />
        </span>
        {!sidebarCollapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold">Usulan Anggaran</div>
            <div className="text-xs text-muted-fg">BPKAD Palembang</div>
          </div>
        )}
      </div>
      <div className="h-px bg-sidebar-border" />
      <nav className="flex flex-1 flex-col gap-[3px] overflow-y-auto p-3">
        {!sidebarCollapsed && (
          <div className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-fg">
            Menu {def.short}
          </div>
        )}
        {def.nav.map((n) => {
          const Icon = MENU_ICONS[n.key] ?? LayoutDashboard;
          const active = n.key === menu;
          return (
            <button
              key={n.key}
              onClick={() => setMenu(n.key as MenuKey)}
              className={`flex w-full items-center gap-[11px] rounded-lg border-none px-3 py-[9px] text-left text-sm font-medium ${
                sidebarCollapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-primary text-primary-fg shadow-sm2"
                  : "text-[hsl(30_8%_26%)] hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="h-[17px] w-[17px] flex-none" />
              {!sidebarCollapsed && <span className="truncate">{n.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-3">
        <div
          className={`flex items-center gap-2.5 rounded-lg bg-sidebar-accent px-[11px] py-[9px] ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <span
            className="grid h-8 w-8 flex-none place-items-center rounded-[7px] text-xs font-semibold text-white"
            style={{ background: def.color }}
          >
            {def.initials}
          </span>
          {!sidebarCollapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold">{def.name}</div>
              <div className="truncate text-xs text-muted-fg">
                {role === "skpd" ? currentSkpd.nama : "Tahun 2026"}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
