"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { AppProvider } from "@/context/app-context"
import { queryClient } from "@/lib/query-client"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {children}
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  )
}
