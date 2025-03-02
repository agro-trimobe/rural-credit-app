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
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'
import { Documento } from '@/lib/crm-utils'
import { documentosApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function DocumentoTagsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  
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
          router.push('/documentos')
          return
        }
        
        setDocumento(dados)
        setTags(dados.tags || [])
        setNovaTag('')
      } catch (error) {
        console.error('Erro ao carregar documento:', error)
        toast({
          title: 'Erro',
          description: 'Falha ao carregar os dados do documento',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDocumento()
  }, [id, router])
  
  const adicionarTag = () => {
    if (!novaTag.trim()) return
    
    // Verificar se a tag já existe
    if (tags.includes(novaTag.trim())) {
      toast({
        title: 'Aviso',
        description: 'Esta tag já existe',
        variant: 'default',
      })
      return
    }
    
    setTags([...tags, novaTag.trim()])
    setNovaTag('')
  }
  
  const removerTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!documento) return
    
    try {
      setSalvando(true)
      
      await documentosApi.atualizarDocumento(id, {
        ...documento,
        tags,
      })
      
      toast({
        title: 'Sucesso',
        description: 'Tags atualizadas com sucesso',
      })
      
      router.push(`/documentos/${id}`)
    } catch (error) {
      console.error('Erro ao salvar tags:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao salvar as tags',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      adicionarTag()
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!documento) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Documento não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/documentos">Voltar para lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/documentos/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Gerenciar Tags</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{documento.nome}</CardTitle>
          <CardDescription>
            Adicione ou remova tags para categorizar este documento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Digite uma nova tag"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={adicionarTag} type="button">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Tags Atuais</h3>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1.5">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removerTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/documentos/${id}`}>
              Cancelar
            </Link>
          </Button>
          <Button onClick={handleSubmit} disabled={salvando}>
            {salvando ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Tags
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
