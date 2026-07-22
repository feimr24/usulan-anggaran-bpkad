import React from "react"

interface SectionHeadProps {
  title: string
  desc?: string
  actions?: React.ReactNode
}

export function SectionHead({ title, desc, actions }: SectionHeadProps) {
  return (
    <div className="mb-[22px] flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-[22px] font-medium tracking-tight">{title}</h2>
        {desc && <p className="mt-[5px] max-w-[46rem] text-sm text-muted-fg">{desc}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
