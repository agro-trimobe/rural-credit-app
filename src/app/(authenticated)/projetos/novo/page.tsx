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
import { projetosApi, clientesApi, propriedadesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default function ProjetoNovoPage() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [propriedades, setPropriedades] = useState<{ id: string; nome: string }[]>([])
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    clienteId: '',
    propriedadeId: '',
    status: 'Em Elaboração' as 'Em Elaboração' | 'Em Análise' | 'Aprovado' | 'Contratado' | 'Cancelado',
    valorTotal: '',
    linhaCredito: '',
    dataPrevisaoTermino: ''
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosClientes = await clientesApi.listarClientes()
        setClientes(dadosClientes.map(c => ({ id: c.id, nome: c.nome })))
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de clientes',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
    
    // Atualiza o estado com o valor formatado
    setFormData(prev => ({ ...prev, valorTotal: valorFormatado }))
  }

  // Função para converter valor formatado (R$ 0,00) para número ao enviar
  const converterValorParaNumero = (valorFormatado: string) => {
    // Remove o símbolo da moeda e outros caracteres não numéricos, mantendo o ponto decimal
    const valorLimpo = valorFormatado.replace(/[^\d,]/g, '').replace(',', '.')
    
    // Converte para número
    return parseFloat(valorLimpo) || 0
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Se o cliente for alterado, resetar a propriedade selecionada
    if (name === 'clienteId') {
      setFormData(prev => ({ ...prev, propriedadeId: '' }))
      carregarPropriedades(value)
    }
  }

  // Função para carregar propriedades de um cliente
  const carregarPropriedades = async (clienteId: string) => {
    try {
      const propriedadesDoCliente = await propriedadesApi.listarPropriedadesPorCliente(clienteId)
      setPropriedades(propriedadesDoCliente.map(p => ({ id: p.id, nome: p.nome })))
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error)
      setPropriedades([])
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as propriedades do cliente.',
        variant: 'destructive',
      })
    }
  }

  // Função para aplicar máscara de data (DD/MM/AAAA)
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    
    // Remove todos os caracteres não numéricos
    const numeros = value.replace(/\D/g, '')
    
    // Aplica a máscara conforme o usuário digita
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
    
    setFormData(prev => ({ ...prev, dataPrevisaoTermino: dataFormatada }))
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
    
    // Validação básica
    if (!formData.titulo || !formData.clienteId || !formData.propriedadeId || !formData.dataPrevisaoTermino) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    
    setSalvando(true)
    
    try {
      // Converter a data para o formato ISO antes de enviar
      const dataISO = converterDataParaISO(formData.dataPrevisaoTermino)
      
      if (!dataISO) {
        toast({
          title: 'Erro',
          description: 'Data inválida. Por favor, use o formato DD/MM/AAAA.',
          variant: 'destructive',
        })
        setSalvando(false)
        return
      }
      
      // Converter o valor formatado para número
      const valorNumerico = converterValorParaNumero(formData.valorTotal)
      
      // Criar objeto com os dados do projeto
      const novoProjeto = {
        ...formData,
        dataPrevisaoTermino: dataISO,
        valorTotal: valorNumerico
      }
      
      await projetosApi.criarProjeto(novoProjeto)
      
      toast({
        title: 'Projeto criado',
        description: 'O projeto foi criado com sucesso.',
      })
      
      router.push('/projetos')
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o projeto.',
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
            <Link href="/projetos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Novo Projeto</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
            <CardDescription>
              Preencha os dados para criar um novo projeto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">
                  Título <span className="text-destructive">*</span>
                </Label>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteId">
                  Cliente <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="propriedadeId">
                  Propriedade <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="valorTotal">
                  Valor Total <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="valorTotal"
                  name="valorTotal"
                  placeholder="R$ 0,00"
                  value={formData.valorTotal}
                  onChange={handleValorChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linhaCredito">
                  Linha de Crédito <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="dataPrevisaoTermino">
                  Previsão de Término <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dataPrevisaoTermino"
                  name="dataPrevisaoTermino"
                  placeholder="DD/MM/AAAA"
                  value={formData.dataPrevisaoTermino}
                  onChange={handleDataChange}
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/projetos">
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
                  Criar Projeto
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
