import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Typeform Clone — Form Builder',
  description: 'Build beautiful forms, surveys, and quizzes with a Typeform-style experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '0.875rem',
              borderRadius: '10px',
              background: '#1f2937',
              color: '#f9fafb',
              boxShadow: '0 4px 20px rgb(0 0 0 / 0.2)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
