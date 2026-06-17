import { hash, verify } from 'argon2';
import { eq } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { db, session, user } from 'src/db';
import { createErrorResponse, createSuccessResponse } from 'src/utils/response';
import { addSession, getBySession } from './auth';
import { ConflictError, UnauthorizedError, NotFoundError } from 'src/utils/errors';

export const authRoute = () => {
  return (app: Elysia) =>
    app.group('api/auth', { tags: ['Auth'] }, (app) =>
      app
        .post(
          'sign-up',
          async ({ body, cookie: { session } }) => {
            const [existing] = await db.select().from(user).where(eq(user.name, body.name));

            if (existing) {
              throw new ConflictError('Username is already taken');
            }

            const [created] = await db
              .insert(user)
              .values({
                name: body.name,
                password: await hash(body.password)
              })
              .returning();

            if (!created) {
              return createErrorResponse({
                error: { message: 'Failed to create user account' }
              });
            }

            const token = await addSession(created.id);

            session?.set({
              value: token,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60,
              path: '/'
            });

            return createSuccessResponse({
              message: 'Created new account successfully',
              data: token
            });
          },
          {
            body: t.Object({
              name: t.String(),
              password: t.String()
            }),
            detail: {
              summary: 'Register a new account',
              description:
                'Create a new user account with username and password. Returns a session token for immediate authentication.'
            }
          }
        )
        .post(
          'sign-in',
          async ({ body, cookie: { session } }) => {
            const [existing] = await db.select().from(user).where(eq(user.name, body.name));

            if (!existing || !(await verify(existing.password, body.password))) {
              throw new UnauthorizedError('Invalid username or password');
            }

            const token = await addSession(existing.id);

            session?.set({
              value: token,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60,
              path: '/'
            });

            return createSuccessResponse({
              message: 'Authenticated successfully',
              data: token
            });
          },
          {
            body: t.Object({
              name: t.String(),
              password: t.String()
            }),
            detail: {
              summary: 'Sign into an existing account',
              description:
                'Authenticate with an existing username and password. Returns a session token for authenticated requests.'
            }
          }
        )
        .post(
          'logout',
          async ({ cookie: { session } }) => {
            session?.remove();

            return createSuccessResponse({
              message: 'Logged out'
            });
          },
          {
            detail: {
              summary: 'Log out from current session',
              description:
                'Invalidate the current session cookie. User will be redirected to login on next request.'
            }
          }
        )
        .post(
          'logout-all',
          async ({ cookie: { session: s } }) => {
            const raw = await getBySession(s.value);

            if (!raw) {
              throw new NotFoundError('No user found');
            }

            await db.delete(session).where(eq(session.user_id, raw.id));

            return createSuccessResponse({
              message: 'Logged all devices out'
            });
          },
          {
            cookie: t.Object({
              session: t.String()
            }),
            detail: {
              summary: 'Log out from all sessions',
              description: 'Invalidate all session tokens for the current user. All devices will be logged out.'
            }
          }
        )
        .put(
          'password',
          async ({ body, cookie: { session } }) => {
            const raw = await getBySession(session?.value);

            if (!raw) {
              throw new NotFoundError('No user found');
            }

            if (raw && (await verify(raw.password, body.old))) {
              await db.update(user).set({ password: await hash(body.new) });

              return createSuccessResponse({
                message: 'Updated the password'
              });
            }

            throw new UnauthorizedError('Wrong old password');
          },
          {
            body: t.Object({
              old: t.String(),
              new: t.String()
            }),
            cookie: t.Object({
              session: t.String()
            }),
            detail: {
              summary: 'Change account password',
              description: 'Update your account password. Requires the old password for verification.'
            }
          }
        )
    );
};
