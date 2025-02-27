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
  // Adicionar rota de criação de projetos como pública para evitar deslogamento
  '/projects/new',
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
  try {
    console.log('Verificando status da assinatura para tenantId:', token.tenantId, 'cognitoId:', token.cognitoId);
    const { hasAccess, message } = await checkSubscriptionAccess(token.tenantId, token.cognitoId);
    console.log('Status da assinatura:', { hasAccess, message });

    if (!hasAccess) {
      console.log('Acesso negado, retornando status 403');
      
      // Para requisições de API, retornar 403 para que o interceptor do cliente redirecione
      if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth')) {
        const response = new NextResponse(
          JSON.stringify({ 
            error: 'Acesso negado', 
            message: message || 'Sua assinatura expirou. Por favor, renove para continuar.' 
          }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );
        return response;
      }
      
      // Para páginas normais, redirecionar para a página de assinatura
      const response = NextResponse.redirect(new URL('/subscription', request.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    console.log('Acesso permitido para usuário autenticado');
    return NextResponse.next();
  } catch (error: unknown) {
    console.error('Erro ao verificar status da assinatura:', error);
    
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
    "/((?!api/auth|api/subscription|subscription|auth/login|auth/register|auth/confirm|_next|favicon.ico|projects/new).*)",
  ],
};
