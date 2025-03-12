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

// Interface estendida para incluir campos adicionais que não existem no tipo Projeto
interface ProjetoExtendido extends Projeto {
  taxaJuros?: string;
  prazo?: string;
  carencia?: string;
}

function ProjetoEditarConteudo({ projetoId }: { projetoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [projeto, setProjeto] = useState<ProjetoExtendido | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  
  // Formulário
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [clienteId, setClienteId] = useState<string | undefined>(undefined)
  const [propriedadeId, setPropriedadeId] = useState<string | undefined>(undefined)
  const [linhaCredito, setLinhaCredito] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [status, setStatus] = useState<'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado'>('Em Análise')
  const [taxaJuros, setTaxaJuros] = useState('')
  const [prazo, setPrazo] = useState('')
  const [carencia, setCarencia] = useState('')
  const [dataPrevisaoTermino, setDataPrevisaoTermino] = useState('')
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar projeto
        const projetoCarregado = await projetosApi.buscarProjetoPorId(projetoId)
        if (!projetoCarregado) {
          toast({
            title: 'Erro',
            description: 'Projeto não encontrado',
            variant: 'destructive',
          })
          router.push('/projetos')
          return
        }
        
        // Tratar como ProjetoExtendido para adicionar campos adicionais
        const projetoExtendido: ProjetoExtendido = {
          ...projetoCarregado,
          taxaJuros: '0',
          prazo: '0',
          carencia: '0'
        }
        
        setProjeto(projetoExtendido)
        
        // Preencher formulário com dados do projeto
        setTitulo(projetoExtendido.titulo)
        setDescricao(projetoExtendido.descricao || '')
        
        // Garantir que os IDs nunca sejam strings vazias
        setClienteId(projetoExtendido.clienteId || undefined)
        setPropriedadeId(projetoExtendido.propriedadeId || undefined)
        setLinhaCredito(projetoExtendido.linhaCredito)
        
        // Formatar o valor como moeda brasileira
        const valorFormatado = projetoExtendido.valorTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        setValorTotal(valorFormatado)
        
        setStatus(projetoExtendido.status)
        
        // Definir valores padrão para campos adicionais
        setTaxaJuros(projetoExtendido.taxaJuros || '0')
        setPrazo(projetoExtendido.prazo || '0')
        setCarencia(projetoExtendido.carencia || '0')
        
        // Formatar a data de previsão de término se existir
        if (projetoExtendido.dataPrevisaoTermino) {
          const data = new Date(projetoExtendido.dataPrevisaoTermino)
          const dia = String(data.getDate()).padStart(2, '0')
          const mes = String(data.getMonth() + 1).padStart(2, '0')
          const ano = data.getFullYear()
          setDataPrevisaoTermino(`${dia}/${mes}/${ano}`)
        }
        
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
  
  // Função para aplicar máscara de valor monetário (R$)
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    
    // Remove todos os caracteres não numéricos
    const numeros = value.replace(/\D/g, '')
    
    // Converte para número e formata como moeda brasileira
    const valorNumerico = parseInt(numeros, 10) / 100
    
    // Formata o valor como string no formato R$ 0,00
    const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    
    // Atualiza o estado
    setValorTotal(valorFormatado)
  }
  
  // Função para converter valor formatado (R$ 0,00) para número ao enviar
  const converterValorParaNumero = (valorFormatado: string) => {
    // Remove o símbolo da moeda e outros caracteres não numéricos, mantendo o ponto decimal
    const valorLimpo = valorFormatado.replace(/[^\d,]/g, '').replace(',', '.')
    
    // Converte para número
    return parseFloat(valorLimpo) || 0
  }
  
  // Função para aplicar máscara de data (DD/MM/AAAA)
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    
    // Remove caracteres não numéricos
    const numeros = value.replace(/\D/g, '')
    
    let dataFormatada = ''
    
    if (numeros.length > 0) {
      // Adiciona o dia (até 2 dígitos)
      dataFormatada = numeros.substring(0, Math.min(2, numeros.length))
      
      // Adiciona o mês após o dia (se houver mais de 2 dígitos)
      if (numeros.length > 2) {
        dataFormatada += '/' + numeros.substring(2, Math.min(4, numeros.length))
      }
      
      // Adiciona o ano após o mês (se houver mais de 4 dígitos)
      if (numeros.length > 4) {
        dataFormatada += '/' + numeros.substring(4, Math.min(8, numeros.length))
      }
    }
    
    setDataPrevisaoTermino(dataFormatada)
  }
  
  // Função para converter data de DD/MM/AAAA para formato ISO (AAAA-MM-DD)
  const converterDataParaISO = (data: string) => {
    if (!data) return ''
    
    const partes = data.split('/')
    if (partes.length !== 3) return ''
    
    const dia = partes[0]
    const mes = partes[1]
    const ano = partes[2]
    
    // Verifica se a data é válida
    if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return ''
    
    return `${ano}-${mes}-${dia}`
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projeto) return
    
    // Validação básica
    if (!titulo || !linhaCredito || !valorTotal || !status || !taxaJuros || !prazo || !clienteId || !dataPrevisaoTermino) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }
    
    // Validar formato da data
    const dataISO = converterDataParaISO(dataPrevisaoTermino)
    if (!dataISO) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe uma data válida no formato DD/MM/AAAA',
        variant: 'destructive',
      })
      return
    }
    
    setSalvando(true)
    
    try {
      // Converter o valor formatado para número
      const valorNumerico = converterValorParaNumero(valorTotal)
      
      // Garantir que os IDs nunca sejam undefined
      const clienteIdFinal = clienteId || projeto.clienteId
      const propriedadeIdFinal = propriedadeId || projeto.propriedadeId
      
      // Criar objeto com os dados básicos do projeto (sem campos adicionais)
      const projetoAtualizado: Projeto = {
        id: projeto.id,
        titulo,
        descricao,
        clienteId: clienteIdFinal,
        propriedadeId: propriedadeIdFinal,
        linhaCredito,
        valorTotal: valorNumerico,
        status,
        documentos: projeto.documentos,
        dataCriacao: projeto.dataCriacao,
        dataAtualizacao: new Date().toISOString(),
        dataPrevisaoTermino: dataISO
      }
      
      await projetosApi.atualizarProjeto(projetoId, projetoAtualizado)
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
                <Label htmlFor="cliente">Cliente <span className="text-destructive">*</span></Label>
                <Select 
                  value={clienteId} 
                  onValueChange={setClienteId}
                  defaultValue={clientes.length > 0 ? clientes[0].id : undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
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
                <Label htmlFor="propriedade">Propriedade</Label>
                <Select 
                  value={propriedadeId} 
                  onValueChange={setPropriedadeId}
                  defaultValue={propriedades.length > 0 ? propriedades[0].id : undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma propriedade" />
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
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linhaCredito">Linha de Crédito <span className="text-destructive">*</span></Label>
                <Select 
                  value={linhaCredito || undefined} 
                  onValueChange={setLinhaCredito}
                  defaultValue="PRONAF"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a linha de crédito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRONAF">PRONAF</SelectItem>
                    <SelectItem value="PRONAMP">PRONAMP</SelectItem>
                    <SelectItem value="INOVAGRO">INOVAGRO</SelectItem>
                    <SelectItem value="ABC+">ABC+</SelectItem>
                    <SelectItem value="MODERFROTA">MODERFROTA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total <span className="text-destructive">*</span></Label>
                <Input
                  id="valorTotal"
                  name="valorTotal"
                  value={valorTotal}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value as any)}
                  defaultValue="Em Elaboração"
                >
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataPrevisaoTermino">
                  Previsão de Término <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dataPrevisaoTermino"
                  name="dataPrevisaoTermino"
                  placeholder="DD/MM/AAAA"
                  value={dataPrevisaoTermino}
                  onChange={handleDataChange}
                  maxLength={10}
                  required
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
