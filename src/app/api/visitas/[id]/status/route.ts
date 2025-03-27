import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { visitaRepository } from '@/lib/repositories';

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
    const { status } = await request.json();
    
    if (!status || !['Agendada', 'Realizada', 'Cancelada'].includes(status)) {
      return NextResponse.json({
        status: 'error',
        message: 'Status inválido. Deve ser um dos seguintes: Agendada, Realizada, Cancelada'
      }, { status: 400 });
    }
    
    console.log(`[API] Atualizando status da visita ${id} para ${status} (tenant: ${tenantId})`);
    
    // Atualizar o status da visita
    const visitaAtualizada = await visitaRepository.atualizarVisita(tenantId, id, { status });
    
    if (!visitaAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Visita não encontrada ou não pôde ser atualizada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: visitaAtualizada
    });
  } catch (error: any) {
    console.error(`Erro ao atualizar status da visita ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao atualizar status da visita',
      error: error.message
    }, { status: 500 });
  }
}
