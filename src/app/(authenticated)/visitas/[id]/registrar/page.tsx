import VisitaRegistrarConteudo from './visita-registrar'

export default async function VisitaRegistrarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VisitaRegistrarConteudo visitaId={id} />
}
