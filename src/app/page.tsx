import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Shield, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-green-50 to-green-100">
      {/* Cabeçalho */}
      <header className="w-full py-6 px-4 flex justify-center border-b bg-white/80 backdrop-blur-sm">
        <div className="container max-w-6xl flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-bold text-green-800">Rural Credit</h2>
          </div>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="container max-w-6xl px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Simplifique seu <span className="text-green-600">Crédito Rural</span>
              </h1>
              <p className="text-lg text-gray-600">
                Acesse nossa plataforma simplificada para gerenciar seu crédito rural de forma eficiente e segura.
              </p>
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Acessar Sistema
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-200">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Segurança Garantida</h3>
                    <p className="text-gray-600">Seus dados são protegidos com os mais altos padrões de segurança.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Processo Simplificado</h3>
                    <p className="text-gray-600">Acesso rápido e eficiente ao sistema de crédito rural.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="w-full py-6 bg-white border-t">
        <div className="container max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Rural Credit App. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
