'use client';

import { CheckCircle2, Database, Users, FileText, LifeBuoy, Zap, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SubscriptionBenefits() {
  const benefitCategories = [
    {
      title: "Gestão de Dados",
      icon: <Database className="h-5 w-5 text-primary" />,
      benefits: [
        "Cadastro ilimitado de propriedades rurais",
        "Armazenamento seguro de documentos",
        "Backup automático de informações"
      ]
    },
    {
      title: "Análise Financeira",
      icon: <FileText className="h-5 w-5 text-primary" />,
      benefits: [
        "Geração de relatórios completos de crédito rural",
        "Consultas de linhas de financiamento atualizadas",
        "Cálculos automáticos de viabilidade financeira"
      ]
    },
    {
      title: "Suporte e Atualizações",
      icon: <LifeBuoy className="h-5 w-5 text-primary" />,
      benefits: [
        "Suporte técnico prioritário",
        "Acesso a todas as atualizações do sistema",
        "Webinars exclusivos sobre crédito rural"
      ]
    },
    {
      title: "Produtividade",
      icon: <Zap className="h-5 w-5 text-primary" />,
      benefits: [
        "Interface otimizada para dispositivos móveis",
        "Acesso de qualquer lugar via internet",
        "Integração com outros sistemas agrícolas"
      ]
    }
  ];

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-primary mb-2">Benefícios da Assinatura</h3>
          <p className="text-muted-foreground">Acesso completo por apenas R$ 10,00/mês</p>
          <div className="flex items-center justify-center mt-3">
            <RefreshCw className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-600">7 dias de teste grátis</span>
          </div>
        </div>
        
        <div className="space-y-5">
          {benefitCategories.map((category, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                {category.icon}
                <h4 className="font-medium text-primary">{category.title}</h4>
              </div>
              <ul className="space-y-2 pl-7">
                {category.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
