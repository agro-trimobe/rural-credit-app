'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { Documento } from '@/lib/crm-utils'
import { documentosApi } from '@/lib/mock-api/documentos'
import { clientesApi } from '@/lib/mock-api/clientes'
import { visitasApi } from '@/lib/mock-api/visitas'
import { toast } from '@/hooks/use-toast'

// Componente principal
export default function NovoDocumentoPage() {
  // Verificação de ambiente cliente
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Se não estiver montado (ambiente servidor), renderiza um placeholder
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/documentos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Novo Documento</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Código do componente que usa APIs do navegador
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitaId = searchParams?.get('visitaId')
  const clienteIdParam = searchParams?.get('clienteId')
  
  const [salvando, setSalvando] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [visitas, setVisitas] = useState<{ id: string; data: string; clienteId: string }[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formData, setFormData] = useState<Partial<Documento>>({
    nome: '',
    tipo: '',
    formato: 'pdf',
    clienteId: '',
    visitaId: '',
    status: 'Pendente',
    tamanho: 0,
    url: '',
  })
  const [arquivo, setArquivo] = useState<File | null>(null)

  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') return;

    const carregarDados = async () => {
      try {
        const [clientesData, visitasData] = await Promise.all([
          clientesApi.listarClientes(),
          visitasApi.listarVisitas()
        ])
        
        setClientes(clientesData.map(c => ({ id: c.id, nome: c.nome })))
        setVisitas(visitasData.map(v => ({ 
          id: v.id, 
          data: new Date(v.data).toLocaleDateString('pt-BR'), 
          clienteId: v.clienteId 
        })))
        
        // Preencher dados iniciais se fornecidos via query params
        if (visitaId) {
          setFormData(prev => ({ ...prev, visitaId }))
        }
        
        if (clienteIdParam) {
          setFormData(prev => ({ ...prev, clienteId: clienteIdParam }))
        }
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [visitaId, clienteIdParam])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setArquivo(file)
      
      // Extrair formato do arquivo
      const extensao = file.name.split('.').pop()?.toLowerCase() || ''
      
      setFormData((prev) => ({
        ...prev,
        nome: file.name.split('.')[0], // Nome sem extensão
        formato: extensao,
        tamanho: file.size,
        url: typeof window !== 'undefined' ? URL.createObjectURL(file) : '' // URL temporária para o arquivo
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      setSalvando(false)
      return;
    }

    if (!arquivo) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo para upload.',
        variant: 'destructive',
      })
      setSalvando(false)
      return
    }

    try {
      const novoDocumento: Omit<Documento, 'id' | 'dataCriacao' | 'dataAtualizacao'> = {
        nome: formData.nome || '',
        tipo: formData.tipo || '',
        formato: formData.formato || 'pdf',
        tamanho: Number(formData.tamanho) || 0,
        url: formData.url || '',
        clienteId: formData.clienteId || '',
        projetoId: formData.projetoId,
        visitaId: formData.visitaId,
        status: formData.status || 'Pendente',
        tags: []
      }
      
      await documentosApi.criarDocumento(novoDocumento)
      toast({
        title: 'Documento adicionado',
        description: 'O documento foi adicionado com sucesso.',
      })
      
      // Redirecionar com base na origem
      if (visitaId) {
        router.push(`/visitas/${visitaId}/documentos`)
      } else {
        router.push('/documentos')
      }
    } catch (error) {
      console.error('Erro ao adicionar documento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o documento.',
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
            <Link href="/documentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Novo Documento</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Upload de Documento</CardTitle>
            <CardDescription>
              Faça upload de um novo documento e preencha as informações necessárias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                id="arquivo"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label 
                htmlFor="arquivo" 
                className="flex flex-col items-center justify-center cursor-pointer h-32"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">
                  {arquivo ? arquivo.name : 'Clique para selecionar um arquivo'}
                </span>
                {arquivo && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  placeholder="Ex: Contrato, Nota Fiscal, Laudo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value) => handleSelectChange('clienteId', value)}
                >
                  <SelectTrigger id="clienteId">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitaId">Visita (opcional)</Label>
                <Select
                  value={formData.visitaId || ""}
                  onValueChange={(value) => handleSelectChange('visitaId', value)}
                >
                  <SelectTrigger id="visitaId">
                    <SelectValue placeholder="Associar a uma visita" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {visitas
                      .filter(v => !formData.clienteId || v.clienteId === formData.clienteId)
                      .map((visita) => (
                        <SelectItem key={visita.id} value={visita.id}>
                          Visita em {visita.data}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
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
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href={visitaId ? `/visitas/${visitaId}/documentos` : "/documentos"}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando || !arquivo}>
              {salvando ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Documento
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
