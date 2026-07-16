"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ToastKind } from "@/lib/types";

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  ok: CheckCircle2,
  err: XCircle,
  info: Info,
};
const COLORS: Record<ToastKind, string> = {
  ok: "text-emerald-600",
  err: "text-danger",
  info: "text-blue-600",
};

export default function ToastStack() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5">
      {toasts.map((t) => {
        const kind: ToastKind = t.kind;
        const Icon = ICONS[kind];
        return (
          <div
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="flex min-w-[230px] max-w-[340px] cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-card px-[15px] py-3 text-sm shadow-lg2 animate-toastin"
          >
            <Icon className={`h-5 w-5 flex-none ${COLORS[t.kind]}`} />
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
