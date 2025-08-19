import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from '@/components/layout/Navbar';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: config.app.name,
    template: `%s | ${config.app.name}`,
  },
  description: config.app.description,
  keywords: [
    "tatuajes",
    "tattoos",
    "daniela",
    "artist",
    "artista",
    "ink",
    "tattoo artist",
    "portafolio",
    "portfolio",
    "realista",
    "tradicional",
    "blackwork",
    "color",
    "geometrico",
    "minimalista",
  ],
  authors: [{ name: "Daniela Tattoos" }],
  creator: "Daniela Tattoos",
  publisher: "Daniela Tattoos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: config.app.name,
    title: config.app.name,
    description: config.app.description,
    url: config.app.url,
    images: [
      {
        url: `${config.app.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: config.app.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: config.app.name,
    description: config.app.description,
    images: [`${config.app.url}/og-image.jpg`],
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
  verification: {
    google: "tu-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Analytics */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased bg-white text-gray-900 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
        
        {/* Portal para modales */}
        <div id="modal-portal" />
        
        {/* Portal para toasts */}
        <div id="toast-portal" />
        
        {/* Scripts adicionales */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Detectar tema del sistema
                (function() {
                  try {
                    const theme = localStorage.getItem('theme');
                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
