"use client";

import { useApp } from "@/context/AppContext";
import Login from "@/components/Login";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ViewRouter from "@/components/ViewRouter";
import ToastStack from "@/components/Toast";

export default function AppShell() {
  const { role } = useApp();

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
      <ToastStack />
    </>
  );
}
