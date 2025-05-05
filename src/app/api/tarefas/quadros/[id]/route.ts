import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { quadroRepository } from '@/lib/repositories/quadro-repository';
import { getUserSession } from '@/lib/user-session';

interface RequestContext {
  params: {
    id: string;
  };
}

// GET - Obter um quadro específico
export async function GET(req: NextRequest, context: RequestContext) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter informações do usuário
    const { tenantId } = await getUserSession();
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Informações do usuário não encontradas' },
        { status: 401 }
      );
    }

    const { id } = context.params;
    
    // Buscar quadro pelo ID
    const quadro = await quadroRepository.buscarQuadroPorId(tenantId, id);
    
    if (!quadro) {
      return NextResponse.json(
        { error: 'Quadro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quadro });
  } catch (error) {
    console.error(`Erro ao buscar quadro ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um quadro existente
export async function PUT(req: NextRequest, context: RequestContext) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter informações do usuário
    const { tenantId } = await getUserSession();
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Informações do usuário não encontradas' },
        { status: 401 }
      );
    }

    const { id } = context.params;
    
    // Verificar se o quadro existe
    const quadroExistente = await quadroRepository.buscarQuadroPorId(tenantId, id);
    if (!quadroExistente) {
      return NextResponse.json(
        { error: 'Quadro não encontrado' },
        { status: 404 }
      );
    }

    // Obter dados do corpo da requisição
    const quadroData = await req.json();

    // Validar dados
    if (!quadroData.titulo) {
      return NextResponse.json(
        { error: 'O título do quadro é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar quadro
    const quadroAtualizado = await quadroRepository.atualizarQuadro(tenantId, id, {
      titulo: quadroData.titulo,
      descricao: quadroData.descricao,
      cor: quadroData.cor,
    });

    return NextResponse.json({ quadro: quadroAtualizado });
  } catch (error) {
    console.error(`Erro ao atualizar quadro ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um quadro
export async function DELETE(req: NextRequest, context: RequestContext) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter informações do usuário
    const { tenantId } = await getUserSession();
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Informações do usuário não encontradas' },
        { status: 401 }
      );
    }

    const { id } = context.params;
    
    // Verificar se o quadro existe
    const quadroExistente = await quadroRepository.buscarQuadroPorId(tenantId, id);
    if (!quadroExistente) {
      return NextResponse.json(
        { error: 'Quadro não encontrado' },
        { status: 404 }
      );
    }

    // Excluir quadro
    await quadroRepository.excluirQuadro(tenantId, id);

    return NextResponse.json(
      { mensagem: 'Quadro excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Erro ao excluir quadro ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
