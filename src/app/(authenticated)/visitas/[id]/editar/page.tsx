import VisitaEditarConteudo from './visita-editar'

export default async function VisitaEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VisitaEditarConteudo visitaId={id} />
}
