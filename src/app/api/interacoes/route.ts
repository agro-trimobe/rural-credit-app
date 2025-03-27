import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { interacaoRepository } from '@/lib/repositories';

export async function GET() {
  try {
    // Obter a sessão do usuário
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }
    
    if (!session.user.tenantId) {
      return NextResponse.json({
        status: 'error',
        message: 'Tenant ID não encontrado na sessão'
      }, { status: 404 });
    }
    
    const tenantId = session.user.tenantId;
    console.log(`[API] Listando interações para o tenant: ${tenantId}`);
    
    // Buscar interações no DynamoDB
    const interacoes = await interacaoRepository.listarInteracoes(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: interacoes
    });
  } catch (error: any) {
    console.error('Erro ao listar interações:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar interações',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Obter a sessão do usuário
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        status: 'error',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }
    
    if (!session.user.tenantId) {
      return NextResponse.json({
        status: 'error',
        message: 'Tenant ID não encontrado na sessão'
      }, { status: 404 });
    }
    
    const tenantId = session.user.tenantId;
    
    // Obter dados do corpo da requisição
    const dadosInteracao = await request.json();
    
    console.log(`[API] Criando interação para o tenant: ${tenantId}`);
    
    // Criar interação no DynamoDB
    const interacao = await interacaoRepository.criarInteracao(tenantId, dadosInteracao);
    
    return NextResponse.json({
      status: 'success',
      data: interacao
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar interação:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar interação',
      error: error.message
    }, { status: 500 });
  }
}
