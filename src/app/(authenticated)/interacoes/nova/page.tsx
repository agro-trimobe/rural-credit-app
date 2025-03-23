import { Separator } from '@/components/ui/separator'
import { Interacao, Cliente } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import { interacoesApi, clientesApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import NovaInteracaoSelecionarClienteConteudo from './selecionar-cliente'

export default function NovaInteracaoSelecionarClientePage() {
  return <NovaInteracaoSelecionarClienteConteudo />
}
