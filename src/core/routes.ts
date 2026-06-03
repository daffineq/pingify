import Elysia, { t } from 'elysia';
import { getBySession } from './auth';
import { db, service } from 'src/db';
import { createSuccessResponse } from 'src/utils/response';
import { and, eq } from 'drizzle-orm';
import { Pinger } from './pinger';
import { NotFoundError } from 'src/utils/errors';

const routes = () => {
  return (app: Elysia) =>
    app.group('api', { tags: ['API'] }, (app) =>
      app
        .get(
          'user',
          async ({ cookie: { session } }) => {
            const raw = await getBySession(session?.value);

            if (!raw) {
              throw new NotFoundError('No user found');
            }

            const data = await db.query.user.findFirst({
              where: {
                id: raw.id
              },
              with: {
                services: true
              }
            });

            return createSuccessResponse({
              message: 'User Info',
              data
            });
          },
          {
            cookie: t.Object({
              session: t.String()
            })
          }
        )
        .get(
          'service/:id',
          async ({ params, cookie: { session } }) => {
            const raw = await getBySession(session?.value);

            if (!raw) {
              throw new NotFoundError('No user found');
            }

            const data = await db.query.service.findFirst({
              where: {
                id: params.id,
                user_id: raw.id
              },
              with: {
                checks: true
              }
            });

            return createSuccessResponse({
              message: 'Service Info',
              data
            });
          },
          {
            params: t.Object({
              id: t.String()
            }),
            cookie: t.Object({
              session: t.String()
            })
          }
        )
        .post(
          'service',
          async ({ body, cookie: { session } }) => {
            const raw = await getBySession(session?.value);

            if (!raw) {
              throw new NotFoundError('No user found');
            }

            const [returned] = await db
              .insert(service)
              .values({
                user_id: raw.id,
                name: body.name,
                url: body.url,
                interval_m: body.interval_m
              })
              .returning();

            if (returned) {
              Pinger.addTimer(returned);
            }

            return createSuccessResponse({
              message: 'Added a new service'
            });
          },
          {
            body: t.Object({
              name: t.Optional(t.String()),
              url: t.String(),
              interval_m: t.Number()
            }),
            cookie: t.Object({
              session: t.String()
            })
          }
        )
        .put(
          'service/:id',
          async ({ params, body, cookie: { session } }) => {
            const raw = await getBySession(session?.value);

            if (!raw) {
              throw new NotFoundError('No user found');
            }

            const [returned] = await db
              .update(service)
              .set({
                name: body.name,
                url: body.url,
                interval_m: body.interval_m
              })
              .where(and(eq(service.id, params.id), eq(service.user_id, raw.id)))
              .returning();

            if (returned) {
              Pinger.addTimer(returned);
            }

            return createSuccessResponse({
              message: 'Edited a service'
            });
          },
          {
            params: t.Object({
              id: t.String()
            }),
            body: t.Object({
              name: t.Optional(t.String()),
              url: t.String(),
              interval_m: t.Number()
            }),
            cookie: t.Object({
              session: t.String()
            })
          }
        )
        .delete(
          'service/:id',
          async ({ params, cookie: { session } }) => {
            const raw = await getBySession(session?.value);

            if (!raw) {
              throw new NotFoundError('No user found');
            }

            const [returned] = await db
              .delete(service)
              .where(and(eq(service.id, params.id), eq(service.user_id, raw.id)))
              .returning();

            if (returned) {
              Pinger.removeTimer(returned.id);
            }

            return createSuccessResponse({
              message: 'Deleted a service'
            });
          },
          {
            params: t.Object({
              id: t.String()
            }),
            cookie: t.Object({
              session: t.String()
            })
          }
        )
    );
};

export { routes };
