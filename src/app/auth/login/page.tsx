"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const formSchema = z.object({
    name: isLogin ? z.string().optional() : z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: isForgotPassword ? z.string().optional() : z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: isLogin || isForgotPassword
      ? z.string().optional() 
      : z.string().min(1, "Confirmação de senha é obrigatória"),
  }).refine(data => {
    if (!isLogin && !isForgotPassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  }, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      if (isForgotPassword) {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Email enviado",
            description: "Verifique seu email para redefinir sua senha",
          });
          router.push(`/auth/reset-password?email=${encodeURIComponent(values.email)}`);
        } else {
          toast({
            title: "Erro",
            description: data.message || "Erro ao solicitar redefinição de senha",
            variant: "destructive",
          });
        }
      } else if (isLogin) {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl: "/dashboard"
        });

        if (result?.error) {
          toast({
            title: "Erro na autenticação",
            description: "Email ou senha incorretos",
            variant: "destructive",
          });
        } else if (result?.ok) {
          console.log("Login bem-sucedido, redirecionando para dashboard...");
          // Forçar redirecionamento com replace para evitar problemas de histórico
          window.location.href = "/dashboard";
        }
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Registro bem-sucedido:', data);
          
          toast({
            title: "Cadastro realizado",
            description: data.message || "Por favor, verifique seu email e insira o código de confirmação",
          });
          
          if (data.requiresConfirmation) {
            const confirmUrl = `/auth/confirm?email=${encodeURIComponent(values.email)}`;
            console.log('Redirecionando para:', confirmUrl);
            
            // Usando replace em vez de push para garantir que o histórico seja limpo
            router.replace(confirmUrl);
          } else {
            console.log('Registro não requer confirmação');
          }
        } else {
          toast({
            title: "Erro no cadastro",
            description: data.error || "Erro ao criar conta",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isForgotPassword ? "Recuperar Senha" : isLogin ? "Login" : "Criar Conta"}
            </CardTitle>
            <CardDescription className="text-center">
              {isForgotPassword
                ? "Digite seu email para receber as instruções de recuperação de senha"
                : isLogin
                ? "Entre com seu email e senha"
                : "Preencha os dados para criar sua conta"}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-4">
                {!isLogin && !isForgotPassword && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isForgotPassword && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Digite sua senha"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isLogin && !isForgotPassword && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirme sua senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>

              <CardFooter className="flex flex-col">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Carregando..." : isForgotPassword ? "Enviar Email" : isLogin ? "Entrar" : "Cadastrar"}
                </Button>

                <div className="mt-4 text-center space-y-2">
                  {isLogin && !isForgotPassword && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-primary hover:text-primary/90"
                      onClick={() => {
                        setIsForgotPassword(true);
                        form.reset({ email: form.getValues("email") });
                      }}
                    >
                      Esqueci minha senha
                    </Button>
                  )}

                  {isForgotPassword && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-primary hover:text-primary/90"
                      onClick={() => {
                        setIsForgotPassword(false);
                        form.reset({ email: form.getValues("email") });
                      }}
                    >
                      Voltar ao login
                    </Button>
                  )}

                  {!isForgotPassword && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-primary hover:text-primary/90"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        form.reset();
                      }}
                    >
                      {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
