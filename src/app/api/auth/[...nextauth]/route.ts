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
  const message = username + process.env.COGNITO_CLIENT_ID;
  const hmac = crypto.createHmac('sha256', process.env.COGNITO_CLIENT_SECRET!);
  hmac.update(message);
  return hmac.digest('base64');
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
          throw new Error('Email e senha são obrigatórios');
        }

        try {
          console.log('Iniciando autenticação com Cognito para:', credentials.email);
          console.log('Configuração Cognito - Região:', process.env.COGNITO_REGION);
          console.log('Configuração Cognito - Client ID:', process.env.COGNITO_CLIENT_ID ? 'Configurado' : 'Não configurado');
          console.log('Configuração Cognito - User Pool ID:', process.env.COGNITO_USER_POOL_ID ? 'Configurado' : 'Não configurado');
          console.log('Configuração AWS - Access Key:', process.env.ACCESS_KEY_ID_AWS ? 'Configurado' : 'Não configurado');
          console.log('Configuração AWS - Secret Key:', process.env.SECRET_ACCESS_KEY_AWS ? 'Configurado' : 'Não configurado');
          
          const cognitoClient = new CognitoIdentityProviderClient({
            region: process.env.COGNITO_REGION,
            credentials: {
              accessKeyId: process.env.ACCESS_KEY_ID_AWS || "",
              secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS || "",
            },
          });

          const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.COGNITO_CLIENT_ID!,
            AuthParameters: {
              USERNAME: credentials.email,
              PASSWORD: credentials.password,
              SECRET_HASH: calculateSecretHash(credentials.email),
            },
          });

          try {
            console.log('Enviando comando de autenticação para Cognito');
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

            return {
              id: decoded.sub,
              name: decoded.given_name || credentials.email,
              email: decoded.email,
              tenantId: user.tenantId,
              cognitoId: decoded.sub
            };
          } catch (cognitoError: any) {
            console.error('Erro Cognito:', cognitoError);
            console.error('Detalhes do erro Cognito:', {
              name: cognitoError.name,
              message: cognitoError.message,
              code: cognitoError.$metadata?.httpStatusCode,
              requestId: cognitoError.$metadata?.requestId
            });
            
            if (cognitoError.name === 'NotAuthorizedException') {
              throw new Error('Email ou senha incorretos');
            }
            if (cognitoError.name === 'UserNotConfirmedException') {
              throw new Error('Email não confirmado. Por favor, verifique seu email e confirme seu cadastro.');
            }
            throw new Error(cognitoError.message || 'Erro na autenticação');
          }
        } catch (error: any) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      }
    }),
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`
    })
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  debug: process.env.NODE_ENV !== 'production',
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
  // Configuração de cookies para garantir compatibilidade entre ambientes
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.tenantId = user.tenantId;
        token.cognitoId = user.cognitoId;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.tenantId = token.tenantId as string;
        session.user.cognitoId = token.cognitoId as string;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
