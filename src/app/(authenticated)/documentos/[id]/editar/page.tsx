'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { Documento } from '@/lib/crm-utils'
import { documentosApi, clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function DocumentoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  
  // Formulário
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState<string>('Pendente')
  const [tags, setTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState('')
  
  useEffect(() => {
    const carregarDocumento = async () => {
      try {
        setCarregando(true)
        const dados = await documentosApi.buscarDocumentoPorId(id)
        
        if (!dados) {
          toast({
            title: 'Erro',
            description: 'Documento não encontrado',
            variant: 'destructive',
          })
          router.push('/crm/documentos')
          return
        }
        
        setDocumento(dados)
        
        // Preencher formulário com dados do documento
        setNome(dados.nome || '')
        setDescricao(dados.descricao || '')
        setStatus(dados.status || 'Pendente')
        setTags(dados.tags || [])
        
      } catch (error) {
        console.error('Erro ao carregar documento:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do documento',
          variant: 'destructive',
        })
        router.push('/crm/documentos')
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDocumento()
  }, [id, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!documento) return
    
    try {
      setSalvando(true)
      
      const documentoAtualizado = {
        ...documento,
        nome,
        descricao,
        status,
        tags,
      }
      
      await documentosApi.atualizarDocumento(id, documentoAtualizado)
      
      toast({
        title: 'Sucesso',
        description: 'Documento atualizado com sucesso',
      })
      
      router.push(`/crm/documentos/${id}`)
    } catch (error) {
      console.error('Erro ao salvar documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/crm/documentos/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Documento</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Documento</CardTitle>
            <CardDescription>
              Edite as informações do documento conforme necessário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  name="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="novaTag"
                    name="novaTag"
                    value={novaTag}
                    onChange={(e) => setNovaTag(e.target.value)}
                    placeholder="Adicionar nova tag"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (novaTag.trim()) {
                        setTags([...tags, novaTag.trim()]);
                        setNovaTag('');
                      }
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-muted rounded-md px-2 py-1">
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/crm/documentos/${id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
