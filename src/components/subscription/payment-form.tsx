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

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  const { toast } = useToast();
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
    const { 
      fullName, 
      email, 
      cpf, 
      phone, 
      zipCode, 
      addressNumber, 
      cardNumber, 
      cardName, 
      cardExpiryDate, 
      cardCvv 
    } = formData;

    // Validar dados do titular
    if (!fullName.trim()) {
      newErrors.fullName = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    }

    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      const cpfValue = cpf.replace(/\D/g, '');
      if (cpfValue.length !== 11) {
        newErrors.cpf = 'CPF inválido';
      }
    }

    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const phoneValue = phone.replace(/\D/g, '');
      if (phoneValue.length < 10 || phoneValue.length > 11) {
        newErrors.phone = 'Telefone inválido';
      }
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    } else {
      const zipCodeValue = zipCode.replace(/\D/g, '');
      if (zipCodeValue.length !== 8) {
        newErrors.zipCode = 'CEP inválido';
      }
    }

    if (!addressNumber.trim()) {
      newErrors.addressNumber = 'Número é obrigatório';
    }

    // Validar dados do cartão
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Número do cartão é obrigatório';
    } else if (!validateCreditCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    if (!cardName.trim()) {
      newErrors.cardName = 'Nome no cartão é obrigatório';
    }

    if (!cardExpiryDate.trim()) {
      newErrors.cardExpiryDate = 'Data de expiração é obrigatória';
    } else {
      const [expiryMonth, expiryYear] = cardExpiryDate.split('/');
      if (!validateExpiryDate(expiryMonth, expiryYear)) {
        newErrors.cardExpiryDate = 'Data de expiração inválida';
      }
    }

    if (!cardCvv.trim()) {
      newErrors.cardCvv = 'CCV é obrigatório';
    } else if (!validateCCV(cardCvv)) {
      newErrors.cardCvv = 'CCV inválido';
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

    await onSubmit(formData);
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
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nome completo"
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="E-mail"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className={errors.cpf ? 'border-destructive' : ''}
                maxLength={14}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive">{errors.cpf}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-destructive' : ''}
                maxLength={15}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="00000-000"
                className={errors.zipCode ? 'border-destructive' : ''}
                maxLength={9}
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive">{errors.zipCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressNumber">Número</Label>
              <Input
                id="addressNumber"
                value={formData.addressNumber}
                onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                placeholder="123"
                className={errors.addressNumber ? 'border-destructive' : ''}
              />
              {errors.addressNumber && (
                <p className="text-sm text-destructive">{errors.addressNumber}</p>
              )}
            </div>

            {/* Dados do cartão */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="0000 0000 0000 0000"
                className={errors.cardNumber ? 'border-destructive' : ''}
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive">{errors.cardNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no cartão</Label>
              <Input
                id="cardName"
                value={formData.cardName}
                onChange={(e) => handleInputChange('cardName', e.target.value)}
                placeholder="Como está escrito no cartão"
                className={errors.cardName ? 'border-destructive' : ''}
              />
              {errors.cardName && (
                <p className="text-sm text-destructive">{errors.cardName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardExpiryDate">Data de expiração</Label>
              <Input
                id="cardExpiryDate"
                value={formData.cardExpiryDate}
                onChange={(e) => handleInputChange('cardExpiryDate', e.target.value)}
                placeholder="MM/AA"
                className={errors.cardExpiryDate ? 'border-destructive' : ''}
                maxLength={5}
              />
              {errors.cardExpiryDate && (
                <p className="text-sm text-destructive">{errors.cardExpiryDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardCvv">CCV</Label>
              <Input
                id="cardCvv"
                value={formData.cardCvv}
                onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                placeholder="000"
                className={errors.cardCvv ? 'border-destructive' : ''}
                maxLength={4}
              />
              {errors.cardCvv && (
                <p className="text-sm text-destructive">{errors.cardCvv}</p>
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
