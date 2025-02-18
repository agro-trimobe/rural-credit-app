import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/tenant-utils";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    
    // Se não houver token, redireciona para login
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Verifica se a rota atual é a página de assinatura
    if (req.nextUrl.pathname === "/subscription") {
      return NextResponse.next();
    }

    try {
      // Busca dados do usuário
      const user = await getUserByEmail(token.email!);
      
      if (!user?.subscription) {
        // Se não tiver dados de assinatura, cria com período de teste
        return NextResponse.redirect(new URL("/subscription", req.url));
      }

      const now = new Date();
      const trialEndsAt = new Date(user.subscription.trialEndsAt);
      
      // Se estiver no período de teste, permite acesso
      if (user.subscription.status === 'TRIAL' && now < trialEndsAt) {
        return NextResponse.next();
      }
      
      // Se a assinatura estiver ativa, permite acesso
      if (user.subscription.status === 'ACTIVE') {
        return NextResponse.next();
      }
      
      // Caso contrário, redireciona para página de assinatura
      return NextResponse.redirect(new URL("/subscription", req.url));
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/api/projects/:path*",
    "/api/documents/:path*"
  ],
};
