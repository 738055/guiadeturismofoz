// app/layout.tsx
import './globals.css';
import { Inter, Merriweather } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { WhatsAppWidget } from '@/components/WhatsAppWidget'; // Importe o widget

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({
  weight: ['400', '700', '900'], // Adicionei peso 900 para títulos mais fortes
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});

export const metadata = {
  title: 'Guia de Turismo Foz do Iguaçu',
  description: 'As melhores experiências e passeios em Foz do Iguaçu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Adicionei 'scroll-smooth' para navegação mais fluida
    <html lang="pt-BR" className={`${inter.variable} ${merriweather.variable} scroll-smooth`}>
      <body className="font-sans bg-gray-50">
        <CartProvider>
          {children}
          <WhatsAppWidget /> {/* Widget fixo em todas as páginas */}
        </CartProvider>
      </body>
    </html>
  );
}