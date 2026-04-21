import './globals.css'

export const metadata = {
  title: 'Sunday School',
  description: 'Attendance & Offering Tracking for Churches',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}