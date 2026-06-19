import './globals.css'
import SplitBot from './components/SplitBot'

export const metadata = {
  title: 'SplitCerdas',
  description: 'Aplikasi split tagihan syariah',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <SplitBot />
      </body>
    </html>
  )
}