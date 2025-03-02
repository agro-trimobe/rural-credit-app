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
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import { Projeto, Cliente, Propriedade } from '@/lib/crm-utils'
import { projetosApi, clientesApi, propriedadesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

function ProjetoEditarConteudo({ projetoId }: { projetoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  
  // Formulário
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [propriedadeId, setPropriedadeId] = useState('')
  const [linhaCredito, setLinhaCredito] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [status, setStatus] = useState<'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado'>('Em Análise')
  const [taxaJuros, setTaxaJuros] = useState('')
  const [prazo, setPrazo] = useState('')
  const [carencia, setCarencia] = useState('')
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar projeto
        const projeto = await projetosApi.buscarProjetoPorId(projetoId)
        if (!projeto) {
          toast({
            title: 'Erro',
            description: 'Projeto não encontrado',
            variant: 'destructive',
          })
          router.push('/projetos')
          return
        }
        
        setProjeto(projeto)
        
        // Preencher formulário
        setTitulo(projeto.titulo)
        setDescricao(projeto.descricao || '')
        setClienteId(projeto.clienteId || '')
        setPropriedadeId(projeto.propriedadeId || '')
        setLinhaCredito(projeto.linhaCredito)
        setValorTotal(String(projeto.valorTotal))
        setStatus(projeto.status)
        setTaxaJuros('0')
        setPrazo('0')
        setCarencia('0')
        
        // Carregar clientes
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes)
        
        // Carregar propriedades
        const listaPropriedades = await propriedadesApi.listarPropriedades()
        setPropriedades(listaPropriedades)
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do projeto',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [projetoId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    switch (name) {
      case 'titulo':
        setTitulo(value)
        break
      case 'descricao':
        setDescricao(value)
        break
      case 'valorTotal':
        setValorTotal(value)
        break
      case 'taxaJuros':
        setTaxaJuros(value)
        break
      case 'prazo':
        setPrazo(value)
        break
      case 'carencia':
        setCarencia(value)
        break
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projeto) return
    
    try {
      setSalvando(true)
      
      // Validação básica
      if (!titulo || !linhaCredito || !valorTotal || !status || !taxaJuros || !prazo) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        })
        setSalvando(false)
        return
      }
      
      // Atualizar projeto
      const dadosAtualizados: Projeto = {
        ...projeto,
        titulo,
        descricao,
        clienteId: clienteId || projeto.clienteId,
        propriedadeId: propriedadeId || projeto.propriedadeId,
        linhaCredito,
        valorTotal: Number(valorTotal),
        status,
        documentos: projeto.documentos,
        dataCriacao: projeto.dataCriacao,
        dataAtualizacao: new Date().toISOString()
      }
      
      await projetosApi.atualizarProjeto(projetoId, dadosAtualizados)
      toast({
        title: 'Projeto atualizado',
        description: 'Os dados do projeto foram atualizados com sucesso',
      })
      
      router.push(`/projetos/${projetoId}`)
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o projeto',
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
            <Link href={`/projetos/${projetoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Projeto</h1>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
            <CardDescription>
              Edite os detalhes do projeto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                value={titulo}
                onChange={handleChange}
                placeholder="Título do projeto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={descricao}
                onChange={handleChange}
                placeholder="Descrição do projeto"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propriedade">Propriedade</Label>
                <Select value={propriedadeId} onValueChange={setPropriedadeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {propriedades.map((propriedade) => (
                      <SelectItem key={propriedade.id} value={propriedade.id}>
                        {propriedade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linhaCredito">Linha de Crédito</Label>
                <Select value={linhaCredito} onValueChange={setLinhaCredito}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a linha de crédito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pronaf">Pronaf</SelectItem>
                    <SelectItem value="Pronamp">Pronamp</SelectItem>
                    <SelectItem value="Inovagro">Inovagro</SelectItem>
                    <SelectItem value="Moderagro">Moderagro</SelectItem>
                    <SelectItem value="ABC+">ABC+</SelectItem>
                    <SelectItem value="FCO Rural">FCO Rural</SelectItem>
                    <SelectItem value="Funcafé">Funcafé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                <Input
                  id="valorTotal"
                  name="valorTotal"
                  value={valorTotal}
                  onChange={handleChange}
                  placeholder="Valor total do projeto"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                  <SelectTrigger>
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
                <Label htmlFor="taxaJuros">Taxa de Juros (% ao ano)</Label>
                <Input
                  id="taxaJuros"
                  name="taxaJuros"
                  value={taxaJuros}
                  onChange={handleChange}
                  placeholder="Taxa de juros"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prazo">Prazo (anos)</Label>
                <Input
                  id="prazo"
                  name="prazo"
                  value={prazo}
                  onChange={handleChange}
                  placeholder="Prazo em anos"
                  type="number"
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="carencia">Carência (meses)</Label>
                <Input
                  id="carencia"
                  name="carencia"
                  value={carencia}
                  onChange={handleChange}
                  placeholder="Carência em meses"
                  type="number"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/projetos/${projetoId}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ProjetoEditarConteudo
