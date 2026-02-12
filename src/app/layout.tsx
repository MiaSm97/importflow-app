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
    <html lang="it" className={`${nunito.variable} bg-bgmain`}>
      <body className="font-sans bg-bgmain min-h-screen">{children}</body>
    </html>
  );
}
