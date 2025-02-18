'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/subscription/plan-card';
import { PaymentForm } from '@/components/subscription/payment-form';

interface SubscriptionData {
  status: string;
  trialEndsAt: string;
}

interface PaymentFormData {
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    async function loadSubscriptionData() {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        setSubscriptionData(data);
      } catch (error) {
        console.error('Erro ao buscar dados da assinatura:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da assinatura.",
          variant: "destructive",
        });
      }
    }

    loadSubscriptionData();
  }, [toast]);

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
            holderName: formData.creditCard.holderName,
            number: formData.creditCard.number.replace(/\D/g, ''),
            expiryMonth: formData.creditCard.expiryMonth,
            expiryYear: formData.creditCard.expiryYear,
            ccv: formData.creditCard.ccv,
          },
          creditCardHolderInfo: {
            name: formData.creditCard.holderName,
            email: session?.user?.email,
            cpfCnpj: formData.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ''),
            postalCode: formData.creditCardHolderInfo.postalCode.replace(/\D/g, ''),
            addressNumber: formData.creditCardHolderInfo.addressNumber,
            phone: formData.creditCardHolderInfo.phone.replace(/\D/g, '')
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar assinatura');
      }

      toast({
        title: "Sucesso!",
        description: "Sua assinatura foi criada com sucesso.",
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar assinatura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[1200px] flex flex-col items-center space-y-8">
        {!showPaymentForm ? (
          <>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-bold">Seu período de teste terminou</h1>
              <p className="text-xl text-muted-foreground">
                Continue aproveitando todos os recursos do Rural Credit App
              </p>
            </div>
            <PlanCard onSubscribe={() => setShowPaymentForm(true)} />
            {process.env.NEXT_PUBLIC_SHOW_TEST_TOOLS === 'true' && (
              <div className="mt-8 space-x-4">
                <Button variant="outline" onClick={() => router.push('/test/expire-trial')}>
                  Expirar Período de Teste
                </Button>
                <Button variant="outline" onClick={() => router.push('/test/guide')}>
                  Guia de Testes
                </Button>
              </div>
            )}
          </>
        ) : (
          <PaymentForm onSubmit={handleSubmit} isLoading={loading} />
        )}
      </div>
    </div>
  );
}
