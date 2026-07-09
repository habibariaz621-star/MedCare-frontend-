'use client';

import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '@/store';
import AppInitializer from '@/components/providers/AppInitializer';
import ToastContainer from '@/components/common/ToastContainer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-mesh text-slate-900 dark:text-violet-50 antialiased`}>
        <Provider store={store}>
          <AppInitializer>
            {children}
            <ToastContainer />
          </AppInitializer>
        </Provider>
      </body>
    </html>
  );
}
