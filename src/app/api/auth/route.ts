import { NextResponse } from 'next/server';
import { getCurrentUser, setSession, clearSession, hashPassword } from '../../../lib/auth';
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

    // 2. Login por email (com senha obrigatória para empresa/admin)
    if (email) {
      const { password } = body;
      let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        // Utilizadores institucionais requerem senha
        if (user.role === 'empresa' || user.role === 'admin') {
          if (!password) {
            return NextResponse.json({ error: 'Senha obrigatória para acesso institucional.' }, { status: 401 });
          }
          if (!user.passwordHash || hashPassword(password) !== user.passwordHash) {
            return NextResponse.json({ error: 'Senha incorrecta. Tente novamente.' }, { status: 401 });
          }
        }
        // Cidadao: sem senha necessaria
      } else {
        // Novo utilizador: apenas cidadao pode ser criado por este fluxo
        user = {
          id: `usr_${Date.now()}`,
          name: name || 'Cidadao',
          email,
          phone: phone || '',
          role: 'cidadao',
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
