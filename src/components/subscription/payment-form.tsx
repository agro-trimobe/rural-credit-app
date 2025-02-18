'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateCreditCardNumber, validateExpiryDate, validateCCV, validatePostalCode } from '@/lib/credit-card-utils';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isLoading: boolean;
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

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PaymentFormData>({
    creditCard: {
      holderName: '',
      number: '',
      expiryMonth: '',
      expiryYear: '',
      ccv: '',
    },
    creditCardHolderInfo: {
      name: '',
      email: '',
      cpfCnpj: '',
      postalCode: '',
      addressNumber: '',
      phone: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    section: 'creditCard' | 'creditCardHolderInfo',
    field: string,
    value: string
  ) => {
    // Se for o campo holderName do cartão, atualizar também o name do titular
    if (section === 'creditCard' && field === 'holderName') {
      setFormData(prev => ({
        ...prev,
        creditCard: {
          ...prev.creditCard,
          holderName: value
        },
        creditCardHolderInfo: {
          ...prev.creditCardHolderInfo,
          name: value // Sincronizar com o nome do titular
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { creditCard, creditCardHolderInfo } = formData;

    // Validar dados do cartão
    if (!creditCard.holderName.trim()) {
      newErrors.holderName = 'Nome é obrigatório';
    }

    if (!validateCreditCardNumber(creditCard.number)) {
      newErrors.number = 'Número do cartão inválido';
    }

    if (!validateExpiryDate(creditCard.expiryMonth, creditCard.expiryYear)) {
      newErrors.expiryMonth = 'Data de expiração inválida';
      newErrors.expiryYear = 'Data de expiração inválida';
    }

    if (!validateCCV(creditCard.ccv)) {
      newErrors.ccv = 'CCV inválido';
    }

    // Validar dados do titular
    if (!creditCardHolderInfo.name.trim()) {
      newErrors.name = 'Nome do titular é obrigatório';
    }

    if (!creditCardHolderInfo.cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF é obrigatório';
    } else {
      const cpf = creditCardHolderInfo.cpfCnpj.replace(/\D/g, '');
      if (cpf.length !== 11) {
        newErrors.cpfCnpj = 'CPF inválido';
      }
    }

    if (!validatePostalCode(creditCardHolderInfo.postalCode)) {
      newErrors.postalCode = 'CEP inválido';
    }

    if (!creditCardHolderInfo.addressNumber.trim()) {
      newErrors.addressNumber = 'Número é obrigatório';
    }

    if (!creditCardHolderInfo.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const phone = creditCardHolderInfo.phone.replace(/\D/g, '');
      if (phone.length < 10 || phone.length > 11) {
        newErrors.phone = 'Telefone inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Erro",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    // Formatar dados antes de enviar
    const formattedData = {
      ...formData,
      creditCardHolderInfo: {
        ...formData.creditCardHolderInfo,
        cpfCnpj: formData.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ''),
        postalCode: formData.creditCardHolderInfo.postalCode.replace(/\D/g, '')
      }
    };

    await onSubmit(formattedData);
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>Informações de Pagamento</CardTitle>
        <CardDescription>
          Insira os dados do seu cartão de crédito para assinar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Dados do titular */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do titular</Label>
              <Input
                id="name"
                value={formData.creditCardHolderInfo.name}
                onChange={(e) => handleInputChange('creditCardHolderInfo', 'name', e.target.value)}
                placeholder="Nome do titular"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={formData.creditCardHolderInfo.email}
                onChange={(e) => handleInputChange('creditCardHolderInfo', 'email', e.target.value)}
                placeholder="E-mail"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF</Label>
              <Input
                id="cpfCnpj"
                value={formData.creditCardHolderInfo.cpfCnpj}
                onChange={(e) => handleInputChange('creditCardHolderInfo', 'cpfCnpj', e.target.value)}
                placeholder="000.000.000-00"
                className={errors.cpfCnpj ? 'border-destructive' : ''}
                maxLength={14}
              />
              {errors.cpfCnpj && (
                <p className="text-sm text-destructive">{errors.cpfCnpj}</p>
              )}
            </div>

            {/* Dados do cartão */}
            <div className="space-y-2">
              <Label htmlFor="holderName">Nome no cartão</Label>
              <Input
                id="holderName"
                value={formData.creditCard.holderName}
                onChange={(e) => handleInputChange('creditCard', 'holderName', e.target.value)}
                placeholder="Como está escrito no cartão"
                className={errors.holderName ? 'border-destructive' : ''}
              />
              {errors.holderName && (
                <p className="text-sm text-destructive">{errors.holderName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número do cartão</Label>
              <Input
                id="number"
                value={formData.creditCard.number}
                onChange={(e) => handleInputChange('creditCard', 'number', e.target.value)}
                placeholder="0000 0000 0000 0000"
                className={errors.number ? 'border-destructive' : ''}
                maxLength={19}
              />
              {errors.number && (
                <p className="text-sm text-destructive">{errors.number}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Mês</Label>
                <Input
                  id="expiryMonth"
                  value={formData.creditCard.expiryMonth}
                  onChange={(e) => handleInputChange('creditCard', 'expiryMonth', e.target.value)}
                  placeholder="MM"
                  className={errors.expiryMonth ? 'border-destructive' : ''}
                  maxLength={2}
                />
                {errors.expiryMonth && (
                  <p className="text-sm text-destructive">{errors.expiryMonth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryYear">Ano</Label>
                <Input
                  id="expiryYear"
                  value={formData.creditCard.expiryYear}
                  onChange={(e) => handleInputChange('creditCard', 'expiryYear', e.target.value)}
                  placeholder="AA"
                  className={errors.expiryYear ? 'border-destructive' : ''}
                  maxLength={2}
                />
                {errors.expiryYear && (
                  <p className="text-sm text-destructive">{errors.expiryYear}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ccv">CCV</Label>
                <Input
                  id="ccv"
                  value={formData.creditCard.ccv}
                  onChange={(e) => handleInputChange('creditCard', 'ccv', e.target.value)}
                  placeholder="000"
                  className={errors.ccv ? 'border-destructive' : ''}
                  maxLength={4}
                />
                {errors.ccv && (
                  <p className="text-sm text-destructive">{errors.ccv}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">CEP</Label>
                <Input
                  id="postalCode"
                  value={formData.creditCardHolderInfo.postalCode}
                  onChange={(e) => handleInputChange('creditCardHolderInfo', 'postalCode', e.target.value)}
                  placeholder="00000-000"
                  className={errors.postalCode ? 'border-destructive' : ''}
                  maxLength={9}
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive">{errors.postalCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressNumber">Número</Label>
                <Input
                  id="addressNumber"
                  value={formData.creditCardHolderInfo.addressNumber}
                  onChange={(e) => handleInputChange('creditCardHolderInfo', 'addressNumber', e.target.value)}
                  placeholder="123"
                  className={errors.addressNumber ? 'border-destructive' : ''}
                />
                {errors.addressNumber && (
                  <p className="text-sm text-destructive">{errors.addressNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.creditCardHolderInfo.phone}
                onChange={(e) => handleInputChange('creditCardHolderInfo', 'phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-destructive' : ''}
                maxLength={15}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processando..." : "Assinar agora"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
