'use client'

import { useState } from 'react'
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
import { ArrowLeft, Save } from 'lucide-react'
import { Cliente } from '@/lib/crm-utils'
import { clientesApi } from '@/lib/mock-api'
import { toast } from '@/hooks/use-toast'

export default function NovoClientePage() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  
  // Formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [tipoCliente, setTipoCliente] = useState<'PF' | 'PJ'>('PF')
  const [perfil, setPerfil] = useState<'pequeno' | 'medio' | 'grande'>('pequeno')
  const [dataNascimento, setDataNascimento] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    switch (name) {
      case 'nome':
        setNome(value)
        break
      case 'email':
        setEmail(value)
        break
      case 'telefone':
        setTelefone(value)
        break
      case 'cpfCnpj':
        setCpfCnpj(value)
        break
      case 'endereco':
        setEndereco(value)
        break
      case 'cidade':
        setCidade(value)
        break
      case 'estado':
        setEstado(value)
        break
      case 'cep':
        setCep(value)
        break
      default:
        break
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    switch (name) {
      case 'tipoCliente':
        setTipoCliente(value as 'PF' | 'PJ')
        break
      case 'perfil':
        setPerfil(value as 'pequeno' | 'medio' | 'grande')
        break
      default:
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      const novoCliente: Omit<Cliente, 'id'> = {
        nome,
        email,
        telefone,
        cpfCnpj,
        tipo: tipoCliente,
        perfil,
        dataNascimento,
        endereco,
        cidade,
        estado,
        cep,
        dataCadastro: new Date().toISOString(),
      }
      
      await clientesApi.criarCliente(novoCliente)
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso',
      })
      router.push('/crm/clientes')
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o cliente',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/crm/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Novo Cliente</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>
              Preencha as informações para cadastrar um novo cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={telefone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input
                  id="cpfCnpj"
                  name="cpfCnpj"
                  value={cpfCnpj}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                <Select
                  value={tipoCliente}
                  onValueChange={(value) => handleSelectChange('tipoCliente', value)}
                >
                  <SelectTrigger id="tipoCliente">
                    <SelectValue placeholder="Selecione o tipo de cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil</Label>
                <Select
                  value={perfil}
                  onValueChange={(value) => handleSelectChange('perfil', value)}
                >
                  <SelectTrigger id="perfil">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pequeno">Pequeno</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={endereco}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={cidade}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={estado}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  value={cep}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/crm/clientes">
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
                  Cadastrar Cliente
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
