import VisitaDetalhesConteudo from './visita-detalhes'

export default async function VisitaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VisitaDetalhesConteudo visitaId={id} />
}
