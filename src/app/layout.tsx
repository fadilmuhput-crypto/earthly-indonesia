import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Earthly Indonesia",
    template: "%s | Earthly Indonesia",
  },
  description:
    "Platform aksi lingkungan untuk membantu masyarakat Indonesia mengadopsi kebiasaan ramah lingkungan. Bumi Hijau, Indonesia Maju.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
