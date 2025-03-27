import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { interacaoRepository } from '@/lib/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ data: string }> }
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
    const { data } = await params;
    
    console.log(`[API] Listando interações da data ${data} para o tenant: ${tenantId}`);
    
    // Buscar interações no DynamoDB
    const interacoes = await interacaoRepository.listarInteracoesPorData(tenantId, data);
    
    return NextResponse.json({
      status: 'success',
      data: interacoes
    });
  } catch (error: any) {
    console.error(`Erro ao listar interações da data ${(await params).data}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar interações por data',
      error: error.message
    }, { status: 500 });
  }
}
