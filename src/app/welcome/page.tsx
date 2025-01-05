"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseJwt } from "@/lib/jwt";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Usuário");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (session?.user?.name) {
      const decodedToken = parseJwt(session.user.name);
      if (decodedToken?.given_name) {
        setUserName(decodedToken.given_name);
      }
    }
  }, [status, router, session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
      <h1 className="text-3xl font-bold">
        Olá, {userName}
      </h1>
      <Button 
        onClick={handleLogout}
        variant="outline"
        className="mt-4"
      >
        Sair
      </Button>
    </div>
  );
}