import './globals.css';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${nunito.variable} h-screen overflow-hidden bg-bgmain`}>
      <body className="h-screen overflow-hidden font-sans bg-bgmain">{children}</body>
    </html>
  );
}
