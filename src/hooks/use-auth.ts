"use client"

import { useApp } from "@/context/app-context"
import { Role } from "@/types"

export function useAuth() {
  const { role, login, logout, switchRole } = useApp()

  return {
    role,
    isAuthenticated: !!role,
    login: (role: Role) => login(role),
    logout,
    switchRole: (role: Role) => switchRole(role),
  }
}
