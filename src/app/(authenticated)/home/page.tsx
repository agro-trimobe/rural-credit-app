'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Home } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();
  
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você será redirecionado para a página inicial.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao realizar logout',
        description: 'Ocorreu um erro ao tentar sair do sistema.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center">Dashboard Rural Credit</CardTitle>
          <CardDescription className="text-center">
            Bem-vindo ao sistema de Crédito Rural
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Informações do Usuário</h3>
            </div>
            <div className="pl-8 space-y-1 text-sm">
              <p><span className="font-medium">Nome:</span> {session?.user?.name || 'Não disponível'}</p>
              <p><span className="font-medium">Email:</span> {session?.user?.email || 'Não disponível'}</p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Home className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Status do Sistema</h3>
            </div>
            <div className="pl-8 space-y-1 text-sm">
              <p><span className="font-medium">Autenticação:</span> <span className="text-green-600">Ativa</span></p>
              <p><span className="font-medium">Versão:</span> 1.0.0</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleLogout} 
            className="w-full"
            variant="outline"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
