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
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { Projeto } from '@/lib/crm-utils'
import { projetosApi, clientesApi, propriedadesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default async function ProjetoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [propriedades, setPropriedades] = useState<{ id: string; nome: string }[]>([])
  const [formData, setFormData] = useState<Partial<Projeto>>({
    titulo: '',
    descricao: '',
    clienteId: '',
    propriedadeId: '',
    status: 'Em Elaboração',
    valorTotal: 0,
    linhaCredito: '',
    dataPrevisaoTermino: ''
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar projeto
        const projeto = await projetosApi.buscarProjetoPorId(id)
        if (!projeto) {
          toast({
            title: 'Erro',
            description: 'Projeto não encontrado',
            variant: 'destructive',
          })
          router.push('/crm/projetos')
          return
        }

        // Formatar a data de previsão para o formato de input date
        const dataPrevisao = projeto.dataPrevisaoTermino 
          ? new Date(projeto.dataPrevisaoTermino).toISOString().split('T')[0]
          : ''

        setFormData({
          ...projeto,
          dataPrevisaoTermino: dataPrevisao
        })

        // Carregar clientes e propriedades em paralelo
        const [dadosClientes, propriedadesDoCliente] = await Promise.all([
          clientesApi.listarClientes(),
          propriedadesApi.listarPropriedadesPorCliente(projeto.clienteId)
        ])

        setClientes(dadosClientes.map(c => ({ id: c.id, nome: c.nome })))
        setPropriedades(propriedadesDoCliente.map(p => ({ id: p.id, nome: p.nome })))
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados necessários',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Se o cliente mudar, atualizar lista de propriedades
    if (field === 'clienteId') {
      setFormData(prev => ({ ...prev, propriedadeId: '' }))
      carregarPropriedadesDoCliente(value)
    }
  }

  const carregarPropriedadesDoCliente = async (clienteId: string) => {
    try {
      const propriedadesDoCliente = await propriedadesApi.listarPropriedadesPorCliente(clienteId)
      setPropriedades(propriedadesDoCliente.map(p => ({ id: p.id, nome: p.nome })))
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error)
      setPropriedades([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      // Formatar a data de previsão para o formato ISO
      const dadosAtualizados = {
        ...formData,
        dataPrevisaoTermino: formData.dataPrevisaoTermino 
          ? new Date(formData.dataPrevisaoTermino as string).toISOString()
          : undefined
      }
      
      await projetosApi.atualizarProjeto(id, dadosAtualizados)
      toast({
        title: 'Projeto atualizado',
        description: 'Os dados do projeto foram atualizados com sucesso',
      })
      router.push(`/crm/projetos/${id}`)
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados do projeto',
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
            <Link href={`/crm/projetos/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Projeto</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
            <CardDescription>
              Edite as informações do projeto conforme necessário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
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
                <Label htmlFor="propriedadeId">Propriedade</Label>
                <Select
                  value={formData.propriedadeId}
                  onValueChange={(value) => handleSelectChange('propriedadeId', value)}
                  disabled={!formData.clienteId || propriedades.length === 0}
                >
                  <SelectTrigger id="propriedadeId">
                    <SelectValue placeholder={
                      !formData.clienteId 
                        ? "Selecione um cliente primeiro" 
                        : propriedades.length === 0 
                          ? "Nenhuma propriedade disponível" 
                          : "Selecione a propriedade"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {propriedades.map((propriedade) => (
                      <SelectItem key={propriedade.id} value={propriedade.id}>
                        {propriedade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                <Input
                  id="valorTotal"
                  name="valorTotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorTotal}
                  onChange={handleNumberChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linhaCredito">Linha de Crédito</Label>
                <Input
                  id="linhaCredito"
                  name="linhaCredito"
                  value={formData.linhaCredito}
                  onChange={handleChange}
                  required
                />
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
                    <SelectItem value="Em Elaboração">Em Elaboração</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Contratado">Contratado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPrevisaoTermino">Previsão de Término</Label>
                <Input
                  id="dataPrevisaoTermino"
                  name="dataPrevisaoTermino"
                  type="date"
                  value={formData.dataPrevisaoTermino as string}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/crm/projetos/${id}`}>
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
