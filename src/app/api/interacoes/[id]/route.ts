import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { interacaoRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    
    console.log(`[API] Buscando interação ${id} para o tenant: ${tenantId}`);
    
    // Buscar interação no DynamoDB
    const interacao = await interacaoRepository.buscarInteracaoPorId(tenantId, id);
    
    if (!interacao) {
      return NextResponse.json({
        status: 'error',
        message: 'Interação não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: interacao
    });
  } catch (error: any) {
    console.error(`Erro ao buscar interação ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar interação',
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    
    // Obter dados do corpo da requisição
    const dadosInteracao = await request.json();
    
    console.log(`[API] Atualizando interação ${id} para o tenant: ${tenantId}`);
    
    // Atualizar interação no DynamoDB
    const interacaoAtualizada = await interacaoRepository.atualizarInteracao(tenantId, id, dadosInteracao);
    
    if (!interacaoAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Interação não encontrada ou não pôde ser atualizada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: interacaoAtualizada
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar interação ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar interação',
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    
    console.log(`[API] Excluindo interação ${id} para o tenant: ${tenantId}`);
    
    // Excluir interação no DynamoDB
    const resultado = await interacaoRepository.excluirInteracao(tenantId, id);
    
    if (!resultado) {
      return NextResponse.json({
        status: 'error',
        message: 'Interação não encontrada ou não pôde ser excluída'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Interação excluída com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir interação ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir interação',
      error: error.message
    }, { status: 500 });
  }
}
