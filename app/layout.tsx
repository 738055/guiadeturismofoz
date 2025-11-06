import './globals.css';
import { Inter, Merriweather } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});

// Metadados Padrão (Fallback)
export const metadata = {
  title: 'Araucária Turismo Receptivo',
  description: 'Descubra experiências únicas e monte seu roteiro personalizado em Foz do Iguaçu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}