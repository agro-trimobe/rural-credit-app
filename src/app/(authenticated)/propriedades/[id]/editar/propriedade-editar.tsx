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
import { Cliente, Propriedade } from '@/lib/crm-utils'
import { propriedadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function PropriedadeEditarConteudo({ propriedadeId }: { propriedadeId: string }) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState<Partial<Propriedade>>({
    nome: '',
    clienteId: '',
    endereco: '',
    area: 0,
    municipio: '',
    estado: '',
    coordenadas: {
      latitude: 0,
      longitude: 0
    }
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true)
        
        // Carregar propriedade
        const propriedade = await propriedadesApi.buscarPropriedadePorId(propriedadeId)
        if (!propriedade) {
          toast({
            title: 'Erro',
            description: 'Propriedade não encontrada',
            variant: 'destructive',
          })
          router.push('/propriedades')
          return
        }
        
        // Carregar lista de clientes para o select
        const listaClientes = await clientesApi.listarClientes()
        setClientes(listaClientes)
        
        // Preencher o formulário com os dados da propriedade
        setFormData({
          nome: propriedade.nome,
          clienteId: propriedade.clienteId,
          endereco: propriedade.endereco,
          area: propriedade.area,
          municipio: propriedade.municipio,
          estado: propriedade.estado,
          coordenadas: propriedade.coordenadas || {
            latitude: 0,
            longitude: 0
          }
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da propriedade.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarDados()
  }, [propriedadeId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'area') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      })
    } else if (name === 'latitude' || name === 'longitude') {
      setFormData({
        ...formData,
        coordenadas: {
          latitude: name === 'latitude' ? parseFloat(value) || 0 : formData.coordenadas?.latitude || 0,
          longitude: name === 'longitude' ? parseFloat(value) || 0 : formData.coordenadas?.longitude || 0
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.clienteId || !formData.endereco || !formData.municipio || !formData.estado) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    
    try {
      setEnviando(true)
      
      await propriedadesApi.atualizarPropriedade(propriedadeId, formData)
      
      toast({
        title: 'Propriedade atualizada',
        description: 'A propriedade foi atualizada com sucesso.',
      })
      
      router.push(`/propriedades/${propriedadeId}`)
    } catch (error) {
      console.error('Erro ao atualizar propriedade:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a propriedade.',
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/propriedades/${propriedadeId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Propriedade</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Propriedade</CardTitle>
            <CardDescription>
              Edite as informações da propriedade rural
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Propriedade *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome da propriedade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteId">Proprietário *</Label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value) => handleSelectChange('clienteId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o proprietário" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Endereço completo"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipio">Município *</Label>
                <Input
                  id="municipio"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  placeholder="Município"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="Estado"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área (hectares) *</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Área em hectares"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.coordenadas?.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.coordenadas?.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/propriedades/${propriedadeId}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
