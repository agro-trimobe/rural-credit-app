import InteracaoDetalhesConteudo from './interacao-detalhes'

export default async function InteracaoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InteracaoDetalhesConteudo interacaoId={id} />
}