'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

import { PaymentForm } from '@/components/subscription/payment-form';
import { SimplifiedPaymentForm } from '@/components/subscription/simplified-payment-form';
import { SubscriptionStatus } from '@/components/subscription/subscription-status';
import { SubscriptionBenefits } from '@/components/subscription/subscription-benefits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Info, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Interfaces
interface PaymentFormData {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  zipCode: string;
  addressNumber: string;
  cardNumber: string;
  cardName: string;
  cardExpiryDate: string;
  cardCvv: string;
}

interface SubscriptionData {
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Busca os dados de assinatura do usuário
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        
        if (!response.ok) {
          // Se não for um 401 (Unauthorized), mostra erro
          if (response.status !== 401) {
            throw new Error(`Erro ao buscar status da assinatura: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        setSubscription(data);

        // Redireciona para o dashboard se a assinatura estiver ativa
        if (data.status === 'ACTIVE' && !searchParams.get('force')) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao buscar status da assinatura:', error);
      }
    };

    if (session?.user) {
      fetchSubscriptionStatus();
    }
  }, [session, router, searchParams]);

  const handleSubmit = async (formData: PaymentFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditCard: {
            holderName: formData.cardName,
            number: formData.cardNumber.replace(/\D/g, ''),
            expiryMonth: formData.cardExpiryDate.split('/')[0],
            expiryYear: formData.cardExpiryDate.split('/')[1],
            ccv: formData.cardCvv,
          },
          creditCardHolderInfo: {
            name: formData.fullName,
            email: formData.email,
            cpfCnpj: formData.cpf.replace(/\D/g, ''),
            postalCode: formData.zipCode.replace(/\D/g, ''),
            addressNumber: formData.addressNumber,
            phone: formData.phone.replace(/\D/g, '')
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar assinatura');
      }
      
      // Mostrar confirmação
      setShowConfirmation(true);
      
      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso.',
      });

      // Aguarda 3 segundos antes de redirecionar
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      toast({
        title: 'Erro no processamento do pagamento',
        description: error instanceof Error ? error.message : 'Erro ao processar assinatura. Verifique os dados do cartão.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Determina se deve mostrar alerta de expiração
  const showExpirationAlert = subscription?.status === 'TRIAL_EXPIRED' || subscription?.status === 'EXPIRED';
  
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-16 flex items-center justify-center">
        <div className="container px-4 mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Pagamento Confirmado!</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Sua assinatura foi ativada com sucesso. Você já tem acesso completo a todas as funcionalidades.
          </p>
          
          <Card className="mb-8 border-green-200 bg-green-50/30">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Plano:</span>
                  <span className="text-sm">Assinatura Mensal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Valor:</span>
                  <span className="text-sm">R$ 10,00/mês</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm text-green-600 font-medium">Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Próxima cobrança:</span>
                  <span className="text-sm">Em 30 dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            size="lg" 
            className="w-full" 
            onClick={() => router.push('/dashboard')}
          >
            Ir para o Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Página principal de assinatura
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-10">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Cabeçalho da página */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter mb-3">Período de Teste Expirado</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Assine agora para continuar usando o Rural Credit App
          </p>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mt-2">
            Não perca acesso aos seus projetos e dados
          </p>
        </div>

        {/* Status da assinatura */}
        {subscription && (
          <div className="mb-12">
            <SubscriptionStatus 
              status={subscription.status} 
              trialEndsAt={subscription.trialEndsAt} 
              subscriptionEndsAt={subscription.subscriptionEndsAt} 
            />
          </div>
        )}

        <div className="flex justify-center">
          <div className="max-w-xl w-full">
            <div className="space-y-6">
              <SubscriptionBenefits />
              
              {/* Formulário de pagamento integrado na página */}
              <div className="mt-8 bg-white rounded-lg border border-muted p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Informações de Pagamento</h3>
                  <p className="text-muted-foreground text-sm">
                    Preencha os dados abaixo para assinar o Rural Credit App
                  </p>
                </div>
                
                <SimplifiedPaymentForm onSubmit={handleSubmit} isLoading={loading} />
                
                <div className="mt-6 pt-4 border-t border-muted-foreground/20 text-center">
                  <div className="flex items-center justify-center mb-2 text-muted-foreground">
                    <Info className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Pagamento Seguro</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Seus dados são protegidos com criptografia de ponta a ponta. 
                    Utilizamos a Asaas, empresa certificada pelo Banco Central, para processar pagamentos com segurança.
                  </p>
                </div>
              </div>
              
              <Card className="border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">Perguntas Frequentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Como funciona a cobrança?</AccordionTrigger>
                      <AccordionContent>
                        A cobrança é mensal no valor de R$ 10,00, realizada automaticamente no cartão cadastrado. Você terá 7 dias de teste gratuito antes da primeira cobrança.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Posso cancelar quando quiser?</AccordionTrigger>
                      <AccordionContent>
                        Sim, você pode cancelar sua assinatura a qualquer momento pela área do usuário, sem taxas adicionais. Se cancelar durante o período de teste de 7 dias, não será cobrado.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>O que acontece após o período de teste?</AccordionTrigger>
                      <AccordionContent>
                        Após o período de teste de 7 dias, será cobrado o valor da assinatura automaticamente no cartão cadastrado. Você receberá um e-mail de confirmação quando a cobrança for realizada.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Os dados do meu cartão estão seguros?</AccordionTrigger>
                      <AccordionContent>
                        Sim, utilizamos a Asaas, empresa certificada e regulamentada pelo Banco Central para processamento dos pagamentos, garantindo total segurança dos seus dados. Todas as transações são criptografadas e seguem os padrões PCI-DSS.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger>Preciso fornecer dados do cartão durante o teste gratuito?</AccordionTrigger>
                      <AccordionContent>
                        Sim, para iniciar o período de teste gratuito é necessário cadastrar os dados do cartão de crédito. Isso garante uma transição suave para a assinatura paga após o período de teste, mas você não será cobrado durante os 7 dias de teste.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                      <AccordionTrigger>Quais métodos de pagamento são aceitos?</AccordionTrigger>
                      <AccordionContent>
                        Atualmente aceitamos apenas cartão de crédito para pagamento das assinaturas. Trabalhamos com as principais bandeiras: Visa, Mastercard, American Express, Elo e Hipercard.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-7">
                      <AccordionTrigger>Como recebo suporte técnico?</AccordionTrigger>
                      <AccordionContent>
                        Assinantes têm acesso ao suporte técnico prioritário através do e-mail suporte@ruralcreditapp.com.br ou pelo chat disponível dentro da plataforma. Nosso horário de atendimento é de segunda a sexta, das 8h às 18h.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
