import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { visitaRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propriedadeId: string }> }
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
    const { propriedadeId } = await params;
    
    console.log(`[API] Listando visitas da propriedade ${propriedadeId} para o tenant: ${tenantId}`);
    
    // Buscar visitas no DynamoDB
    const visitas = await visitaRepository.listarVisitasPorPropriedade(tenantId, propriedadeId);
    
    return NextResponse.json({
      status: 'success',
      data: visitas
    });
  } catch (error: any) {
    console.error(`Erro ao listar visitas da propriedade ${(await params).propriedadeId}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar visitas por propriedade',
      error: error.message
    }, { status: 500 });
  }
}
