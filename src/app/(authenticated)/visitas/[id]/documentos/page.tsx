import VisitaDocumentosConteudo from './visita-documentos'

export default async function VisitaDocumentosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <VisitaDocumentosConteudo visitaId={id} />
}
