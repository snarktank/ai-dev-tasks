import './globals.css'

export const metadata = {
  title: 'AI Book Writer - Bulletproof Continuity System',
  description: 'Professional AI-powered book writing with perfect continuity',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
