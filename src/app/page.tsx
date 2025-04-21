'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Clock, 
  BarChart3, 
  Users, 
  FolderArchive, 
  CheckCircle,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Sparkles,
  Orbit
} from "lucide-react";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Cabeçalho */}
      <header className="w-full py-3 sm:py-4 px-3 sm:px-4 flex justify-center border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container max-w-7xl flex justify-between items-center">
          <div className="flex items-center">
            <Orbit className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold ml-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Trimobe</h2>
          </div>
          <Link href="/auth/login">
            <Button size="sm" className="font-medium bg-primary hover:bg-primary/90 text-xs sm:text-sm px-2 sm:px-4">
              {isMobile ? 'Acessar' : 'Acessar Sistema'}
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-0">
        {/* Hero Section */}
        <section className="w-full pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 relative overflow-hidden">
          {/* Fundo decorativo */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="container max-w-7xl px-4 mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              <div className="flex-1 max-w-3xl">
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Inteligência Artificial no Crédito Rural
                </Badge>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight mb-2 sm:mb-4">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Domine o Crédito Rural</span>
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-tight mb-3 sm:mb-5">
                  Elimine a complexidade, automatize tarefas e obtenha mais resultados
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-3xl">
                  Uma plataforma específica para projetos de crédito rural com inteligência artificial, que simplifica o MCR, automatiza documentos, otimiza a prospecção e centraliza informações para decisões estratégicas e ágeis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/login">
                    <Button size="lg" className="rounded-md px-8 bg-primary hover:bg-primary/90 transition-colors">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#demonstracao">
                    <Button variant="outline" size="lg" className="rounded-md px-8">
                      Ver demonstração
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center mt-8">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <div className="ml-4 text-sm text-muted-foreground">
                    <span className="font-medium">+125 profissionais</span> já utilizam nossa plataforma
                  </div>
                </div>
              </div>
              
              {/* Imagem apenas para desktop */}
              <div className={`flex-1 w-full max-w-xl rounded-xl bg-gradient-to-br from-primary/30 to-purple-600/30 p-1 shadow-xl ${isMobile ? 'hidden' : 'block'}`}>
                <div className="bg-card rounded-lg p-6 h-full">
                  <div className="aspect-[16/10] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <LayoutDashboard className="h-10 w-10 mx-auto mb-2 text-primary" />
                      <p>Imagem do Dashboard</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="w-full py-12 sm:py-16 lg:py-20 bg-background relative">
          <div className="absolute -top-10 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-purple-400/10 rounded-full blur-xl"></div>
          
          <div className="container max-w-7xl px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1">
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Problemas Resolvidos
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Elimine os principais desafios do <span className="text-primary">crédito rural</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Nossa plataforma foi desenvolvida para resolver os principais problemas enfrentados pelos profissionais do setor
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                    <Orbit className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mt-2">Complexidade do MCR</CardTitle>
                  <CardDescription className="text-muted-foreground min-h-[60px] sm:min-h-[80px]">
                    Não se preocupe com a complexidade do Manual de Crédito Rural. Nosso assistente inteligente está sempre disponível para esclarecer suas dúvidas e direcionar suas ações.
                  </CardDescription>
                  <div className="mt-4 sm:mt-6 rounded-lg bg-muted aspect-video flex items-center justify-center overflow-hidden border border-border/50">
                    <div className="text-center text-muted-foreground">
                      <Orbit className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm">GIF: Assistente inteligente MCR</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                    <FolderArchive className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mt-2">Tempo Gasto em Documentação</CardTitle>
                  <CardDescription className="text-muted-foreground min-h-[60px] sm:min-h-[80px]">
                    Deixe a análise de documentos conosco. Nosso assistente inteligente faz o trabalho pesado, permitindo que você economize tempo e evite erros.
                  </CardDescription>
                  <div className="mt-4 sm:mt-6 rounded-lg bg-muted aspect-video flex items-center justify-center overflow-hidden border border-border/50">
                    <div className="text-center text-muted-foreground">
                      <FolderArchive className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm">GIF: Automação de documentos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mt-2">Dificuldade em Prospecção</CardTitle>
                  <CardDescription className="text-muted-foreground min-h-[60px] sm:min-h-[80px]">
                    A prospecção de clientes nunca foi tão fácil. Nossa plataforma de CRM específica para o setor garante que você encontre e gerencie clientes de forma eficiente.
                  </CardDescription>
                  <div className="mt-4 sm:mt-6 rounded-lg bg-muted aspect-video flex items-center justify-center overflow-hidden border border-border/50">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm">GIF: Interface de clientes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mt-2">Desorganização de Informações</CardTitle>
                  <CardDescription className="text-muted-foreground min-h-[60px] sm:min-h-[80px]">
                    Diga adeus à desorganização. Nossa solução centraliza todas as informações, facilitando o acesso e a gestão.
                  </CardDescription>
                  <div className="mt-4 sm:mt-6 rounded-lg bg-muted aspect-video flex items-center justify-center overflow-hidden border border-border/50">
                    <div className="text-center text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm">GIF: Centralização de informações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mt-2">Falta de Visibilidade</CardTitle>
                  <CardDescription className="text-muted-foreground min-h-[60px] sm:min-h-[80px]">
                    Com nossos dashboards, você terá uma visão clara dos seus resultados, permitindo decisões informadas e estratégicas.
                  </CardDescription>
                  <div className="mt-4 sm:mt-6 rounded-lg bg-muted aspect-video flex items-center justify-center overflow-hidden border border-border/50">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm">GIF: Dashboard com métricas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center">
                    <CreditCard className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mt-2">Simulações de Crédito</CardTitle>
                  <CardDescription className="text-muted-foreground min-h-[60px] sm:min-h-[80px]">
                    Simule diferentes cenários de financiamento com facilidade e apresente as melhores opções para seus clientes com confiança.
                  </CardDescription>
                  <div className="mt-4 sm:mt-6 rounded-lg bg-muted aspect-video flex items-center justify-center overflow-hidden border border-border/50">
                    <div className="text-center text-muted-foreground">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm">GIF: Simulações de crédito</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Planos de Assinatura */}
        <section id="planos" className="w-full py-12 sm:py-16 lg:py-24 relative overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/5"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl"></div>
          
          <div className="container max-w-7xl px-4 mx-auto relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1 mx-auto">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Escolha seu plano
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Pronto para transformar sua <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">gestão de crédito rural</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                  Junte-se a centenas de profissionais que já estão economizando tempo e aumentando seus resultados com a plataforma Trimobe.
                </p>
              </div>
              
              {/* Cards de Planos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                {/* Plano Free Trial */}
                <div className="bg-card rounded-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">Free Trial</h3>
                    <div className="flex items-end">
                      <span className="text-3xl font-bold">Grátis</span>
                      <span className="text-muted-foreground ml-2 mb-1">/ 14 dias</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Experimente as funcionalidades básicas sem compromisso.</p>
                    
                    <ul className="space-y-2 py-4">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Gestão de clientes</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Gestão de oportunidades</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Simulações básicas</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-muted mr-2" />
                        <span className="text-sm text-muted-foreground">Funcionalidades avançadas</span>
                      </li>
                    </ul>
                    
                    <Link href="/auth/login" className="block w-full">
                      <Button variant="outline" className="w-full mt-2 border-primary/20 hover:border-primary/50 transition-all text-sm sm:text-base py-2">
                        Começar Trial
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Plano CRM */}
                <div className="bg-card rounded-xl border border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">CRM</h3>
                    <div className="flex items-end">
                      <span className="text-3xl font-bold">R$ 197</span>
                      <span className="text-muted-foreground ml-2 mb-1">/ mês</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Gerencie todo seu negócio de crédito rural.</p>
                    
                    <ul className="space-y-2 py-4">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Gestão completa de clientes</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Gestão de documentos</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Simulações avançadas</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Dashboard analítico</span>
                      </li>
                    </ul>
                    
                    <Link href="/auth/login" className="block w-full">
                      <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-sm sm:text-base py-2">
                        Assinar Agora
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Plano CRM + IA */}
                <div className="bg-gradient-to-br from-background to-primary/5 rounded-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">CRM + IA</h3>
                    <div className="flex items-end">
                      <span className="text-3xl font-bold">R$ 297</span>
                      <span className="text-muted-foreground ml-2 mb-1">/ mês</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Potencialize seu negócio com recursos de inteligência artificial.</p>
                    
                    <ul className="space-y-2 py-4">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Tudo do plano CRM</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Assistente MCR inteligente</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Análise automática de documentos</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">Previsões e recomendações</span>
                      </li>
                    </ul>
                    
                    <Link href="/auth/login" className="block w-full">
                      <Button variant="outline" className="w-full mt-2 border-primary hover:bg-primary/10 text-sm sm:text-base py-2">
                        Assinar Premium
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé simplificado */}
      <footer id="contato" className="w-full py-6 sm:py-8 bg-card border-t">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
            <div>
              &copy; {new Date().getFullYear()} Trimobe. Todos os direitos reservados.
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Termos
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Privacidade
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
