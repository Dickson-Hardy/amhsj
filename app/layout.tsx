import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ModernErrorBoundary from "@/components/modern-error-boundary"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import ConditionalLayout from "@/components/conditional-layout"
import RegisterServiceWorker from "@/app/register-sw"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "AMHSJ - Advances in Medicine & Health Sciences Journal",
    template: "%s | AMHSJ",
  },
  description:
    "The official journal of Bayelsa Medical University, providing a medium for research findings from the Niger Delta region and beyond in Medicine and Health Sciences",
  keywords: [
    "medical research",
    "health sciences",
    "Niger Delta",
    "Bayelsa Medical University",
    "academic journal",
    "peer review",
    "clinical research",
    "public health",
    "biomedical sciences",
  ],
  authors: [{ name: "AMHSJ Editorial Team" }],
  creator: "AMHSJ",
  publisher: "Advances in Medicine & Health Sciences Journal",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
      { url: "/logo-amhsj.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AMHSJ",
    title: "AMHSJ - Advances in Medicine & Health Sciences Journal",
    description:
      "The official journal of Bayelsa Medical University - Open access medical research from the Niger Delta region",
    images: [
      {
        url: "/logo-amhsj.png",
        width: 512,
        height: 512,
        alt: "AMHSJ - Advances in Medicine & Health Sciences Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMHSJ - Advances in Medicine & Health Sciences Journal",
    description: "Open access medical research from Bayelsa Medical University",
    images: ["/logo-amhsj.png"],
    creator: "@amhsj_journal",
  },
  verification: {
    google: "your-google-verification-code",
  },
  manifest: "/manifest.json",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ModernErrorBoundary>
          <Providers>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster />
            <RegisterServiceWorker />
          </Providers>
        </ModernErrorBoundary>
      </body>
    </html>
  )
}
