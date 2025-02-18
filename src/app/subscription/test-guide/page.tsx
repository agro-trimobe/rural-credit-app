import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TEST_CREDIT_CARDS, TEST_POSTAL_CODES } from '@/lib/asaas-test-data';

export default function TestGuidePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guia de Testes - Asaas Sandbox</CardTitle>
          <CardDescription>
            Use os dados abaixo para testar a integração com o Asaas no ambiente sandbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2">Cartões de Teste</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600">Cartão com Sucesso</h4>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(TEST_CREDIT_CARDS.SUCCESS, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600">Cartão com Falha</h4>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(TEST_CREDIT_CARDS.FAILURE, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-600">Cartão com Timeout</h4>
                <pre className="bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(TEST_CREDIT_CARDS.TIMEOUT, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">CEPs Válidos para Teste</h3>
            <ul className="list-disc list-inside">
              {TEST_POSTAL_CODES.map((cep) => (
                <li key={cep}>{cep}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Fluxo de Teste</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Crie um novo usuário na aplicação</li>
              <li>Aguarde o período de teste de 7 dias expirar (ou force a expiração no banco)</li>
              <li>Tente acessar qualquer página protegida</li>
              <li>Você será redirecionado para a página de assinatura</li>
              <li>Use um dos cartões de teste acima para simular diferentes cenários</li>
              <li>Após a assinatura, você terá acesso novamente às funcionalidades</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Testando Webhooks</h3>
            <p>Para testar os webhooks, você pode:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Usar um serviço como ngrok para expor sua URL local</li>
              <li>Configurar a URL do webhook no painel do Asaas Sandbox</li>
              <li>Realizar uma assinatura com sucesso</li>
              <li>Verificar os logs do webhook na sua aplicação</li>
              <li>Verificar se o status da assinatura foi atualizado no banco</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Verificando Status</h3>
            <p>Para verificar o status atual de uma assinatura:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Acesse o painel do Asaas Sandbox</li>
              <li>Localize a assinatura pelo ID salvo no banco</li>
              <li>Compare o status no Asaas com o status no seu banco</li>
            </ol>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
