'use client';

interface SubscriptionStatusProps {
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
}

interface StatusContent {
  title: string;
  subtitle: string;
  description?: string;
}

export function SubscriptionStatus({ status, trialEndsAt, subscriptionEndsAt }: SubscriptionStatusProps) {
  const getStatusContent = (): StatusContent => {
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    switch (status?.toUpperCase()) {
      case 'TRIAL':
        return {
          title: 'Período de Teste Ativo',
          subtitle: 'Aproveite todos os recursos do Rural Credit App',
          description: `Seu período de teste termina em ${formatDate(trialEndsAt)}`
        };

      case 'TRIAL_EXPIRED':
        return {
          title: 'Período de Teste Expirado',
          subtitle: 'Assine agora para continuar usando o Rural Credit App',
          description: 'Não perca acesso aos seus projetos e dados'
        };

      case 'ACTIVE':
        return {
          title: 'Assinatura Ativa',
          subtitle: 'Continue aproveitando todos os recursos do Rural Credit App',
          description: subscriptionEndsAt ? 
            `Sua assinatura é válida até ${formatDate(subscriptionEndsAt)}` :
            'Sua assinatura está ativa'
        };

      case 'EXPIRED':
        return {
          title: 'Assinatura Expirada',
          subtitle: 'Renove sua assinatura para continuar usando o Rural Credit App',
          description: 'Mantenha acesso aos seus projetos e todas as funcionalidades'
        };

      case 'OVERDUE':
        return {
          title: 'Pagamento Pendente',
          subtitle: 'Regularize sua assinatura para continuar usando o Rural Credit App',
          description: 'Evite a interrupção do acesso aos seus projetos'
        };

      case 'CANCELED':
        return {
          title: 'Assinatura Cancelada',
          subtitle: 'Reative sua assinatura para voltar a usar o Rural Credit App',
          description: 'Não perca acesso aos seus projetos e funcionalidades'
        };

      default:
        return {
          title: 'Bem-vindo ao Rural Credit App',
          subtitle: 'Escolha seu plano e comece a usar',
          description: 'Acesse todos os recursos com nossa assinatura premium'
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="text-center space-y-6 mb-12 transition-all duration-300 ease-in-out opacity-100">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight transition-all duration-300">{content.title}</h1>
      <div className="space-y-2">
        <p className="text-lg sm:text-xl text-muted-foreground transition-all duration-300">{content.subtitle}</p>
        {content.description && (
          <p className="text-base sm:text-lg text-muted-foreground transition-all duration-300">{content.description}</p>
        )}
      </div>
    </div>
  );
}
