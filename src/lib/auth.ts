import { cookies } from 'next/headers';
import { getDatabase } from './db';
import { User, UserRole } from '../types';

const SESSION_COOKIE_NAME = 'gota_session_user_id';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.id === userId);
  return user || null;
}

export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    sameSite: 'lax',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<{ user: User | null; error?: string }> {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, error: 'Precisas de iniciar sessão para aceder a esta funcionalidade.' };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { user: null, error: 'A tua conta não tem permissão para aceder a esta área.' };
  }

  return { user };
}
