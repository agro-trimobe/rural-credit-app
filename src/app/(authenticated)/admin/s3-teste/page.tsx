'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function S3TestePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para executar o diagnóstico do S3
  const executarDiagnostico = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/aws/s3-diagnostico');
      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
      setResultado({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao executar o diagnóstico',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para fazer upload de arquivo diretamente para o S3
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Selecione um arquivo primeiro');
      return;
    }

    setUploadStatus('loading');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
      formData.append('contentType', selectedFile.type);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus('success');
        setUploadResult(data);
      } else {
        setUploadStatus('error');
        setUploadResult(data);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadStatus('error');
      setUploadResult({
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Função para lidar com a seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus('idle');
      setUploadResult(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Upload para S3</h1>
      
      <Tabs defaultValue="diagnostico">
        <TabsList className="mb-4">
          <TabsTrigger value="diagnostico">Diagnóstico S3</TabsTrigger>
          <TabsTrigger value="upload">Teste de Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnostico">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico de Conexão com S3</CardTitle>
              <CardDescription>
                Execute o diagnóstico para verificar a conexão com o S3 e as permissões do bucket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={executarDiagnostico} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando diagnóstico...
                  </>
                ) : 'Executar Diagnóstico'}
              </Button>
              
              {resultado && (
                <div className="mt-6">
                  <Alert variant={resultado.status === 'sucesso' ? 'default' : 'destructive'}>
                    <div className="flex items-center">
                      {resultado.status === 'sucesso' ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      <AlertTitle>{resultado.status === 'sucesso' ? 'Sucesso' : 'Erro'}</AlertTitle>
                    </div>
                    <AlertDescription>{resultado.mensagem}</AlertDescription>
                  </Alert>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Configuração</h3>
                    <pre className="bg-slate-100 p-4 rounded-md text-sm">
                      {JSON.stringify(resultado.configuracao, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Resultados dos Testes</h3>
                    {Object.entries(resultado.testes).map(([key, value]: [string, any]) => (
                      <div key={key} className="mb-4">
                        <div className="flex items-center">
                          {value.sucesso ? (
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                          )}
                          <h4 className="font-medium">{key}</h4>
                        </div>
                        <div className="ml-6 mt-1">
                          {value.sucesso ? (
                            <p className="text-sm text-green-600">{value.mensagem}</p>
                          ) : (
                            <p className="text-sm text-red-600">{value.erro}</p>
                          )}
                          {value.url && (
                            <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              Abrir arquivo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {resultado.recomendacoes && resultado.recomendacoes.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Recomendações</h3>
                      <ul className="list-disc pl-5">
                        {resultado.recomendacoes.map((recomendacao: string, index: number) => (
                          <li key={index} className="text-sm mb-1">{recomendacao}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Upload para S3</CardTitle>
              <CardDescription>
                Faça upload de um arquivo diretamente para o S3 para testar a funcionalidade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-muted-foreground">({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!selectedFile || uploadStatus === 'loading'}
                >
                  {uploadStatus === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : 'Fazer Upload'}
                </Button>
              </div>
              
              {uploadStatus !== 'idle' && (
                <div className="mt-6">
                  <Alert variant={uploadStatus === 'success' ? 'default' : 'destructive'}>
                    <div className="flex items-center">
                      {uploadStatus === 'success' ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : uploadStatus === 'error' ? (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      ) : null}
                      <AlertTitle>
                        {uploadStatus === 'success' ? 'Upload concluído' : 
                         uploadStatus === 'error' ? 'Erro no upload' : 
                         'Enviando arquivo...'}
                      </AlertTitle>
                    </div>
                    <AlertDescription>
                      {uploadStatus === 'success' ? 'O arquivo foi enviado com sucesso para o S3.' : 
                       uploadStatus === 'error' ? `Erro: ${uploadResult?.error || 'Falha no upload'}` : 
                       'Enviando arquivo para o S3...'}
                    </AlertDescription>
                  </Alert>
                  
                  {uploadStatus === 'success' && uploadResult && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Detalhes do Upload</h3>
                      <pre className="bg-slate-100 p-4 rounded-md text-sm">
                        {JSON.stringify(uploadResult, null, 2)}
                      </pre>
                      
                      {uploadResult.url && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">URL do Arquivo</h4>
                          <a 
                            href={uploadResult.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {uploadResult.url}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
