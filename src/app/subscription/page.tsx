'use client';

import { useEffect, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { IMaskInput } from 'react-imask';
import type { MaskedOptions } from 'imask';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Interfaces
interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isLoading?: boolean;
}

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
  nextBillingDate?: string;
}

interface SubscriptionStatusProps {
  subscription: SubscriptionData;
}

interface StatusInfo {
  text: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  mask?: string | MaskedOptions | any;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, error, mask, className, ...props }) => {
  const inputComponent = mask ? (
    // @ts-ignore - Ignorando problemas de tipagem do IMaskInput com props complexos
    <IMaskInput
      id={name}
      name={name}
      mask={mask}
      {...props}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive",
        className
      )}
    />
  ) : (
    <Input
      id={name}
      name={name}
      {...props}
      className={cn(error && "border-destructive", className)}
    />
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </Label>
      {inputComponent}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    zipCode: '',
    addressNumber: '',
    cardNumber: '',
    cardName: '',
    cardExpiryDate: '',
    cardCvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="Nome Completo"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            placeholder="Digite seu nome completo"
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="seu@email.com"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="CPF"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            required
            mask="000.000.000-00"
            placeholder="000.000.000-00"
          />

          <FormInput
            label="Telefone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            mask="(00) 00000-0000"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="CEP"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
            mask="00000-000"
            placeholder="00000-000"
          />

          <FormInput
            label="Número do Endereço"
            name="addressNumber"
            value={formData.addressNumber}
            onChange={handleInputChange}
            required
            placeholder="Número do endereço"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Dados do Cartão</h3>
          <FormInput
            label="Número do Cartão"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            required
            mask="0000 0000 0000 0000"
            placeholder="0000 0000 0000 0000"
          />

          <FormInput
            label="Nome no Cartão"
            name="cardName"
            value={formData.cardName}
            onChange={handleInputChange}
            required
            placeholder="Nome como está no cartão"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Validade"
              name="cardExpiryDate"
              value={formData.cardExpiryDate}
              onChange={handleInputChange}
              required
              // @ts-ignore - Ignorando problemas de tipagem com a máscara complexa
              mask={{
                mask: 'MM/YY',
                blocks: {
                  MM: {
                    mask: /^(0[1-9]|1[0-2])$/,
                    placeholderChar: 'M'
                  },
                  YY: {
                    mask: /^([2-9][0-9])$/,
                    placeholderChar: 'A'
                  }
                }
              }}
              placeholder="MM/AA"
            />

            <FormInput
              label="CVV"
              name="cardCvv"
              value={formData.cardCvv}
              onChange={handleInputChange}
              required
              mask="000"
              placeholder="123"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        variant="default"
        size="lg"
      >
        {isLoading ? (
          <>
            <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processando...</span>
          </>
        ) : (
          `Assinar por R$ 1,00/semana`
        )}
      </Button>
    </form>
  );
};

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ subscription }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusInfo = (status: string): StatusInfo => {
    const statusMap: Record<string, StatusInfo> = {
      'TRIAL': {
        text: 'Período de Teste',
        color: 'text-blue-500 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        icon: (
          <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'TRIAL_EXPIRED': {
        text: 'Período de Teste Expirado',
        color: 'text-red-500 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950',
        icon: (
          <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'ACTIVE': {
        text: 'Assinatura Ativa',
        color: 'text-green-500 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950',
        icon: (
          <svg className="h-5 w-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      },
      'EXPIRED': {
        text: 'Assinatura Expirada',
        color: 'text-red-500 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950',
        icon: (
          <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      }
    };

    return statusMap[status] || {
      text: status,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      icon: null
    };
  };

  const statusInfo = getStatusInfo(subscription.status);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Status da Assinatura</CardTitle>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.icon}
          <span className="font-medium">{statusInfo.text}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {subscription.trialEndsAt && (
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Período de Teste até:</span>
              <span className="font-medium">{formatDate(subscription.trialEndsAt)}</span>
            </div>
          )}

          {subscription.subscriptionEndsAt && (
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Assinatura válida até:</span>
              <span className="font-medium">{formatDate(subscription.subscriptionEndsAt)}</span>
            </div>
          )}

          {subscription.nextBillingDate && (
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Próximo Vencimento:</span>
              <span className="font-medium">{formatDate(subscription.nextBillingDate)}</span>
            </div>
          )}
        </div>

        {subscription.status !== 'ACTIVE' && (
          <div className="mt-6">
            <div className={`rounded-md ${statusInfo.bgColor} p-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {statusInfo.icon}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${statusInfo.color}`}>
                    Atenção
                  </h3>
                  <div className={`mt-2 text-sm ${statusInfo.color}`}>
                    {subscription.status === 'TRIAL_EXPIRED' && (
                      <p>Seu período de teste expirou. Assine agora para continuar usando o sistema.</p>
                    )}
                    {subscription.status === 'TRIAL' && (
                      <p>Você está no período de teste. Aproveite para conhecer todas as funcionalidades!</p>
                    )}
                    {subscription.status === 'EXPIRED' && (
                      <p>Sua assinatura expirou. Renove agora para continuar usando o sistema.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      toast({
        title: 'Atenção',
        description: message,
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Erro ao buscar dados da assinatura:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da assinatura.',
          variant: 'destructive',
        });
      }
    };

    fetchSubscription();
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
        const error = await response.json();
        throw new Error(error.message || error.error || 'Erro ao processar assinatura');
      }

      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso.',
      });

      // Aguarda 2 segundos antes de redirecionar
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Assinatura Rural Credit App</CardTitle>
          <CardDescription>
            Tenha acesso completo a todas as funcionalidades do sistema por apenas R$ 1,00/semana
          </CardDescription>
        </CardHeader>

        <CardContent>
          {subscription && (
            <div className="mb-8">
              <SubscriptionStatus subscription={subscription} />
            </div>
          )}

          <PaymentForm onSubmit={handleSubmit} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
