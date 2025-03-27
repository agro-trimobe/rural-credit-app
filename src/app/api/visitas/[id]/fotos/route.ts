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
    
    console.log(`[API] Buscando fotos da visita ${id} para o tenant: ${tenantId}`);
    
    // Buscar visita no DynamoDB
    const visita = await visitaRepository.buscarVisitaPorId(tenantId, id);
    
    if (!visita) {
      return NextResponse.json({
        status: 'error',
        message: 'Visita não encontrada'
      }, { status: 404 });
    }
    
    // Retornar as fotos da visita
    return NextResponse.json({
      status: 'success',
      data: visita.fotos || []
    });
  } catch (error: any) {
    console.error(`Erro ao buscar fotos da visita ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao buscar fotos da visita',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(
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
    const { fotos } = await request.json();
    
    if (!fotos || !Array.isArray(fotos)) {
      return NextResponse.json({
        status: 'error',
        message: 'Dados de fotos inválidos'
      }, { status: 400 });
    }
    
    console.log(`[API] Adicionando ${fotos.length} fotos à visita ${id} (tenant: ${tenantId})`);
    
    // Buscar visita atual
    const visita = await visitaRepository.buscarVisitaPorId(tenantId, id);
    
    if (!visita) {
      return NextResponse.json({
        status: 'error',
        message: 'Visita não encontrada'
      }, { status: 404 });
    }
    
    // Adicionar novas fotos
    const fotosAtuais = visita.fotos || [];
    const fotosAtualizadas = [...fotosAtuais, ...fotos];
    
    // Atualizar visita com as novas fotos
    const visitaAtualizada = await visitaRepository.atualizarVisita(tenantId, id, {
      ...visita,
      fotos: fotosAtualizadas
    });
    
    if (!visitaAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Não foi possível adicionar fotos à visita'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      data: visitaAtualizada.fotos
    });
  } catch (error: any) {
    console.error(`Erro ao adicionar fotos à visita ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao adicionar fotos à visita',
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
    
    // Obter índices das fotos a serem removidas
    const url = new URL(request.url);
    const indicesParam = url.searchParams.get('indices');
    
    if (!indicesParam) {
      return NextResponse.json({
        status: 'error',
        message: 'Parâmetro "indices" não fornecido'
      }, { status: 400 });
    }
    
    // Converter string de índices para array de números
    const indices = indicesParam.split(',').map(Number);
    
    if (indices.some(isNaN)) {
      return NextResponse.json({
        status: 'error',
        message: 'Índices inválidos fornecidos'
      }, { status: 400 });
    }
    
    console.log(`[API] Removendo fotos da visita ${id} nos índices: ${indices.join(', ')} (tenant: ${tenantId})`);
    
    // Buscar visita atual
    const visita = await visitaRepository.buscarVisitaPorId(tenantId, id);
    
    if (!visita) {
      return NextResponse.json({
        status: 'error',
        message: 'Visita não encontrada'
      }, { status: 404 });
    }
    
    // Verificar se a visita tem fotos
    if (!visita.fotos || visita.fotos.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'A visita não possui fotos para remover'
      }, { status: 400 });
    }
    
    // Verificar se os índices são válidos
    const indicesInvalidos = indices.filter(i => i < 0 || i >= visita.fotos.length);
    if (indicesInvalidos.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: `Índices inválidos: ${indicesInvalidos.join(', ')}`
      }, { status: 400 });
    }
    
    // Remover fotos pelos índices
    const fotosAtualizadas = visita.fotos.filter((_, i) => !indices.includes(i));
    
    // Atualizar visita com as fotos restantes
    const visitaAtualizada = await visitaRepository.atualizarVisita(tenantId, id, {
      ...visita,
      fotos: fotosAtualizadas
    });
    
    if (!visitaAtualizada) {
      return NextResponse.json({
        status: 'error',
        message: 'Não foi possível remover fotos da visita'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Fotos removidas com sucesso',
      data: visitaAtualizada.fotos
    });
  } catch (error: any) {
    console.error(`Erro ao remover fotos da visita ${(await params).id}:`, error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao remover fotos da visita',
      error: error.message
    }, { status: 500 });
  }
}
