import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['pt-BR', 'en-US', 'es-ES'];
const defaultLocale = 'pt-BR';

function getLocale(request: NextRequest): string {
  // Coleta os headers para negociação de conteúdo
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  try {
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    return matchLocale(languages, locales, defaultLocale);
  } catch (error) {
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. BLOCAGEM DE SEGURANÇA E API
  // Se for rota de API, Admin ou arquivos estáticos, deixa passar direto (sem redirecionar idioma)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/assets') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  // 2. VERIFICAÇÃO DE IDIOMA
  // Verifica se o pathname já tem o locale (ex: /pt-BR/...)
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // 3. REDIRECIONAMENTO
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    
    // Reconstrói a URL mantendo query params se existirem
    const targetUrl = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${request.nextUrl.search}`,
      request.url
    );
    
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  // O matcher impede que o middleware rode nessas rotas, economizando processamento
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'
  ],
};