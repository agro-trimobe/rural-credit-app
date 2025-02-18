'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PlanCardProps {
  onSubscribe: () => void;
}

export function PlanCard({ onSubscribe }: PlanCardProps) {
  return (
    <Card className="w-[380px] shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Plano Premium</CardTitle>
        <CardDescription className="text-xl">
          R$ 99,90<span className="text-sm">/mês</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>Acesso ilimitado ao sistema</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>Suporte prioritário</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>Análise de crédito avançada</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>Relatórios personalizados</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>Exportação de dados</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full text-lg py-6" 
          size="lg"
          onClick={onSubscribe}
        >
          Assinar Agora
        </Button>
      </CardFooter>
    </Card>
  );
}
