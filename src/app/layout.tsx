import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { KidPathNavbar } from "@/components/kidpath/navbar"
import { KidPathFooter } from "@/components/kidpath/footer"
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
    default: "KidPath",
    template: "%s | KidPath",
  },
  description:
    "Discover the perfect activities for your child's growth and development. Personalized recommendations based on age, interests, and developmental goals.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <body className="flex min-h-screen flex-col font-sans antialiased">
          <KidPathNavbar />
          <main className="flex-1">{children}</main>
          <KidPathFooter />
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
