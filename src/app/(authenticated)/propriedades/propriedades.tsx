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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Search,
  Plus,
  MapPin,
  Ruler,
  User
} from 'lucide-react'
import { Propriedade } from '@/lib/crm-utils'
import { propriedadesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function PropriedadesConteudo() {
  const router = useRouter()
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const carregarPropriedades = async () => {
      try {
        setCarregando(true)
        const dados = await propriedadesApi.listarPropriedades()
        setPropriedades(dados)
      } catch (error) {
        console.error('Erro ao carregar propriedades:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as propriedades.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarPropriedades()
  }, [])

  const propriedadesFiltradas = propriedades.filter(propriedade => 
    propriedade.nome.toLowerCase().includes(busca.toLowerCase()) ||
    propriedade.municipio.toLowerCase().includes(busca.toLowerCase()) ||
    propriedade.estado.toLowerCase().includes(busca.toLowerCase())
  )

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
        <h1 className="text-2xl font-bold tracking-tight">Propriedades</h1>
        <Button asChild>
          <Link href="/propriedades/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Propriedade
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar propriedades..."
            className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {propriedadesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Nenhuma propriedade encontrada</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {propriedadesFiltradas.map((propriedade) => (
            <Card key={propriedade.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{propriedade.nome}</CardTitle>
                <CardDescription>
                  {propriedade.municipio}, {propriedade.estado}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{propriedade.endereco}</span>
                  </div>
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{propriedade.area} hectares</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/propriedades/${propriedade.id}`}>
                    Ver Detalhes
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
