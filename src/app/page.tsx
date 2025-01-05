import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Rural Credit App</h1>
        <p className="text-lg text-gray-600">
          Bem-vindo ao sistema de crédito rural
        </p>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button size="lg">
              Acessar Sistema
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
