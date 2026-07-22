import React from "react"
import { Inbox } from "lucide-react"

export function EmptyState({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-[52px] text-center text-sm text-muted-fg">
        <Inbox className="mx-auto mb-2.5 h-5 w-5 text-[hsl(34_16%_76%)]" />
        {message}
      </td>
    </tr>
  )
}
