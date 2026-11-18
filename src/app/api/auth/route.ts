import { NextResponse } from 'next/server';
import { getCurrentUser, setSession, clearSession } from '../../../lib/auth';
import { getDatabase } from '../../../lib/db';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, role, name, phone } = body;

    const db = getDatabase();

    // 1. Alternância rápida de utilizador de demonstração
    if (userId) {
      const existingUser = db.users.find((u) => u.id === userId);
      if (existingUser) {
        await setSession(existingUser.id);
        return NextResponse.json({ success: true, user: existingUser });
      }
    }

    // 2. Login por email ou criação simples de conta de cidadão
    if (email) {
      let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        // Criar novo utilizador cidadão
        user = {
          id: `usr_${Date.now()}`,
          name: name || 'Cidadão',
          email,
          phone: phone || '',
          role: role || 'cidadao',
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }

      await setSession(user.id);
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Dados de identificação não fornecidos.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao processar autenticação.' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
