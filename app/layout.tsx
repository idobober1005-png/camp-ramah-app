import type { Metadata, Viewport } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
import { MockAuthProvider } from '@/components/layout/MockAuthProvider';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { BottomNav } from '@/components/layout/BottomNav';
import { EmergencyFAB } from '@/components/layout/EmergencyFAB';

// Rubik supports both Latin and Hebrew — ideal for a bilingual camp app
const rubik = Rubik({
  subsets: ['latin', 'hebrew'],
  variable: '--font-rubik',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'עוזר היצירתי — רמה',
  description: 'עוזר פעילויות חכם למדריכי קמפ רמה ניו אינגלנד',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'רמה',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#15803d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full`}>
      <body className="min-h-full bg-background font-rubik antialiased">
        <MockAuthProvider>
          <LanguageProvider>
            <main className="pb-24 min-h-screen">{children}</main>
            <BottomNav />
            <EmergencyFAB />
          </LanguageProvider>
        </MockAuthProvider>
      </body>
    </html>
  );
}
