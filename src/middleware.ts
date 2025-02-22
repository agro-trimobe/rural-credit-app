import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkSubscriptionAccess } from './lib/subscription-service';

// Páginas que não precisam de verificação de assinatura
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/webhooks',
  '/subscription',
  '/login',
  '/register',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  // Verificar se é uma página pública
  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar autenticação
  const token = await getToken({ req: request });
  console.log('Token do usuário:', token);

  if (!token?.tenantId || !token?.cognitoId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar status da assinatura
  const { hasAccess, message } = await checkSubscriptionAccess(token.tenantId, token.cognitoId);
  console.log('Resultado do checkSubscriptionAccess:', { hasAccess, message });

  if (!hasAccess) {
    // Redirecionar para página de assinatura com mensagem
    const subscriptionUrl = new URL('/subscription', request.url);
    subscriptionUrl.searchParams.set('message', message || '');
    return NextResponse.redirect(subscriptionUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/api/projects/:path*",
    "/api/documents/:path*"
  ],
};
