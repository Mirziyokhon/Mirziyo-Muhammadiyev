import type React from "react"
import type { Metadata } from "next"
import { Crimson_Pro, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LeftNav } from "@/components/right-nav"
import { MobileNav } from "@/components/mobile-nav"

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-heading",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "Mirziyo Muhammadiyev",
  description: "Personal website and essay bank",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${crimsonPro.variable} font-body antialiased`}>
        <div className="fixed top-0 left-0 right-0 h-3 bg-[#8B6F47] z-50" />

        <LeftNav />

        <MobileNav />

        <main className="min-h-screen pl-0 md:pl-32 pt-3">{children}</main>

        <footer className="border-t border-border py-8 pl-0 md:pl-32">
          <div className="max-w-3xl mx-auto px-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Mirziyo Muhammadiyev. All rights reserved.</p>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  )
}
