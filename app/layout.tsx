import './globals.css';
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ventureai.app'),
  title: 'VentureAI — Your AI Co-Founder from Idea to Launch',
  description:
    'Transform your idea into a launch-ready startup with conversational AI. Get market research, business plans, pitch decks, financials, and a full AI startup team.',
  keywords: [
    'startup incubator',
    'AI co-founder',
    'business plan generator',
    'pitch deck generator',
    'startup validation',
  ],
  openGraph: {
    title: 'VentureAI — Your AI Co-Founder from Idea to Launch',
    description:
      'Transform your idea into a launch-ready startup with conversational AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
