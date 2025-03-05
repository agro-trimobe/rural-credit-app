import VisitaFotosConteudo from './visita-fotos'

export default async function VisitaFotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VisitaFotosConteudo visitaId={id} />
}
