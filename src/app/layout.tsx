import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { SettingsProvider } from '@/lib/settings-context'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'

const GA_ID = process.env.GA_MEASUREMENT_ID

export const metadata: Metadata = {
  title: 'GitFit',
  description: 'Your fitness activity dashboard — GitHub style',
}

const antiFlashScript = `
try {
  var p = JSON.parse(localStorage.getItem('strava_prefs') || '{}');
  var t = p.theme || 'system';
  var s = p.colorScheme || 'orange';
  if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  document.documentElement.setAttribute('data-color-scheme', s);
} catch(e) {}
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#0d1117] antialiased">
        <SettingsProvider>
          <KeyboardShortcuts />
          {children}
        </SettingsProvider>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  )
}
