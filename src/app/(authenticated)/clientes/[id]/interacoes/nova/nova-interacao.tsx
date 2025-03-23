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
import { MaskedInput } from '@/components/ui/masked-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { Cliente, Interacao } from '@/lib/crm-utils'
import { clientesApi, interacoesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

function NovaInteracaoConteudo({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  
  // Formulário
  const [tipo, setTipo] = useState<'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro'>('Ligação')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  
  // Inicializar a data no formato brasileiro (DD/MM/AAAA)
  const dataAtual = new Date()
  const dia = dataAtual.getDate().toString().padStart(2, '0')
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0')
  const ano = dataAtual.getFullYear()
  const [data, setData] = useState(`${dia}/${mes}/${ano}`)
  
  const [status, setStatus] = useState<'Pendente' | 'Em andamento' | 'Concluída'>('Pendente')
  const [observacoes, setObservacoes] = useState('')
  const [responsavel, setResponsavel] = useState('Usuário Atual')
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar cliente
        const cliente = await clientesApi.buscarClientePorId(clienteId)
        if (!cliente) {
          toast({
            title: 'Erro',
            description: 'Cliente não encontrado',
            variant: 'destructive',
          })
          router.push('/clientes')
          return
        }
        
        setCliente(cliente)
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do cliente',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [clienteId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    switch (name) {
      case 'assunto':
        setAssunto(value)
        break
      case 'descricao':
        setDescricao(value)
        break
      case 'data':
        setData(value)
        break
      case 'observacoes':
        setObservacoes(value)
        break
      case 'responsavel':
        setResponsavel(value)
        break
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cliente) return
    
    try {
      setSalvando(true)
      
      // Validação básica
      if (!assunto || !descricao || !data || !responsavel) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        })
        setSalvando(false)
        return
      }
      
      // Converter a data para ISO
      const dataISO = converterDataParaISO(data);
      
      // Log para debug
      console.log('Data original:', data);
      console.log('Data convertida para ISO:', dataISO);
      
      // Criar nova interação
      const novaInteracao: Omit<Interacao, 'id'> = {
        clienteId,
        tipo,
        assunto,
        descricao,
        data: dataISO,
        responsavel,
        status,
        observacoes: observacoes || undefined,
        dataCriacao: dataISO, // Usar a data informada pelo usuário
        dataAtualizacao: dataISO // Usar a data informada pelo usuário
      }
      
      console.log('Nova interação a ser criada:', novaInteracao);
      
      const interacaoCriada = await interacoesApi.criarInteracao(novaInteracao)
      toast({
        title: 'Interação registrada',
        description: 'A interação foi registrada com sucesso',
      })
      
      router.push(`/clientes/${clienteId}/interacoes`)
    } catch (error) {
      console.error('Erro ao salvar interação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a interação',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  // Função para converter data no formato DD/MM/AAAA para ISO
  function converterDataParaISO(data: string) {
    // Verificar se a data está no formato brasileiro (DD/MM/AAAA)
    if (!data || !data.includes('/')) {
      console.error('Formato de data inválido:', data);
      return new Date().toISOString(); // Retorna a data atual como fallback
    }

    try {
      const partes = data.split('/');
      if (partes.length !== 3) {
        console.error('Formato de data inválido:', data);
        return new Date().toISOString();
      }

      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Mês em JavaScript é 0-indexed
      const ano = parseInt(partes[2], 10);
      
      // Verificar se algum dos valores é NaN antes de fazer as comparações
      if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
        console.error('Componentes de data inválidos (NaN):', { dia, mes, ano });
        return new Date().toISOString();
      }
      
      // Validar se os componentes da data estão dentro dos limites válidos
      if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || ano < 1000) {
        console.error('Componentes de data fora dos limites válidos:', { dia, mes, ano });
        return new Date().toISOString();
      }
      
      // Criar uma data no fuso horário local
      const dataObj = new Date(ano, mes, dia);
      
      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) {
        console.error('Data inválida após conversão:', dataObj);
        return new Date().toISOString();
      }
      
      // Retornar no formato ISO
      return dataObj.toISOString();
    } catch (error) {
      console.error('Erro ao converter data para ISO:', error);
      return new Date().toISOString();
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-medium">Cliente não encontrado</h2>
        <Button asChild>
          <Link href="/clientes">Voltar para clientes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/clientes/${clienteId}/interacoes`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nova Interação - {cliente.nome}</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Registrar Interação</CardTitle>
            <CardDescription>
              Registre uma nova interação com o cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Interação</Label>
                <Select 
                  value={tipo} 
                  onValueChange={(value) => setTipo(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ligação">Ligação</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Reunião">Reunião</SelectItem>
                    <SelectItem value="Visita">Visita</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <MaskedInput 
                  id="data"
                  name="data"
                  mask="data"
                  value={data}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input 
                id="assunto"
                name="assunto"
                value={assunto}
                onChange={handleChange}
                placeholder="Assunto da interação"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao"
                name="descricao"
                value={descricao}
                onChange={handleChange}
                placeholder="Descreva os detalhes da interação"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input 
                  id="responsavel"
                  name="responsavel"
                  value={responsavel}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea 
                id="observacoes"
                name="observacoes"
                value={observacoes}
                onChange={handleChange}
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/clientes/${clienteId}/interacoes`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Interação'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default NovaInteracaoConteudo
