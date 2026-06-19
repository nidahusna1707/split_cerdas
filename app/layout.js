import './globals.css'

export const metadata = {
  title: 'SplitCerdas',
  description: 'Aplikasi split tagihan syariah',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}