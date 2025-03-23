/**
 * Faz o upload de um arquivo para o servidor, que por sua vez fará o upload para o S3
 * @param file Arquivo a ser enviado (Blob, File ou string para blob URL)
 * @param options Opções de upload
 * @returns URL do arquivo no S3 e informações adicionais
 */
export async function uploadFile(
  file: Blob | File | string,
  options?: {
    fileName?: string;
    contentType?: string;
    tenantId?: string;
    tipoEntidade?: 'clientes' | 'projetos' | 'propriedades' | 'visitas';
    entidadeId?: string;
    tipoArquivo?: 'documentos' | 'fotos';
    arquivoId?: string;
  }
): Promise<{ url: string; id: string; path: string; extensao: string }> {
  try {
    // Converter blob URL para blob se for uma string que começa com 'blob:'
    let fileContent: Blob | File;
    
    if (typeof file === 'string') {
      if (file.startsWith('blob:')) {
        try {
          const response = await fetch(file);
          fileContent = await response.blob();
        } catch (error) {
          console.error('Erro ao converter blob URL para blob:', error);
          throw new Error('Falha ao processar o arquivo do blob URL');
        }
      } else {
        // Se for uma string mas não for um blob URL, criar um blob vazio
        fileContent = new Blob();
      }
    } else {
      // Se já for um Blob ou File
      fileContent = file;
    }

    // Criar um FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', fileContent);
    
    // Adicionar opções ao FormData se fornecidas
    if (options?.fileName) {
      formData.append('fileName', options.fileName);
    }
    
    if (options?.contentType) {
      formData.append('contentType', options.contentType);
    } else if (fileContent instanceof File) {
      formData.append('contentType', fileContent.type);
    }
    
    // Adicionar parâmetros para a estrutura de pastas hierárquica
    if (options?.tenantId) {
      formData.append('tenantId', options.tenantId);
    }
    
    if (options?.tipoEntidade) {
      formData.append('tipoEntidade', options.tipoEntidade);
    }
    
    if (options?.entidadeId) {
      formData.append('entidadeId', options.entidadeId);
    }
    
    if (options?.tipoArquivo) {
      formData.append('tipoArquivo', options.tipoArquivo);
    }
    
    if (options?.arquivoId) {
      formData.append('arquivoId', options.arquivoId);
    }
    
    // Enviar o arquivo para a API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao fazer upload: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw error;
  }
}

/**
 * Converte um blob URL para um blob
 * @param blobUrl URL do blob
 * @returns Blob
 */
export async function blobUrlToBlob(blobUrl: string): Promise<Blob> {
  try {
    const response = await fetch(blobUrl);
    return await response.blob();
  } catch (error) {
    console.error('Erro ao converter blob URL para blob:', error);
    throw new Error('Falha ao processar o arquivo do blob URL');
  }
}
