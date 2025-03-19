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
import { Interacao, Cliente } from '@/lib/crm-utils'
import { interacoesApi, clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'
import { formatarData } from '@/lib/formatters'

function InteracaoEditarConteudo({ interacaoId }: { interacaoId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [interacao, setInteracao] = useState<Interacao | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  
  // Formulário
  const [tipo, setTipo] = useState<'Ligação' | 'Email' | 'Reunião' | 'Visita' | 'Outro'>('Ligação')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [status, setStatus] = useState<'Pendente' | 'Em andamento' | 'Concluída'>('Pendente')
  const [observacoes, setObservacoes] = useState('')
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar interação
        const interacao = await interacoesApi.buscarInteracaoPorId(interacaoId)
        if (!interacao) {
          toast({
            title: 'Erro',
            description: 'Interação não encontrada',
            variant: 'destructive',
          })
          router.push('/interacoes')
          return
        }
        
        setInteracao(interacao)
        
        // Preencher formulário
        setTipo(interacao.tipo as any)
        setAssunto(interacao.assunto)
        setDescricao(interacao.descricao)
        
        // Converter a data ISO para o formato brasileiro (DD/MM/AAAA)
        try {
          const dataObj = new Date(interacao.data);
          if (!isNaN(dataObj.getTime())) {
            const dia = dataObj.getDate().toString().padStart(2, '0');
            const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
            const ano = dataObj.getFullYear();
            setData(`${dia}/${mes}/${ano}`);
          } else {
            // Fallback para a data atual se a data da interação for inválida
            const hoje = new Date();
            const dia = hoje.getDate().toString().padStart(2, '0');
            const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
            const ano = hoje.getFullYear();
            setData(`${dia}/${mes}/${ano}`);
            console.error('Data inválida na interação:', interacao.data);
          }
        } catch (error) {
          // Fallback para a data atual em caso de erro
          const hoje = new Date();
          const dia = hoje.getDate().toString().padStart(2, '0');
          const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
          const ano = hoje.getFullYear();
          setData(`${dia}/${mes}/${ano}`);
          console.error('Erro ao converter data:', error);
        }
        
        setStatus(interacao.status as any)
        setObservacoes(interacao.observacoes || '')
        
        // Carregar cliente relacionado
        if (interacao.clienteId) {
          const cliente = await clientesApi.buscarClientePorId(interacao.clienteId)
          setCliente(cliente)
        }
        
        setCarregando(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da interação',
          variant: 'destructive',
        })
      }
    }

    carregarDados()
  }, [interacaoId, router])

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
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!interacao) return
    
    try {
      setSalvando(true)
      
      // Validação básica
      if (!assunto || !descricao || !data) {
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
      
      // Atualizar interação
      const dadosAtualizados: Partial<Interacao> = {
        tipo,
        assunto,
        descricao,
        data: dataISO,
        status,
        observacoes: observacoes || undefined,
        dataAtualizacao: dataISO // Usar a data informada pelo usuário em vez da data atual
      }
      
      // Log para debug
      console.log('Data original:', data);
      console.log('Data convertida para ISO:', dataISO);
      console.log('Dados atualizados:', dadosAtualizados);
      
      await interacoesApi.atualizarInteracao(interacaoId, dadosAtualizados)
      toast({
        title: 'Interação atualizada',
        description: 'Os dados da interação foram atualizados com sucesso',
      })
      
      router.push(`/interacoes/${interacaoId}`)
    } catch (error) {
      console.error('Erro ao atualizar interação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a interação',
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

  if (!interacao) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-medium">Interação não encontrada</h2>
        <Button asChild>
          <Link href="/interacoes">Voltar para interações</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/interacoes/${interacaoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Interação</h1>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações da Interação</CardTitle>
            <CardDescription>
              {cliente ? `Edite os detalhes da interação com ${cliente.nome}` : 'Edite os detalhes da interação'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Interação</Label>
                <Select value={tipo} onValueChange={(value) => setTipo(value as any)}>
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
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
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
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={observacoes}
                onChange={handleChange}
                placeholder="Observações adicionais (opcional)"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/interacoes/${interacaoId}`}>
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

export default InteracaoEditarConteudo
