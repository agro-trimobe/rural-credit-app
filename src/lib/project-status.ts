export const PROJECT_STATUS = {
  'em_andamento': 'Em Andamento',
  'concluido': 'Concluído',
  'cancelado': 'Cancelado',
  'aguardando_documentos': 'Aguardando Documentos',
  'em_analise': 'Em Análise'
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;

export function getStatusLabel(status: string): string {
  return PROJECT_STATUS[status as ProjectStatus] || status;
}

export function getStatusIcon(status: string) {
  switch (status) {
    case 'em_andamento':
      return { icon: 'Timer', color: 'text-yellow-500' };
    case 'concluido':
      return { icon: 'CheckCircle2', color: 'text-green-500' };
    case 'cancelado':
      return { icon: 'AlertOctagon', color: 'text-red-500' };
    case 'aguardando_documentos':
      return { icon: 'FileText', color: 'text-blue-500' };
    case 'em_analise':
      return { icon: 'Search', color: 'text-purple-500' };
    default:
      return { icon: 'HelpCircle', color: 'text-gray-500' };
  }
}
