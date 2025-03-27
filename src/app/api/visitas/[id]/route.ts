import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { visitaRepository } from '@/lib/repositories';

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
    
    console.log(`[API] Buscando visita ${id} para o tenant: ${tenantId}`);
    
    // Buscar visita no DynamoDB
    const visita = await visitaRepository.buscarVisitaPorId(tenantId, id);
    
    if (!visita) {
      return NextResponse.json({
        status: 'error',
        message: 'Visita não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: visita
    });
  } catch (error: any) {
    console.error(`Erro ao buscar visita ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar visita',
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
    const dadosAtualizacao = await request.json();
    
    console.log(`[API] Atualizando visita ${id} para o tenant: ${tenantId}`);
    
    // Verificar se a visita existe
    const visitaExistente = await visitaRepository.buscarVisitaPorId(tenantId, id);
    
    if (!visitaExistente) {
      return NextResponse.json({
        status: 'error',
        message: 'Visita não encontrada'
      }, { status: 404 });
    }
    
    // Atualizar visita no DynamoDB
    const visitaAtualizada = await visitaRepository.atualizarVisita(tenantId, id, {
      ...visitaExistente,
      ...dadosAtualizacao,
      id: id // Garantir que o ID não seja alterado
    });
    
    if (!visitaAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Não foi possível atualizar a visita'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: visitaAtualizada
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar visita ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar visita',
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
    
    console.log(`[API] Excluindo visita ${id} para o tenant: ${tenantId}`);
    
    // Verificar se a visita existe
    const visitaExistente = await visitaRepository.buscarVisitaPorId(tenantId, id);
    
    if (!visitaExistente) {
      return NextResponse.json({
        status: 'error',
        message: 'Visita não encontrada'
      }, { status: 404 });
    }
    
    // Excluir visita do DynamoDB
    const sucesso = await visitaRepository.excluirVisita(tenantId, id);
    
    if (!sucesso) {
      return NextResponse.json({
        status: 'error',
        message: 'Não foi possível excluir a visita'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Visita excluída com sucesso'
    });
  } catch (error: any) {
    console.error(`Erro ao excluir visita ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao excluir visita',
      error: error.message
    }, { status: 500 });
  }
}
