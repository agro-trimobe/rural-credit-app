import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth-options';
import { visitaRepository } from '@/lib/repositories';

export async function GET(request: NextRequest) {
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
    
    console.log(`[API] Listando visitas para o tenant: ${tenantId}`);
    
    // Buscar visitas no DynamoDB
    const visitas = await visitaRepository.listarVisitas(tenantId);
    
    return NextResponse.json({
      status: 'success',
      data: visitas
    });
  } catch (error: any) {
    console.error('Erro ao listar visitas:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao listar visitas',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const dadosVisita = await request.json();
    
    console.log(`[API] Criando visita para o tenant: ${tenantId}`);
    
    // Criar visita no DynamoDB
    const novaVisita = await visitaRepository.criarVisita(tenantId, dadosVisita);
    
    return NextResponse.json({
      status: 'success',
      data: novaVisita
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar visita:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar visita',
      error: error.message
    }, { status: 500 });
  }
}
