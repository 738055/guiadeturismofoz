import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['pt-BR', 'en-US', 'es-ES'];
const defaultLocale = 'pt-BR';

function getLocale(request: NextRequest): string {
  console.log('--- getLocale ---');
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  console.log('Accept-Language Header:', request.headers.get('accept-language'));

  try {
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    console.log('Negotiated Languages:', languages);
    const matchedLocale = matchLocale(languages, locales, defaultLocale);
    console.log('Matched Locale:', matchedLocale);
    return matchedLocale;
  } catch (error) {
    console.error("Error in getLocale:", error);
    console.log('Falling back to defaultLocale:', defaultLocale);
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(`\n--- Middleware Start ---`);
  console.log('Request Pathname:', pathname);

  // Ignora rotas específicas
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.txt')
  ) {
    console.log('Pathname ignored, skipping middleware.');
    console.log('--- Middleware End ---');
    return NextResponse.next();
  }

  // Verifica se falta o locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  console.log('Is Pathname Missing Locale?', pathnameIsMissingLocale);

  // Redireciona se faltar
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const targetUrl = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
      request.url
    );
    console.log(`Redirecting to: ${targetUrl.toString()}`);
    console.log('--- Middleware End ---');
    return NextResponse.redirect(targetUrl);
  }

  // Se já tem locale, apenas continua
  console.log('Pathname has locale, continuing.');
  console.log('--- Middleware End ---');
  return NextResponse.next();
}

// Matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'
  ],
};

