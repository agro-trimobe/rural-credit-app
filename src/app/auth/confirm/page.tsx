"use client";

import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Efeito para verificar o email e redirecionar se necessário
  useEffect(() => {
    if (!email) {
      console.log('Email não encontrado nos parâmetros');
      toast({
        title: "Erro",
        description: "Email não fornecido. Por favor, faça o registro novamente.",
        variant: "destructive",
      });
      router.replace('/auth/login');
      return;
    }
    console.log('Email encontrado:', email);
  }, [email, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email confirmado!",
          description: "Por favor, faça login para continuar.",
          duration: 5000,
        });
        router.replace("/auth/login");
      } else {
        setError(data.error || "Erro ao confirmar código");
        toast({
          title: "Erro",
          description: data.error || "Erro ao confirmar código",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro na confirmação:", error);
      setError("Erro ao confirmar código");
      toast({
        title: "Erro",
        description: "Erro ao confirmar código",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se não houver email, não renderiza o conteúdo
  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Confirmar Email</CardTitle>
          <CardDescription>
            Digite o código de confirmação enviado para {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="code"
                placeholder="Digite o código de confirmação"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Confirmando..." : "Confirmar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConfirmForm />
    </Suspense>
  );
}