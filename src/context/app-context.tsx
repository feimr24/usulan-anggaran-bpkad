"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import { MenuKey, Role, ToastKind } from "@/types"
import { Jadwal, Skpd, TahunAnggaran, Usulan } from "@/types/models"
import { CURRENT_SKPD, INITIAL_JADWAL, INITIAL_SKPD, INITIAL_TAHUN, INITIAL_USULAN } from "@/lib/constants"

interface ToastItem {
  id: string
  msg: string
  kind: ToastKind
}

interface AppContextValue {
  role: Role | null
  menu: MenuKey
  sidebarCollapsed: boolean
  skpdList: Skpd[]
  usulanList: Usulan[]
  jadwalList: Jadwal[]
  tahunAnggaranList: TahunAnggaran[]
  currentSkpd: Skpd
  toasts: ToastItem[]

  login: (role: Role) => void
  logout: () => void
  setMenu: (menu: MenuKey) => void
  switchRole: (role: Role) => void
  toggleSidebar: () => void

  setSkpdList: React.Dispatch<React.SetStateAction<Skpd[]>>
  setUsulanList: React.Dispatch<React.SetStateAction<Usulan[]>>
  setJadwalList: React.Dispatch<React.SetStateAction<Jadwal[]>>
  setTahunAnggaranList: React.Dispatch<React.SetStateAction<TahunAnggaran[]>>

  toast: (msg: string, kind?: ToastKind) => void
  dismissToast: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [menu, setMenuState] = useState<MenuKey>("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [skpdList, setSkpdList] = useState<Skpd[]>(INITIAL_SKPD)
  const [usulanList, setUsulanList] = useState<Usulan[]>(INITIAL_USULAN)
  const [jadwalList, setJadwalList] = useState<Jadwal[]>(INITIAL_JADWAL)
  const [tahunAnggaranList, setTahunAnggaranList] = useState<TahunAnggaran[]>(INITIAL_TAHUN)

  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((msg: string, kind: ToastKind = "ok") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 2600)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const login = useCallback((r: Role) => {
    setRole(r)
    setMenuState("overview")
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    setMenuState("overview")
  }, [])

  const setMenu = useCallback((m: MenuKey) => setMenuState(m), [])

  const switchRole = useCallback((r: Role) => {
    setRole(r)
    setMenuState("overview")
  }, [])

  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), [])

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      menu,
      sidebarCollapsed,
      skpdList,
      usulanList,
      jadwalList,
      tahunAnggaranList,
      currentSkpd: CURRENT_SKPD,
      toasts,
      login,
      logout,
      setMenu,
      switchRole,
      toggleSidebar,
      setSkpdList,
      setUsulanList,
      setJadwalList,
      setTahunAnggaranList,
      toast,
      dismissToast,
    }),
    [
      role,
      menu,
      sidebarCollapsed,
      skpdList,
      usulanList,
      jadwalList,
      tahunAnggaranList,
      toasts,
      login,
      logout,
      setMenu,
      switchRole,
      toggleSidebar,
      toast,
      dismissToast,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
