import NextAuth from 'next-auth';
import Cognito from 'next-auth/providers/cognito';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getUserByEmail } from '@/lib/tenant-utils';

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    cognitoId: string;
  }
}

function calculateSecretHash(username: string) {
  try {
    console.log('Calculando secret hash para:', username);
    if (!process.env.COGNITO_CLIENT_SECRET) {
      throw new Error('COGNITO_CLIENT_SECRET não está definido');
    }
    
    const hash = crypto
      .createHmac('SHA256', process.env.COGNITO_CLIENT_SECRET)
      .update(username + process.env.COGNITO_CLIENT_ID)
      .digest('base64');
    
    console.log('Secret hash calculado com sucesso');
    return hash;
  } catch (error: unknown) {
    console.error('Erro ao calcular secret hash:', error);
    
    // Tratamento seguro para o erro com verificação de tipo
    if (error instanceof Error) {
      throw new Error('Erro ao calcular secret hash: ' + error.message);
    } else {
      throw new Error('Erro desconhecido ao calcular secret hash');
    }
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Email e senha são obrigatórios');
          throw new Error('Email e senha são obrigatórios');
        }

        try {
          console.log('Iniciando autenticação com Cognito para:', credentials.email);
          console.log('Configuração Cognito - Região:', process.env.COGNITO_REGION);
          console.log('Configuração Cognito - Client ID:', process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado');
          
          // Verificar se as variáveis de ambiente necessárias estão configuradas
          if (!process.env.COGNITO_REGION || !process.env.COGNITO_CLIENT_ID || !process.env.COGNITO_CLIENT_SECRET) {
            console.error('Variáveis de ambiente do Cognito não estão configuradas corretamente');
            console.error('COGNITO_REGION:', process.env.COGNITO_REGION ? 'Configurado' : 'Não configurado');
            console.error('COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado');
            console.error('COGNITO_CLIENT_SECRET:', process.env.COGNITO_CLIENT_SECRET ? 'Configurado' : 'Não configurado');
            throw new Error('Configuração do Cognito incompleta');
          }
          
          // Inicializar cliente Cognito
          console.log('Inicializando cliente Cognito...');
          
          // Verificar se as credenciais AWS estão configuradas
          if (!process.env.ACCESS_KEY_ID_AWS || !process.env.SECRET_ACCESS_KEY_AWS) {
            console.error('Credenciais AWS não estão configuradas corretamente');
            console.error('ACCESS_KEY_ID_AWS:', process.env.ACCESS_KEY_ID_AWS ? 'Configurado' : 'Não configurado');
            console.error('SECRET_ACCESS_KEY_AWS:', process.env.SECRET_ACCESS_KEY_AWS ? 'Configurado' : 'Não configurado');
            throw new Error('Credenciais AWS incompletas');
          }
          
          const cognitoClient = new CognitoIdentityProviderClient({
            region: process.env.COGNITO_REGION,
            credentials: {
              accessKeyId: process.env.ACCESS_KEY_ID_AWS,
              secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS
            }
          });
          console.log('Cliente Cognito inicializado com sucesso');

          const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.COGNITO_CLIENT_ID!,
            AuthParameters: {
              USERNAME: credentials.email,
              PASSWORD: credentials.password,
              SECRET_HASH: calculateSecretHash(credentials.email),
            },
          });

          console.log('Comando de autenticação configurado');
          console.log('Parâmetros de autenticação:', {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado',
            USERNAME: credentials.email,
            SECRET_HASH: 'Calculado'
          });

          try {
            console.log('Enviando comando de autenticação para Cognito...');
            const response = await cognitoClient.send(command);
            console.log('Resposta recebida do Cognito:', response.AuthenticationResult ? 'Autenticação bem-sucedida' : 'Sem resultado de autenticação');
            const idToken = response.AuthenticationResult?.IdToken;
            
            if (!idToken) {
              console.error('Token não encontrado na resposta');
              return null;
            }

            console.log('Decodificando token JWT');
            const decoded = jwt.decode(idToken) as { sub: string; email: string; given_name: string };
            
            if (!decoded) {
              console.error('Erro ao decodificar o token');
              return null;
            }

            // Buscar informações do usuário no DynamoDB
            console.log('Buscando usuário no DynamoDB pelo email:', decoded.email);
            const user = await getUserByEmail(decoded.email);
            
            if (!user) {
              console.error('Usuário não encontrado no DynamoDB');
              return null;
            }
            
            console.log('Usuário encontrado no DynamoDB, tenantId:', user.tenantId);
            console.log('Autenticação concluída com sucesso para:', decoded.email);

            return {
              id: decoded.sub,
              name: decoded.given_name || credentials.email,
              email: decoded.email,
              tenantId: user.tenantId,
              cognitoId: decoded.sub
            };
          } catch (cognitoError: unknown) {
            console.error('Erro Cognito:', cognitoError);
            
            // Tratamento seguro para o erro com verificação de tipo
            const errorDetails: Record<string, unknown> = {};
            
            if (cognitoError && typeof cognitoError === 'object') {
              if ('name' in cognitoError && cognitoError.name) {
                errorDetails.name = cognitoError.name;
              }
              
              if ('message' in cognitoError && cognitoError.message) {
                errorDetails.message = cognitoError.message;
              }
              
              // Verificar se é um erro específico do AWS SDK
              if ('$metadata' in cognitoError) {
                const metadata = cognitoError.$metadata as Record<string, unknown>;
                errorDetails.code = metadata.httpStatusCode;
                errorDetails.requestId = metadata.requestId;
              }
              
              // Verificar se é um erro do Cognito
              if ('__type' in cognitoError && cognitoError.__type) {
                errorDetails.type = cognitoError.__type;
              }
            }
            
            console.error('Detalhes do erro Cognito:', errorDetails);
            
            if (cognitoError && typeof cognitoError === 'object' && 'name' in cognitoError) {
              if (cognitoError.name === 'NotAuthorizedException') {
                console.error('Erro de autorização: Email ou senha incorretos');
                throw new Error('Email ou senha incorretos');
              }
              if (cognitoError.name === 'UserNotConfirmedException') {
                console.error('Erro: Email não confirmado');
                throw new Error('Email não confirmado. Por favor, verifique seu email e confirme seu cadastro.');
              }
            }
            
            if (cognitoError && typeof cognitoError === 'object' && 'message' in cognitoError && cognitoError.message) {
              console.error('Erro não tratado do Cognito:', cognitoError.message);
              throw new Error(cognitoError.message as string);
            } else {
              throw new Error('Erro na autenticação');
            }
          }
        } catch (error: unknown) {
          console.error('Erro na autenticação:', error);
          
          // Tratamento seguro para o erro com verificação de tipo
          const errorDetails: Record<string, unknown> = {};
          
          if (error && typeof error === 'object') {
            if ('name' in error && error.name) {
              errorDetails.name = error.name;
            }
            
            if ('message' in error && error.message) {
              errorDetails.message = error.message;
            }
            
            if ('stack' in error && error.stack) {
              errorDetails.stack = error.stack;
            }
          }
          
          console.error('Detalhes do erro:', errorDetails);
          
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error('Erro desconhecido na autenticação');
          }
        }
      }
    }),
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`
    })
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Configuração de cookies para garantir compatibilidade entre ambientes
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', { code, metadata });
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', { code, metadata });
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      console.log('Callback JWT executado', { hasUser: !!user });
      if (user) {
        console.log('Dados do usuário disponíveis para JWT:', { 
          id: user.id, 
          email: user.email,
          tenantId: user.tenantId,
          cognitoId: user.cognitoId
        });
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.tenantId = user.tenantId;
        token.cognitoId = user.cognitoId;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log('Callback Session executado', { hasToken: !!token });
      if (token) {
        (session as CustomSession).user.id = token.id as string;
        (session as CustomSession).user.tenantId = token.tenantId as string;
        (session as CustomSession).user.cognitoId = token.cognitoId as string;
        console.log('Sessão criada com sucesso para usuário:', token.email);
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
