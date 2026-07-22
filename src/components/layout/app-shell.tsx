"use client"

import { useApp } from "@/context/app-context"
import Login from "@/components/common/login-form"
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import ViewRouter from "@/components/layout/view-router"
import { Toaster } from "@/components/ui/sonner"

export default function AppShell() {
  const { role } = useApp()

  return (
    <>
      {!role ? (
        <Login />
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <div className="flex-1 px-[22px] py-[26px]">
              <div className="mx-auto max-w-[1120px] animate-fade">
                <ViewRouter />
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </>
  )
}
