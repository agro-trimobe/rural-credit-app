'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  ChevronRight, 
  Home, 
  Pencil, 
  Trash, 
  User, 
  CreditCard, 
  DollarSign,
  MapPin,
  Ruler,
  FileText,
  Upload,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Dados de exemplo
const projectData = {
  id: '1',
  name: 'Projeto Exemplo',
  client: 'João Silva',
  creditLine: 'Pronaf',
  amount: 'R$ 100.000,00',
  status: 'Em Andamento',
  property: {
    name: 'Fazenda São João',
    area: '100 hectares',
    location: 'Latitude: -23.5505, Longitude: -46.6333',
  },
  documents: [
    { id: 1, name: 'Documento 1.pdf', type: 'PDF', size: '2.4 MB', updatedAt: '10/01/2025' },
    { id: 2, name: 'Documento 2.pdf', type: 'PDF', size: '1.8 MB', updatedAt: '09/01/2025' },
  ],
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{projectData.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{projectData.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {projectData.creditLine}
            </Badge>
            <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
              {projectData.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${resolvedParams.id}/edit`}>
            <Button variant="outline" className="h-9">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button variant="destructive" className="h-9">
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-background">
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          <TabsTrigger value="property">Propriedade Rural</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Cliente</CardTitle>
                <CardDescription>Detalhes do solicitante do crédito</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{projectData.client}</div>
                    <div className="text-sm text-muted-foreground">Cliente</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Crédito</CardTitle>
                <CardDescription>Detalhes da linha de crédito e valores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{projectData.creditLine}</div>
                    <div className="text-sm text-muted-foreground">Linha de Crédito</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-4">
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{projectData.amount}</div>
                    <div className="text-sm text-muted-foreground">Valor Solicitado</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="property">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados da Propriedade</CardTitle>
                <CardDescription>Informações sobre a propriedade rural</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{projectData.property.name}</div>
                      <div className="text-sm text-muted-foreground">Nome da Propriedade</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Ruler className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{projectData.property.area}</div>
                      <div className="text-sm text-muted-foreground">Área Total</div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="mb-4 font-medium">Localização</div>
                  <div className="aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
                    {/* Implementar mapa aqui */}
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {projectData.property.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Documentos do Projeto</CardTitle>
                  <CardDescription>Gerenciar documentos anexados</CardDescription>
                </div>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Adicionar Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.size} • Atualizado em {doc.updatedAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
