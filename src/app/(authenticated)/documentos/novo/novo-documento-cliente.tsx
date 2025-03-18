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

// Componente cliente que implementa toda a lógica com hooks
export default function NovoDocumentoCliente() {
  // Hooks do Next.js
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitaId = searchParams?.get('visitaId')
  const clienteIdParam = searchParams?.get('clienteId')

  // Estados do componente - TODOS os hooks devem ser declarados antes de qualquer condicional
  const [isMounted, setIsMounted] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [visitas, setVisitas] = useState<{ id: string; data: string; clienteId: string }[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formData, setFormData] = useState<Partial<Documento>>({
    nome: '',
    tipo: '',
    formato: 'pdf',
    clienteId: clienteIdParam || '',
    visitaId: visitaId || '',
    status: 'Pendente',
    tamanho: 0,
    url: '',
  })
  const [arquivo, setArquivo] = useState<File | null>(null)

  // Efeito para verificar montagem do componente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Efeito para carregar dados
  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined' || !isMounted) return;

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
  }, [isMounted, visitaId, clienteIdParam])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        url: URL.createObjectURL(file) // URL temporária para o arquivo
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

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
        visitaId: formData.visitaId === 'nenhuma' ? '' : formData.visitaId,
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

  // Renderização condicional após declarar todos os hooks
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

  if (carregando) {
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

  // Botão de voltar diferente dependendo da origem
  const botaoVoltar = visitaId ? (
    <Button variant="outline" size="icon" asChild>
      <Link href={`/visitas/${visitaId}/documentos`}>
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Button>
  ) : (
    <Button variant="outline" size="icon" asChild>
      <Link href="/documentos">
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Button>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {botaoVoltar}
          <h1 className="text-2xl font-bold tracking-tight">Novo Documento</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Documento</CardTitle>
            <CardDescription>
              Adicione um novo documento ao sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Documento</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome do documento"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Documento</Label>
                <Select
                  value={formData.tipo || ''}
                  onValueChange={(value) => handleSelectChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contrato">Contrato</SelectItem>
                    <SelectItem value="Relatório">Relatório</SelectItem>
                    <SelectItem value="Proposta">Proposta</SelectItem>
                    <SelectItem value="Análise">Análise</SelectItem>
                    <SelectItem value="Laudo">Laudo</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <Select
                  value={formData.clienteId || ''}
                  onValueChange={(value) => handleSelectChange('clienteId', value)}
                  disabled={!!clienteIdParam}
                >
                  <SelectTrigger>
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
                <Label htmlFor="visitaId">Visita</Label>
                <Select
                  value={formData.visitaId || ''}
                  onValueChange={(value) => handleSelectChange('visitaId', value)}
                  disabled={!!visitaId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a visita" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Nenhuma</SelectItem>
                    {visitas
                      .filter(v => !formData.clienteId || v.clienteId === formData.clienteId)
                      .map((visita) => (
                        <SelectItem key={visita.id} value={visita.id}>
                          Visita {visita.data}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="arquivo"
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                  required
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {arquivo && (
                <p className="text-sm text-muted-foreground">
                  {arquivo.name} ({Math.round(arquivo.size / 1024)} KB)
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {visitaId ? (
              <Button variant="outline" asChild>
                <Link href={`/visitas/${visitaId}/documentos`}>Cancelar</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/documentos">Cancelar</Link>
              </Button>
            )}
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 rounded-full border-background"></div>
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
