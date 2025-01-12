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
    return NextResponse.json(
      { error: error.message || "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
