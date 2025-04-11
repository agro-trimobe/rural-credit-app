import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, BookOpen, Clock, BarChart3, Users, FolderArchive } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Cabeçalho */}
      <header className="w-full py-4 px-4 flex justify-center border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary p-1.5 rounded-md">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold ml-2">Trimobe</h2>
          </div>
          <Link href="/auth/login">
            <Button variant="outline" size="sm" className="font-medium">
              Acessar Sistema
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full flex flex-col items-center">
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
          <div className="container max-w-7xl px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
                Domine o Crédito Rural: Elimine a Complexidade, Automatize Tarefas e Obtenha Mais Resultados
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Uma plataforma específica para projetos de crédito rural com inteligência artificial, que simplifica o MCR, automatiza documentos, otimiza a prospecção e centraliza informações para decisões estratégicas e ágeis.
              </p>
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button size="lg" className="rounded-full px-8">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="w-full py-16 bg-background">
          <div className="container max-w-7xl px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Complexidade do MCR</h3>
                  <p className="text-muted-foreground">
                    Não se preocupe com a complexidade do Manual de Crédito Rural. Nosso assistente inteligente está sempre disponível para esclarecer suas dúvidas e direcionar suas ações.
                  </p>
                  <div className="mt-4 rounded-lg bg-secondary/30 aspect-video flex items-center justify-center overflow-hidden">
                    {/* Placeholder para GIF demonstrativo */}
                    <div className="text-muted-foreground text-sm">GIF: Assistente inteligente esclarecendo dúvidas sobre o MCR</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <FolderArchive className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Tempo Gasto em Documentação</h3>
                  <p className="text-muted-foreground">
                    Deixe a análise de documentos conosco. Nosso assistente inteligente faz o trabalho pesado, permitindo que você economize tempo e evite erros.
                  </p>
                  <div className="mt-4 rounded-lg bg-secondary/30 aspect-video flex items-center justify-center overflow-hidden">
                    {/* Placeholder para GIF demonstrativo */}
                    <div className="text-muted-foreground text-sm">GIF: Automação de análise de documentos</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Dificuldade em Prospecção</h3>
                  <p className="text-muted-foreground">
                    A prospecção de clientes nunca foi tão fácil. Nossa plataforma de CRM específica para o setor garante que você encontre e gerencie clientes de forma eficiente.
                  </p>
                  <div className="mt-4 rounded-lg bg-secondary/30 aspect-video flex items-center justify-center overflow-hidden">
                    {/* Placeholder para GIF demonstrativo */}
                    <div className="text-muted-foreground text-sm">GIF: Interface de gerenciamento de clientes</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Desorganização de Informações</h3>
                  <p className="text-muted-foreground">
                    Diga adeus à desorganização. Nossa solução centraliza todas as informações, facilitando o acesso e a gestão.
                  </p>
                  <div className="mt-4 rounded-lg bg-secondary/30 aspect-video flex items-center justify-center overflow-hidden">
                    {/* Placeholder para GIF demonstrativo */}
                    <div className="text-muted-foreground text-sm">GIF: Centralização de informações e documentos</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Falta de Visibilidade em Resultados</h3>
                  <p className="text-muted-foreground">
                    Com nossos dashboards, você terá uma visão clara dos seus resultados, permitindo decisões informadas e estratégicas.
                  </p>
                  <div className="mt-4 rounded-lg bg-secondary/30 aspect-video flex items-center justify-center overflow-hidden">
                    {/* Placeholder para GIF demonstrativo */}
                    <div className="text-muted-foreground text-sm">GIF: Dashboard com métricas e resultados</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 bg-primary/5">
          <div className="container max-w-7xl px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Pronto para transformar sua gestão de crédito rural?
              </h2>
              <p className="text-lg text-muted-foreground">
                Junte-se a centenas de profissionais que já estão economizando tempo e aumentando seus resultados com o Trimobe.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Agendar Demonstração
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="w-full py-8 bg-card border-t">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-primary p-1.5 rounded-md">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold ml-2">Trimobe</h2>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </Link>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Trimobe. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
