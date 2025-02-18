"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
        router.push("/auth/login");
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Confirmar Email</CardTitle>
          <CardDescription>
            Digite o código de confirmação enviado para seu email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="code"
                placeholder="0/2d8b"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Confirmar
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
      <ConfirmPageContent />
    </Suspense>
  );
}