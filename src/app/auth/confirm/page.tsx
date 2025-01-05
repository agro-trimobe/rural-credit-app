"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        alert("Email confirmado com sucesso! Por favor, faça login.");
        router.push("/auth/login");
      } else {
        setError(data.error || "Erro ao confirmar código");
      }
    } catch (error) {
      console.error("Erro na confirmação:", error);
      setError("Erro ao confirmar código");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
              <label className="text-sm font-medium">Código de Confirmação</label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
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