import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ModernErrorBoundary from "@/components/modern-error-boundary"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import ConditionalLayout from "@/components/conditional-layout"

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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AMHSJ - Medical Research Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMHSJ - Advances in Medicine & Health Sciences Journal",
    description: "Open access medical research from Bayelsa Medical University",
    images: ["/og-image.jpg"],
    creator: "@amhsj_journal",
  },
  verification: {
    google: "your-google-verification-code",
  },
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
          </Providers>
        </ModernErrorBoundary>
      </body>
    </html>
  )
}
