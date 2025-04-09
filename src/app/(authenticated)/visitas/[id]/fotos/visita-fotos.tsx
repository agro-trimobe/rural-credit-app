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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Camera, 
  Trash2, 
  Upload,
  X,
  Plus,
  ChevronRight,
  Download,
  Eye,
  MoreVertical,
  Image
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import { visitasApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export default function VisitaFotosConteudo({ visitaId }: { visitaId: string }) {
  const router = useRouter()
  const [visita, setVisita] = useState<Visita | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [fotoParaExcluir, setFotoParaExcluir] = useState<number | null>(null)
  const [dialogoExclusaoAberto, setDialogoExclusaoAberto] = useState(false)
  const [fotoEmVisualizacao, setFotoEmVisualizacao] = useState<string | null>(null)

  useEffect(() => {
    const carregarVisita = async () => {
      try {
        setCarregando(true)
        const dadosVisita = await visitasApi.buscarVisitaPorId(visitaId)
        
        if (!dadosVisita) {
          toast({
            title: 'Erro',
            description: 'Visita não encontrada',
            variant: 'destructive',
          })
          router.push('/visitas')
          return
        }
        
        setVisita(dadosVisita)
      } catch (error) {
        console.error('Erro ao carregar visita:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da visita.',
          variant: 'destructive',
        })
      } finally {
        setCarregando(false)
      }
    }
    
    carregarVisita()
  }, [visitaId, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const newFiles = Array.from(files)
    setArquivosSelecionados(prev => [...prev, ...newFiles])
    
    // Gerar URLs de preview para os novos arquivos
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removerArquivoSelecionado = (index: number) => {
    setArquivosSelecionados(prev => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
    
    setPreviewUrls(prev => {
      const newUrls = [...prev]
      URL.revokeObjectURL(newUrls[index]) // Liberar a URL do objeto
      newUrls.splice(index, 1)
      return newUrls
    })
  }

  const handleEnviarFotos = async () => {
    if (!visita || arquivosSelecionados.length === 0) return
    
    try {
      setEnviando(true)
      
      // Simular o upload de fotos (em um ambiente real, enviaríamos para um servidor)
      // Aqui estamos apenas criando URLs locais para simular o processo
      const novasUrls = arquivosSelecionados.map(file => URL.createObjectURL(file))
      
      // Adicionar as novas fotos à visita
      const visitaAtualizada = await visitasApi.adicionarFotos(visitaId, novasUrls)
      
      if (!visitaAtualizada) {
        throw new Error('Não foi possível adicionar as fotos à visita.')
      }
      
      // Atualizar o estado local
      setVisita(visitaAtualizada)
      
      // Limpar os arquivos selecionados e previews
      setArquivosSelecionados([])
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
      
      toast({
        title: 'Fotos adicionadas',
        description: `${novasUrls.length} foto(s) adicionada(s) com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao adicionar fotos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar as fotos à visita.',
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleRemoverFoto = async (index: number) => {
    if (!visita) return
    
    setFotoParaExcluir(index)
    setDialogoExclusaoAberto(true)
  }

  const handleConfirmarExclusao = async () => {
    if (!visita || fotoParaExcluir === null) return
    
    try {
      setExcluindo(true)
      
      // Criar uma cópia do array de fotos sem a foto a ser removida
      const novasFotos = [...(visita.fotos || [])]
      novasFotos.splice(fotoParaExcluir, 1)
      
      // Atualizar a visita com o novo array de fotos
      const visitaAtualizada = await visitasApi.atualizarVisita(visitaId, {
        fotos: novasFotos
      })
      
      if (!visitaAtualizada) {
        throw new Error('Não foi possível remover a foto da visita.')
      }
      
      // Atualizar o estado local
      setVisita(visitaAtualizada)
      
      toast({
        title: 'Foto removida',
        description: 'A foto foi removida com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao remover foto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a foto da visita.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
      setFotoParaExcluir(null)
      setDialogoExclusaoAberto(false)
    }
  }

  // Função para visualizar uma foto em tamanho maior
  const handleVisualizarFoto = (url: string) => {
    setFotoEmVisualizacao(url)
  }

  // Função para fechar a visualização da foto
  const handleFecharVisualizacao = () => {
    setFotoEmVisualizacao(null)
  }

  if (carregando) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!visita) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <p>Visita não encontrada.</p>
            <Button asChild className="mt-4">
              <Link href="/visitas">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Visitas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-4 space-y-4">
      {/* Cabeçalho com breadcrumbs e informações da visita */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/visitas" className="hover:text-primary transition-colors">Visitas</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/visitas/${visitaId}`} className="hover:text-primary transition-colors">Detalhes</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Fotos</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Fotos da Visita</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{formatarData(visita.data)}</span>
              {visita.status && (
                <>
                  <span className="mx-1">•</span>
                  <Badge variant={visita.status === 'Agendada' ? 'outline' : 
                           visita.status === 'Realizada' ? 'default' : 'destructive'}>
                    {visita.status}
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          <Button variant="outline" asChild size="sm">
            <Link href={`/visitas/${visitaId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {/* Área de Upload - 2 colunas em desktop */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Adicionar Novas Fotos</CardTitle>
            <CardDescription>
              Selecione as fotos que deseja adicionar à visita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label 
                htmlFor="file-upload" 
                className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-primary/60 group-hover:text-primary/80 transition-colors" />
                  <p className="text-sm font-medium">
                    Arraste fotos ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG ou JPEG (máx. 10MB por arquivo)
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  multiple
                  onChange={handleFileChange}
                  disabled={enviando}
                />
              </label>

              {previewUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Fotos selecionadas</span>
                      <Badge variant="outline">{previewUrls.length}</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleEnviarFotos}
                      disabled={enviando || previewUrls.length === 0}
                    >
                      {enviando ? (
                        <>Enviando...</>
                      ) : (
                        <>
                          <Upload className="mr-2 h-3.5 w-3.5" /> Enviar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border bg-muted/20">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removerArquivoSelecionado(index)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remover"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Fotos Existentes - 3 colunas em desktop */}
        <Card className="md:col-span-3">

          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fotos da Visita</CardTitle>
                <CardDescription>
                  {visita.fotos?.length || 0} foto(s) registrada(s)
                </CardDescription>
              </div>
              
              {visita.fotos?.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" disabled>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Baixar todas as fotos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!visita.fotos?.length ? (
              <div className="text-center py-6 border-2 border-dashed rounded-lg border-muted">
                <Image className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="font-medium">Nenhuma foto registrada</p>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Adicione fotos usando o formulário ao lado
                </p>
                <Button size="sm" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Plus className="mr-2 h-3.5 w-3.5" /> Adicionar Fotos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {visita.fotos?.map((foto, index) => (
                  <div key={index} className="relative group">
                    <div 
                      className="aspect-square rounded-md overflow-hidden border bg-muted/20 cursor-pointer"
                      onClick={() => handleVisualizarFoto(foto)}
                    >
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 px-2"
                        onClick={() => handleVisualizarFoto(foto)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8 px-2"
                        onClick={() => handleRemoverFoto(index)}
                        disabled={excluindo}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog
        open={dialogoExclusaoAberto}
        onOpenChange={setDialogoExclusaoAberto}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a foto?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de visualização de foto */}
      {fotoEmVisualizacao && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleFecharVisualizacao}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img 
              src={fotoEmVisualizacao} 
              alt="Visualização da foto" 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 border-none text-white"
              onClick={handleFecharVisualizacao}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
