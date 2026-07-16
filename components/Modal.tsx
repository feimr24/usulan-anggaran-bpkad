"use client";

import React, { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  width?: "base" | "wide" | "wider";
  children: React.ReactNode;
}

const WIDTHS: Record<string, string> = {
  base: "max-w-[460px]",
  wide: "max-w-[560px]",
  wider: "max-w-[680px]",
};

export default function Modal({ open, onClose, width = "base", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(30_10%_12%/0.5)] p-6 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${WIDTHS[width]} max-h-[90vh] overflow-y-auto rounded-[14px] bg-card shadow-lg2 animate-dialogin`}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="px-6 pb-1.5 pt-5">
      <h3 className="font-serif text-[22px] font-medium tracking-tight">{title}</h3>
      {desc && <p className="mt-[5px] text-sm text-muted-fg">{desc}</p>}
    </div>
  );
}

export function DialogBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pb-1 pt-3.5 [&>div>*+*]:mt-4">{children}</div>;
}

export function DialogFoot({
  children,
  between,
}: {
  children: React.ReactNode;
  between?: boolean;
}) {
  return (
    <div
      className={`flex gap-2.5 px-6 pb-[22px] pt-4 ${
        between ? "justify-between" : "justify-end"
      }`}
    >
      {children}
    </div>
  );
}
