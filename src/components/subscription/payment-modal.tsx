'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/components/subscription/payment-form";
import { CreditCard, Lock } from "lucide-react";

interface PaymentModalProps {
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

export function PaymentModal({ onSubmit, isLoading }: PaymentModalProps) {
  const [open, setOpen] = useState(false);
  
  const handleSubmit = async (data: PaymentFormData) => {
    await onSubmit(data);
    // Não feche o modal automaticamente em caso de erro
    // O modal será fechado no caso de sucesso pelo componente pai
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <CreditCard className="mr-2 h-4 w-4" />
          Assinar agora por R$ 1,00/semana
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Finalizar Assinatura</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para completar sua assinatura do Rural Credit App.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <PaymentForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Lock className="h-3 w-3 mr-1" /> 
            Seus dados são protegidos com criptografia de ponta a ponta
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
