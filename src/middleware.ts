import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Páginas que não precisam de verificação de autenticação
const PUBLIC_PATHS = [
  '/api/auth',
  '/auth/login',
  '/auth/register',
  '/auth/confirm',
  '/auth/reset-password',
  '/_next',
  '/favicon.ico',
];

// Adiciona cabeçalhos para evitar cache
function addNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

// Middleware para verificar autenticação
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware executando para: ${pathname}`);

  // Verificar se a rota é pública
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    console.log('Rota pública detectada, permitindo acesso');
    return NextResponse.next();
  }

  // Verificar se é a página inicial
  if (pathname === '/') {
    console.log('Página inicial detectada, permitindo acesso');
    return NextResponse.next();
  }

  // Verificar token de autenticação
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('Token de autenticação:', token ? 'Presente' : 'Ausente');

  // Se não estiver autenticado, redirecionar para login
  if (!token) {
    console.log('Usuário não autenticado, redirecionando para login');
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    return addNoCacheHeaders(response);
  }

  // Se estiver autenticado, verificar se está acessando a página de login
  if (pathname.startsWith('/auth/login')) {
    console.log('Usuário autenticado tentando acessar login, redirecionando para dashboard');
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    return addNoCacheHeaders(response);
  }

  // Usuário autenticado acessando uma página protegida, permitir acesso
  console.log('Usuário autenticado acessando página protegida, permitindo acesso');
  return NextResponse.next();
}

// Atualizar o matcher para corresponder exatamente aos PUBLIC_PATHS
export const config = {
  matcher: [
    "/((?!api/auth|auth/login|auth/register|auth/confirm|auth/reset-password|_next|favicon.ico).*)",
  ],
};
