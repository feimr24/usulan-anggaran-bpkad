import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProviders } from "@/providers/app-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Sistem Usulan Anggaran · BPKAD Kota Palembang",
  description:
    "Pengajuan, verifikasi, dan persetujuan usulan anggaran daerah dalam satu alur yang transparan.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans text-[14px] antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
