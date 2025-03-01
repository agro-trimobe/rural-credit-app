'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Home as HomeIcon, Leaf } from 'lucide-react';
import Link from 'next/link';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center mb-2">
            <Leaf className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">Rural Credit</span>
          </Link>
          <p className="text-sm text-muted-foreground">Sistema de Crédito Rural</p>
        </div>
        
        <Card className="w-full shadow-lg border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-primary">Dashboard Rural Credit</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Bem-vindo ao sistema de Crédito Rural
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-3 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-muted-foreground">Informações do Usuário</h3>
              </div>
              <div className="pl-8 space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Nome:</span> {session?.user?.name || 'Não disponível'}</p>
                <p><span className="font-medium">Email:</span> {session?.user?.email || 'Não disponível'}</p>
              </div>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-3 mb-2">
                <HomeIcon className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-muted-foreground">Status do Sistema</h3>
              </div>
              <div className="pl-8 space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Autenticação:</span> <span className="text-primary">Ativa</span></p>
                <p><span className="font-medium">Versão:</span> 1.0.0</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogout} 
              className="w-full bg-primary hover:bg-primary-dark"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
