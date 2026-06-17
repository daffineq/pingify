import { createId } from '@paralleldrive/cuid2';
import { createHash } from 'crypto';
import { and, eq, gt, sql } from 'drizzle-orm';
import { db, session, user } from 'src/db';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function addSession(id: string) {
  const token = createId();

  await db.insert(session).values({
    user_id: id,
    token: hashToken(token),
    active_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return token;
}

export async function getBySession(cookie?: string | null) {
  if (!cookie) return null;

  const hashed = hashToken(cookie);

  const [result] = await db
    .select({ user })
    .from(session)
    .innerJoin(user, eq(user.id, session.user_id))
    .where(and(eq(session.token, hashed), gt(session.active_until, sql`NOW()`)));

  return result?.user;
}
