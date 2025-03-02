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
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import { Cliente } from '@/lib/crm-utils'
import { formatarCpfCnpj } from '@/lib/formatters'
import { clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

// Componente cliente que implementa a lógica com hooks
function ClienteEditarConteudo({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    perfil: '' as 'pequeno' | 'medio' | 'grande',
  })

  useEffect(() => {
    const carregarCliente = async () => {
      try {
        setCarregando(true)
        const dadosCliente = await clientesApi.buscarClientePorId(clienteId)
        
        if (!dadosCliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setCliente(dadosCliente)
        setFormData({
          nome: dadosCliente.nome,
          cpfCnpj: dadosCliente.cpfCnpj,
          telefone: dadosCliente.telefone,
          email: dadosCliente.email,
          perfil: dadosCliente.perfil,
        })
      } catch (error) {
        console.error('Erro ao carregar cliente:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarCliente()
  }, [clienteId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cliente) return
    
    try {
      setSalvando(true)
      
      // Validação básica
      if (!formData.nome || !formData.cpfCnpj || !formData.telefone || !formData.email || !formData.perfil) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        })
        return
      }
      
      // Atualizar cliente
      const clienteAtualizado: Cliente = {
        ...cliente,
        nome: formData.nome,
        cpfCnpj: formData.cpfCnpj,
        telefone: formData.telefone,
        email: formData.email,
        perfil: formData.perfil,
      }
      
      await clientesApi.atualizarCliente(clienteId, clienteAtualizado)
      
      toast({
        title: 'Cliente atualizado',
        description: 'Os dados do cliente foram atualizados com sucesso',
      })
      
      router.push(`/clientes/${clienteId}`)
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados do cliente',
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/clientes/${clienteId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Editar Cliente</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>
              Atualize os dados cadastrais do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input
                  id="cpfCnpj"
                  name="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  placeholder="CPF ou CNPJ do cliente"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="Telefone de contato"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-mail de contato"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil do Cliente</Label>
              <Select
                value={formData.perfil}
                onValueChange={(value) => handleSelectChange('perfil', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil do cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequeno">Pequeno</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground">
              <p>Cliente cadastrado em: {cliente?.dataCadastro ? new Date(cliente.dataCadastro).toLocaleDateString('pt-BR') : 'N/A'}</p>
              <p>Última atualização: {cliente?.dataAtualizacao ? new Date(cliente.dataAtualizacao).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/clientes/${clienteId}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// Componente wrapper assíncrono que extrai o ID
export default async function ClienteEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClienteEditarConteudo clienteId={id} />
}
