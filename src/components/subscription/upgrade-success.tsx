'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { formatarMoeda } from '@/lib/formatters';
import { ASAAS_SUBSCRIPTION_BASIC_VALUE, ASAAS_SUBSCRIPTION_PREMIUM_VALUE } from '@/lib/asaas-config';

interface UpgradeSuccessMessageProps {
  plan: SubscriptionPlan;
  onContinue?: () => void;
}

function UpgradeSuccessMessage({ plan, onContinue }: UpgradeSuccessMessageProps) {
  const router = useRouter();
  const planValue = plan === 'BASIC' 
    ? ASAAS_SUBSCRIPTION_BASIC_VALUE 
    : ASAAS_SUBSCRIPTION_PREMIUM_VALUE;
  
  const redirectToDashboard = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push('/dashboard');
    }
  };
  
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="mx-auto max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Assinatura Concluída com Sucesso!</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="mb-4">
            Sua assinatura do <strong>Plano {plan === 'BASIC' ? 'Básico' : 'Premium'}</strong> foi processada com sucesso.
            Você será cobrado <strong>{formatarMoeda(planValue)}</strong> mensalmente.
          </p>
          <p className="text-muted-foreground">
            Você será redirecionado automaticamente para o Dashboard em alguns segundos...
          </p>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <Button onClick={redirectToDashboard} className="w-full">
            Continuar para o Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Exportações
export { UpgradeSuccessMessage };
export default UpgradeSuccessMessage;
