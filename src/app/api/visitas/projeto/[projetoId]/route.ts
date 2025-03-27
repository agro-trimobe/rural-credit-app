import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { visitaRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projetoId: string }> }
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
    const { projetoId } = await params;
    
    console.log(`[API] Listando visitas do projeto ${projetoId} para o tenant: ${tenantId}`);
    
    // Buscar visitas no DynamoDB
    const visitas = await visitaRepository.listarVisitasPorProjeto(tenantId, projetoId);
    
    return NextResponse.json({
      status: 'success',
      data: visitas
    });
  } catch (error: any) {
    console.error(`Erro ao listar visitas do projeto ${(await params).projetoId}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar visitas por projeto',
      error: error.message
    }, { status: 500 });
  }
}
