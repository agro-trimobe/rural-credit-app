import { NextResponse } from "next/server";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';
import { createTenantAndUser } from "@/lib/tenant-utils";

function calculateSecretHash(username: string) {
  const message = username + process.env.COGNITO_CLIENT_ID;
  const hmac = crypto.createHmac('sha256', process.env.COGNITO_CLIENT_SECRET!);
  hmac.update(message);
  return hmac.digest('base64');
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS || "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS || "",
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // 1. Registrar no Cognito
    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      SecretHash: calculateSecretHash(email),
      UserAttributes: [
        {
          Name: "given_name",
          Value: name,
        },
        {
          Name: "email",
          Value: email,
        },
      ],
    });

    const cognitoResponse = await cognitoClient.send(command);
    const cognitoId = cognitoResponse.UserSub;

    if (!cognitoId) {
      throw new Error('Erro ao obter ID do usuário do Cognito');
    }

    // 2. Criar tenant e usuário no DynamoDB
    await createTenantAndUser(cognitoId, email, name);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no registro:", error);
    
    // Tratamento específico para usuário já existente
    if (error.__type === 'UsernameExistsException') {
      return NextResponse.json(
        { error: "Este email já está cadastrado. Por favor, use outro email ou faça login." },
        { status: 409 }
      );
    }

    // Tratamento para outros erros do Cognito
    if (error.__type) {
      let errorMessage = "Erro ao criar usuário";
      
      switch (error.__type) {
        case 'InvalidPasswordException':
          errorMessage = "A senha não atende aos requisitos mínimos de segurança";
          break;
        case 'InvalidParameterException':
          errorMessage = "Dados inválidos fornecidos";
          break;
        case 'CodeDeliveryFailureException':
          errorMessage = "Erro ao enviar código de verificação";
          break;
        default:
          errorMessage = "Erro ao criar usuário. Por favor, tente novamente.";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { error: "Erro interno do servidor. Por favor, tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
