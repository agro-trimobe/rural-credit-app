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

// Logs detalhados para ambiente de produção
function logDetalhe(mensagem: string, dados?: any) {
  console.log(`[MIDDLEWARE] ${mensagem}`);
  if (dados) {
    try {
      console.log(JSON.stringify(dados, null, 2));
    } catch (error) {
      console.log('Não foi possível serializar os dados:', error);
    }
  }
}

// Extrai informações relevantes dos cookies para debug
function logCookies(request: NextRequest) {
  try {
    // Usar Record<string, string> para definir o tipo do objeto cookies
    const cookies: Record<string, string> = {};
    request.cookies.getAll().forEach(cookie => {
      cookies[cookie.name] = cookie.value ? 'Presente' : 'Ausente';
    });
    
    logDetalhe('Cookies da requisição', cookies);
    
    // Log específico para cookies de autenticação
    const sessionToken = request.cookies.get('next-auth.session-token');
    const callbackUrl = request.cookies.get('next-auth.callback-url');
    
    logDetalhe('Cookie de sessão', {
      nome: 'next-auth.session-token',
      presente: !!sessionToken,
      valor: sessionToken ? 'Valor presente (não exibido por segurança)' : 'Ausente',
      // RequestCookie não tem a propriedade expires, então removemos essa informação
      expiracao: 'Informação não disponível no objeto RequestCookie'
    });
    
    logDetalhe('Cookie de callback', {
      nome: 'next-auth.callback-url',
      presente: !!callbackUrl,
      valor: callbackUrl?.value,
      // RequestCookie não tem a propriedade expires, então removemos essa informação
      expiracao: 'Informação não disponível no objeto RequestCookie'
    });
  } catch (error) {
    logDetalhe('Erro ao processar cookies', { erro: String(error) });
  }
}

// Middleware para verificar autenticação
export async function middleware(request: NextRequest) {
  try {
    const { pathname, search, origin, href } = request.nextUrl;
    logDetalhe('Middleware iniciando', {
      pathname,
      search,
      url_completa: href,
      metodo: request.method,
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
      ambiente: process.env.NODE_ENV
    });
    
    // Log de cookies para debug
    logCookies(request);

    // Verificar se a rota é pública
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      logDetalhe('Rota pública detectada, permitindo acesso', { pathname });
      return NextResponse.next();
    }

    // Verificar se é a página inicial
    if (pathname === '/') {
      logDetalhe('Página inicial detectada, permitindo acesso');
      return NextResponse.next();
    }

    // Verificar token de autenticação
    const tokenConfig = {
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    };
    
    logDetalhe('Tentando obter token de autenticação', {
      secretDefinido: !!process.env.NEXTAUTH_SECRET,
      cookiesPresentesNaRequisicao: request.cookies.size > 0
    });
    
    let token;
    try {
      token = await getToken(tokenConfig);
      logDetalhe('Resultado da verificação do token', {
        tokenObtido: !!token,
        tokenTipo: token ? typeof token : 'undefined',
        tokenConteudo: token ? {
          nome: token.name,
          email: token.email,
          imagem: token.picture,
          expiracao: token.exp,
          tempoAtual: Math.floor(Date.now() / 1000)
        } : null
      });
    } catch (error) {
      logDetalhe('Erro ao obter token', { 
        erro: String(error),
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : null
      });
    }

    // Se não estiver autenticado, redirecionar para login
    if (!token) {
      logDetalhe('Usuário não autenticado, redirecionando para login', {
        de: pathname,
        para: '/auth/login'
      });
      const urlLogin = new URL('/auth/login', request.url);
      logDetalhe('URL de redirecionamento para login', { url: urlLogin.toString() });
      const response = NextResponse.redirect(urlLogin);
      return addNoCacheHeaders(response);
    }

    // Se estiver autenticado, verificar se está acessando a página de login
    if (pathname.startsWith('/auth/login')) {
      logDetalhe('Usuário autenticado tentando acessar login, redirecionando para dashboard', {
        de: pathname,
        para: '/dashboard'
      });
      const urlDashboard = new URL('/dashboard', request.url);
      logDetalhe('URL de redirecionamento para dashboard', { url: urlDashboard.toString() });
      const response = NextResponse.redirect(urlDashboard);
      return addNoCacheHeaders(response);
    }

    // Usuário autenticado acessando uma página protegida, permitir acesso
    logDetalhe('Usuário autenticado acessando página protegida, permitindo acesso', {
      pathname,
      email: token.email
    });
    return NextResponse.next();
  } catch (error) {
    // Log detalhado do erro para facilitar o debug
    console.error('[MIDDLEWARE] Erro não tratado no middleware:', error);
    console.error('[MIDDLEWARE] Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
    
    // Em caso de erro, permitir o acesso para evitar bloqueio total da aplicação
    // Em produção, pode ser melhor redirecionar para uma página de erro
    return NextResponse.next();
  }
}

// Atualizar o matcher para corresponder exatamente aos PUBLIC_PATHS
export const config = {
  matcher: [
    "/((?!api/auth|auth/login|auth/register|auth/confirm|auth/reset-password|_next|favicon.ico).*)",
  ],
};
