"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { STATUS } from "@/lib/data";
import { StatusKey } from "@/lib/types";

type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "danger"
  | "ok"
  | "link-danger";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-[hsl(8_58%_40%)]",
  outline: "bg-card text-fg border-input hover:bg-muted",
  ghost: "bg-transparent border-transparent hover:bg-muted",
  danger: "bg-danger text-white hover:bg-[hsl(8_62%_42%)]",
  ok: "bg-success text-white hover:bg-[hsl(150_50%_26%)]",
  "link-danger": "bg-transparent border-transparent text-danger font-bold hover:bg-[hsl(8_70%_96%)]",
};

export function Button({
  variant = "outline",
  size = "base",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "base" | "sm" | "icon";
}) {
  const sizeClass =
    size === "sm"
      ? "h-[34px] px-[11px] text-sm rounded-[7px]"
      : size === "icon"
      ? "h-9 w-9 p-0 rounded-lg"
      : "h-[42px] px-4 rounded-lg";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap border font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ status }: { status: StatusKey }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-[9px] py-[3px] text-xs font-semibold leading-tight ${s.className}`}
    >
      {s.label}
    </span>
  );
}

export function SectionHead({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-[22px] flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-[22px] font-medium tracking-tight">{title}</h2>
        {desc && <p className="mt-[5px] max-w-[46rem] text-sm text-muted-fg">{desc}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl2 border border-border bg-card shadow-sm2 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-[52px] text-center text-sm text-muted-fg">
        <Inbox className="mx-auto mb-2.5 h-5 w-5 text-[hsl(34_16%_76%)]" />
        {message}
      </td>
    </tr>
  );
}
