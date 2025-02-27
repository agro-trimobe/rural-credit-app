import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkSubscriptionAccess } from './lib/subscription-service';

// Páginas que não precisam de verificação de assinatura
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/subscription',
  '/subscription',
  '/auth/login',
  '/auth/register',
  '/auth/confirm',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  // Adicionar logs para depuração em produção
  console.log('Middleware executando para URL:', request.nextUrl.pathname);

  // Verificar se é uma página pública
  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    console.log('Rota pública detectada, permitindo acesso');
    return NextResponse.next();
  }

  // Verificar autenticação
  try {
    const token = await getToken({ 
      req: request,
    });
    console.log('Token do usuário:', token ? 'Presente' : 'Ausente');
    
    if (token) {
      console.log('Detalhes do token:', {
        id: token.id,
        email: token.email,
        tenantId: token.tenantId,
        cognitoId: token.cognitoId
      });
    }

    if (!token?.tenantId || !token?.cognitoId) {
      console.log('Token inválido ou ausente, redirecionando para login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

  // Verificar status da assinatura
  const { hasAccess, message } = await checkSubscriptionAccess(token.tenantId, token.cognitoId);
  console.log('Status da assinatura:', { hasAccess, message });

  if (!hasAccess) {
    console.log('Acesso negado, redirecionando para página de assinatura');
    return NextResponse.redirect(new URL('/subscription', request.url));
  }

  console.log('Acesso permitido para usuário autenticado');
  return NextResponse.next();
  } catch (error: unknown) {
    console.error('Erro no middleware:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    const errorDetails: Record<string, unknown> = {};
    
    if (error && typeof error === 'object') {
      if ('name' in error && error.name) {
        errorDetails.name = error.name;
      }
      
      if ('message' in error && error.message) {
        errorDetails.message = error.message;
      }
      
      if ('stack' in error && error.stack) {
        errorDetails.stack = error.stack;
      }
    }
    
    console.error('Detalhes do erro:', errorDetails);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api/auth|api/subscription|subscription|auth/login|auth/register|auth/confirm|_next|favicon.ico).*)",
  ],
};
