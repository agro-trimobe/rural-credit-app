'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateCreditCardNumber, validateExpiryDate, validateCCV } from '@/lib/credit-card-utils';
import { CreditCard } from 'lucide-react';
import { Info } from 'lucide-react';

interface SimplifiedPaymentFormProps {
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

export function SimplifiedPaymentForm({ onSubmit, isLoading }: SimplifiedPaymentFormProps) {
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

  // Função para formatar CPF (000.000.000-00)
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  // Função para formatar telefone ((00) 00000-0000)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Função para formatar CEP (00000-000)
  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  // Função para formatar número do cartão (0000 0000 0000 0000)
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = [];
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join(' ');
  };

  // Função para formatar data de validade (MM/AA)
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    // Aplicar formatação conforme o campo
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCpf(value);
      // Limitar ao tamanho máximo do CPF formatado
      if (formattedValue.length > 14) {
        formattedValue = formattedValue.slice(0, 14);
      }
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
      // Limitar ao tamanho máximo do telefone formatado
      if (formattedValue.length > 15) {
        formattedValue = formattedValue.slice(0, 15);
      }
    } else if (field === 'zipCode') {
      formattedValue = formatZipCode(value);
      // Limitar ao tamanho máximo do CEP formatado
      if (formattedValue.length > 9) {
        formattedValue = formattedValue.slice(0, 9);
      }
    } else if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      // Limitar ao tamanho máximo do número do cartão formatado
      if (formattedValue.length > 19) {
        formattedValue = formattedValue.slice(0, 19);
      }
    } else if (field === 'cardExpiryDate') {
      formattedValue = formatExpiryDate(value);
      // Limitar ao tamanho máximo da data de validade formatada
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.slice(0, 5);
      }
    } else if (field === 'cardCvv') {
      // Permitir apenas números no CVV
      formattedValue = value.replace(/\D/g, '');
      // Limitar ao tamanho máximo do CVV
      if (formattedValue.length > 4) {
        formattedValue = formattedValue.slice(0, 4);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
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

    // Validar dados pessoais
    if (!fullName.trim()) {
      newErrors.fullName = 'Nome é obrigatório';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      const cpfValue = cpf.replace(/\D/g, '');
      if (cpfValue.length !== 11) {
        newErrors.cpf = 'CPF inválido - deve ter 11 dígitos';
      }
    }

    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const phoneValue = phone.replace(/\D/g, '');
      if (phoneValue.length < 10 || phoneValue.length > 11) {
        newErrors.phone = 'Telefone inválido - deve ter 10 ou 11 dígitos com DDD';
      }
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    } else {
      const zipValue = zipCode.replace(/\D/g, '');
      if (zipValue.length !== 8) {
        newErrors.zipCode = 'CEP inválido - deve ter 8 dígitos';
      }
    }

    if (!addressNumber.trim()) {
      newErrors.addressNumber = 'Número do endereço é obrigatório';
    }

    // Validar dados do cartão
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Número do cartão é obrigatório';
    } else if (!validateCreditCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    if (!cardName.trim()) {
      newErrors.cardName = 'Nome no cartão é obrigatório';
    } else if (cardName.trim().length < 3) {
      newErrors.cardName = 'Nome no cartão deve ter pelo menos 3 caracteres';
    }

    if (!cardExpiryDate.trim()) {
      newErrors.cardExpiryDate = 'Data de expiração é obrigatória';
    } else if (cardExpiryDate.length < 5 || !cardExpiryDate.includes('/')) {
      newErrors.cardExpiryDate = 'Formato inválido - use MM/AA';
    } else {
      const [expiryMonth, expiryYear] = cardExpiryDate.split('/');
      if (!validateExpiryDate(expiryMonth, expiryYear)) {
        newErrors.cardExpiryDate = 'Data de expiração inválida';
      }
    }

    if (!cardCvv.trim()) {
      newErrors.cardCvv = 'CCV é obrigatório';
    } else if (!validateCCV(cardCvv)) {
      newErrors.cardCvv = 'CCV inválido - deve ter 3 ou 4 dígitos';
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aviso sobre o período de teste */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Período de teste gratuito</p>
              <p className="text-xs text-blue-700 mt-1">
                Você terá 7 dias de acesso gratuito antes da primeira cobrança. Cancele a qualquer momento durante este período sem custos.
              </p>
            </div>
          </div>
        </div>
        
        {/* Dados do titular */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
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
                placeholder="(00) 00000-0000"
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
                maxLength={10}
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive">{errors.zipCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressNumber">Número do endereço</Label>
              <Input
                id="addressNumber"
                value={formData.addressNumber}
                onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                placeholder="Número do endereço"
                className={errors.addressNumber ? 'border-destructive' : ''}
              />
              {errors.addressNumber && (
                <p className="text-sm text-destructive">{errors.addressNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Linha separadora */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/20"></span>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">Dados do cartão</span>
          </div>
        </div>

        {/* Dados do cartão */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className={`pl-10 ${errors.cardNumber ? 'border-destructive' : ''}`}
                  maxLength={19}
                />
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiryDate">Validade</Label>
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
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading} size="lg">
          {isLoading ? "Processando..." : "Assinar por R$ 10,00/mês"}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          Ao assinar, você concorda com nossos <a href="#" className="underline hover:text-primary">termos de serviço</a> e <a href="#" className="underline hover:text-primary">política de privacidade</a>
        </p>
      </form>
    </div>
  );
}
