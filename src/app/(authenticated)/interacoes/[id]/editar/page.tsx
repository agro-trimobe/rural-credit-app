import InteracaoEditarConteudo from './interacao-editar'

export default async function InteracaoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InteracaoEditarConteudo interacaoId={id} />
}