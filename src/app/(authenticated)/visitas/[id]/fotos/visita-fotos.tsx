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
  ArrowLeft, 
  Camera, 
  Trash2, 
  Upload,
  X,
  Plus
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { visitasApi } from '@/lib/mock-api/visitas'
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
      const novasFotos = [...visita.fotos]
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

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!visita) {
    return (
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/visitas/${visitaId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Fotos da Visita</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novas Fotos</CardTitle>
          <CardDescription>
            Selecione as fotos que deseja adicionar à visita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
            </div>

            {previewUrls.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-medium">Fotos selecionadas ({previewUrls.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removerArquivoSelecionado(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleEnviarFotos}
                    disabled={enviando || previewUrls.length === 0}
                  >
                    {enviando ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Enviar {previewUrls.length} foto(s)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos Existentes</CardTitle>
          <CardDescription>
            {visita.fotos.length} foto(s) registrada(s) nesta visita
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visita.fotos.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhuma foto registrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione fotos usando o formulário acima
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {visita.fotos.map((foto, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-md overflow-hidden border">
                    <img
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoverFoto(index)}
                    disabled={excluindo}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/visitas/${visitaId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Detalhes
            </Link>
          </Button>
        </CardFooter>
      </Card>

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
    </div>
  )
}
