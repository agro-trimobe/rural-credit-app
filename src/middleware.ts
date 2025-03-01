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
  '/auth/reset-password',
  '/_next',
  '/favicon.ico',
  // Adicionar rota de criação de projetos como pública para evitar deslogamento
  '/projects/new',
];

// Função auxiliar para verificar se uma rota é pública
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

// Função auxiliar para adicionar headers de cache consistentes
function addNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Adicionar logs para depuração em produção
  console.log('Middleware executando para URL:', pathname);

  // Verificar se é uma página pública
  if (isPublicPath(pathname)) {
    console.log('Rota pública detectada, permitindo acesso');
    return NextResponse.next();
  }

  try {
    // Verificar autenticação
    const token = await getToken({ req: request });
    console.log('Token do usuário:', token ? 'Presente' : 'Ausente');
    
    if (token) {
      console.log('Detalhes do token:', {
        id: token.id,
        email: token.email,
        tenantId: token.tenantId,
        cognitoId: token.cognitoId
      });
    }

    // Se não tiver token válido, redirecionar para login
    if (!token?.tenantId || !token?.cognitoId) {
      console.log('Token inválido ou ausente, redirecionando para login');
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      return addNoCacheHeaders(response);
    }

    // Verificar status da assinatura
    console.log('Verificando status da assinatura para tenantId:', token.tenantId, 'cognitoId:', token.cognitoId);
    const { hasAccess, message } = await checkSubscriptionAccess(token.tenantId, token.cognitoId);
    console.log('Status da assinatura:', { hasAccess, message });

    if (!hasAccess) {
      console.log('Acesso negado, verificando tipo de requisição');
      
      // Para requisições de API, retornar 403 para que o interceptor do cliente redirecione
      if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
        console.log('Requisição de API detectada, retornando status 403');
        const response = new NextResponse(
          JSON.stringify({ 
            error: 'Acesso negado', 
            message: message || 'Sua assinatura expirou. Por favor, renove para continuar.' 
          }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return addNoCacheHeaders(response);
      }
      
      // Para páginas normais, redirecionar para a página de assinatura
      console.log('Página normal detectada, redirecionando para página de assinatura');
      const response = NextResponse.redirect(new URL('/subscription', request.url));
      return addNoCacheHeaders(response);
    }

    console.log('Acesso permitido para usuário autenticado');
    return NextResponse.next();
  } catch (error) {
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
    
    // Em caso de erro, redirecionar para login por segurança
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    return addNoCacheHeaders(response);
  }
}

// Atualizar o matcher para corresponder exatamente aos PUBLIC_PATHS
export const config = {
  matcher: [
    "/((?!api/auth|api/subscription|subscription|auth/login|auth/register|auth/confirm|auth/reset-password|_next|favicon.ico|projects/new).*)",
  ],
};
