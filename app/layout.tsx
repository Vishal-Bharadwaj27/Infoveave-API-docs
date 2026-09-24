import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter, Geist_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.className} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
