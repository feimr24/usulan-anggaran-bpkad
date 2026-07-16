"use client";

import { useState } from "react";
import { Bell, ChevronDown, ChevronUp, Check, PanelLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ORDER, ROLES } from "@/lib/data";
import { Role } from "@/lib/types";

export default function Topbar() {
  const { role, menu, toggleSidebar, switchRole, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!role) return null;
  const def = ROLES[role];
  const pageLabel = def.nav.find((n) => n.key === menu)?.label ?? def.nav[0].label;

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center gap-3 border-b border-border bg-[hsl(40_33%_99%/0.85)] px-[22px] backdrop-blur-md">
      <button
        onClick={toggleSidebar}
        className="grid h-9 w-9 place-items-center rounded-lg border-transparent bg-transparent hover:bg-muted"
      >
        <PanelLeft className="h-[17px] w-[17px]" />
      </button>
      <div className="leading-tight">
        <div className="text-xs text-muted-fg">{def.name}</div>
        <div className="text-[15px] font-semibold">{pageLabel}</div>
      </div>
      <div className="relative ml-auto flex items-center gap-2">
        <button className="relative grid h-9 w-9 place-items-center rounded-lg border-transparent bg-transparent hover:bg-muted">
          <Bell className="h-[17px] w-[17px]" />
          <span className="absolute right-[9px] top-2 h-[7px] w-[7px] rounded-full bg-primary" />
        </button>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-sm font-medium"
          >
            <span
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[10px] font-semibold text-white"
              style={{ background: def.color }}
            >
              {def.initials}
            </span>
            <span>{def.name}</span>
            {menuOpen ? (
              <ChevronUp className="h-[15px] w-[15px] text-muted-fg" />
            ) : (
              <ChevronDown className="h-[15px] w-[15px] text-muted-fg" />
            )}
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-[55]"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-11 z-[60] min-w-[236px] rounded-[10px] border border-border bg-card p-1.5 shadow-lg2">
                <div className="px-2.5 pb-1 pt-1.5 text-xs text-muted-fg">
                  Ganti aktor (mode pengujian)
                </div>
                {ORDER.map((k) => {
                  const r = ROLES[k];
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        switchRole(k as Role);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[7px] border-none bg-transparent px-2.5 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span
                        className="grid h-6 w-6 place-items-center rounded-[6px] text-[10px] font-semibold text-white"
                        style={{ background: r.color }}
                      >
                        {r.initials}
                      </span>
                      <span className="flex-1">{r.name}</span>
                      {k === role && <Check className="h-[15px] w-[15px]" />}
                    </button>
                  );
                })}
                <div className="my-[5px] h-px bg-border" />
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full rounded-[7px] border-none bg-transparent px-2.5 py-2 text-left text-sm hover:bg-muted"
                >
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
