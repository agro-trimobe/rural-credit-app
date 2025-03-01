"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, Leaf } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

// Componente de carregamento para o Suspense
function LoginPageLoading() {
  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-[400px] space-y-6">
        <div className="flex justify-center mb-6">
          <Leaf className="h-10 w-10 text-primary" />
        </div>
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Carregando...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente principal de login que usa hooks de cliente
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") || null
  );

  // Esquema de validação com Zod
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

  // Mapeamento de erros para mensagens amigáveis
  const errorMessages: Record<string, string> = {
    "CredentialsSignin": "Email ou senha incorretos",
    "UserNotConfirmedException": "Email não confirmado. Por favor, verifique seu email e confirme seu cadastro.",
    "NotAuthorizedException": "Email ou senha incorretos",
    "UserNotFoundException": "Usuário não encontrado",
    "TooManyRequestsException": "Muitas tentativas. Tente novamente mais tarde.",
    "InvalidParameterException": "Dados inválidos. Verifique as informações fornecidas.",
    "default": "Ocorreu um erro na autenticação. Tente novamente."
  };

  // Função para traduzir códigos de erro em mensagens amigáveis
  const getErrorMessage = (errorCode: string): string => {
    return errorMessages[errorCode] || errorMessages.default;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);
    
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
          setErrorMessage(data.message || "Erro ao solicitar redefinição de senha");
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
          callbackUrl: "/home"
        });

        if (result?.error) {
          console.error("Erro na autenticação:", result.error);
          const friendlyErrorMessage = getErrorMessage(result.error);
          setErrorMessage(friendlyErrorMessage);
          
          toast({
            title: "Erro na autenticação",
            description: friendlyErrorMessage,
            variant: "destructive",
          });
          
          // Se o erro for de email não confirmado, redirecionar para a página de confirmação
          if (result.error === "UserNotConfirmedException") {
            router.push(`/auth/confirm?email=${encodeURIComponent(values.email)}`);
          }
        } else if (result?.ok) {
          console.log("Login bem-sucedido, redirecionando para dashboard...");
          
          toast({
            title: "Login bem-sucedido",
            description: "Redirecionando para o dashboard...",
          });
          
          // Limpar qualquer erro anterior
          setErrorMessage(null);
          // Forçar redirecionamento com replace para evitar problemas de histórico
          window.location.href = "/home";
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
          const errorMsg = data.error || "Erro ao criar conta";
          setErrorMessage(errorMsg);
          
          toast({
            title: "Erro no cadastro",
            description: errorMsg,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      setErrorMessage("Ocorreu um erro inesperado. Tente novamente mais tarde.");
      
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
    <div className="container flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center mb-2">
            <Leaf className="h-10 w-10 text-primary mr-2" />
            <span className="text-2xl font-bold">Rural Credit</span>
          </Link>
          <p className="text-sm text-muted-foreground">Sistema de Crédito Rural</p>
        </div>
        
        <Card className="w-full shadow-lg">
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
                {errorMessage && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
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
                  className="w-full bg-primary hover:bg-primary-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Carregando..." : isForgotPassword ? "Enviar Email" : isLogin ? "Entrar" : "Cadastrar"}
                </Button>

                <div className="mt-4 text-center space-y-2">
                  {isLogin && !isForgotPassword && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrorMessage(null);
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
                      className="text-sm"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setErrorMessage(null);
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
                      className="text-sm"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrorMessage(null);
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
        
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-muted-foreground-dark">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente principal que envolve o conteúdo em um Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
