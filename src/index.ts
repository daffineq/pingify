import 'reflect-metadata';

import Elysia, { file, NotFoundError, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import { db } from './db';
import { sql } from 'drizzle-orm';
import staticPlugin from '@elysiajs/static';
import { createErrorResponse, createSuccessResponse } from './utils/response';
import { authRoute, Pinger, routes } from './core';
import { HttpError } from './utils/errors';
import { getBySession } from './core/auth';

const app = new Elysia()
  .use(
    cors({
      origin: (process.env.CORS ?? '').split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false
    })
  )
  .use(staticPlugin())
  .use(
    swagger({
      path: '/docs',
      specPath: '/docs/openapi',
      documentation: {
        info: {
          title: 'Pingify API',
          description: 'Public documentation for the Pingify API.',
          version: '1.0.0'
        },
        servers: [
          {
            url: process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
            description: 'Production server'
          }
        ],
        tags: [
          {
            name: 'API',
            description: 'API endpoints'
          },
          {
            name: 'System',
            description: 'System endpoints'
          },
          {
            name: 'Auth',
            description: 'Auth endpoints'
          }
        ]
      }
    })
  )
  .onError(({ error, set }) => {
    if (error instanceof NotFoundError) {
      set.status = 404;
      return createErrorResponse({
        error: {
          status: 404,
          message: 'Route not found',
          details: `Docs: ${process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3000}`}/docs`
        }
      });
    }

    if (error instanceof HttpError) {
      set.status = error.status;
      return createErrorResponse({
        error: { status: error.status, message: error.message, details: error.details }
      });
    }

    if (error instanceof Error) {
      set.status = 500;
      return createErrorResponse({
        error: { status: 500, message: error.message, details: error.stack }
      });
    }

    set.status = 500;
    return createErrorResponse({ error: { status: 500, message: 'Unknown error' } });
  });

app.use(authRoute());
app.use(routes());

app.get(
  '/',
  async ({ cookie: { session } }) => {
    const user = await getBySession(session.value);

    if (!user) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/auth' }
      });
    }

    return file('public/dashboard.html');
  },
  {
    detail: {
      summary: 'Dashboard',
      description: 'The user dashboard'
    },
    cookie: t.Object({
      session: t.Optional(t.String())
    })
  }
);

app.get(
  '/auth',
  async ({ cookie: { session } }) => {
    const user = await getBySession(session.value);

    if (user) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/' }
      });
    }

    return file('public/auth.html');
  },
  {
    detail: {
      summary: 'Auth',
      description: 'The auth page'
    },
    cookie: t.Object({
      session: t.Optional(t.String())
    })
  }
);

app.get(
  '/service-form',
  async ({ cookie: { session } }) => {
    const user = await getBySession(session.value);

    if (!user) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/auth' }
      });
    }

    return file('public/service-form.html');
  },
  {
    detail: {
      summary: 'Service Form',
      description: 'Add or edit a service'
    },
    cookie: t.Object({
      session: t.Optional(t.String())
    })
  }
);

app.get(
  '/service-detail',
  async ({ cookie: { session } }) => {
    const user = await getBySession(session.value);

    if (!user) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/auth' }
      });
    }

    return file('public/service-detail.html');
  },
  {
    detail: {
      summary: 'Service Detail',
      description: 'Service uptime and check history'
    },
    cookie: t.Object({
      session: t.Optional(t.String())
    })
  }
);

app.get(
  '/state',
  async () => {
    const uptime = (): string => {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    const size = (await db.execute(sql`SELECT pg_size_pretty(pg_database_size(current_database())) AS size;`)) as {
      size: string;
    }[];

    const memory = process.memoryUsage();

    const dbHealthy = await db.execute(sql`SELECT 1`);

    return createSuccessResponse({
      message: 'State of API',
      data: {
        uptime: uptime(),
        db: {
          size: size[0]?.size,
          healthy: dbHealthy ? true : false
        },
        memory: {
          rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
          heap_total: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heap_used: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
        }
      }
    });
  },
  {
    tags: ['System'],
    detail: {
      summary: 'State',
      description: 'Returns system state'
    }
  }
);

app.get(
  '/health',
  async () => {
    await db.execute(sql`SELECT 1`);

    return createSuccessResponse({
      message: 'Service is healthy',
      data: { status: 'UP' }
    });
  },
  {
    tags: ['System'],
    detail: {
      summary: 'Health Check',
      description: 'Returns the health status of the application and its dependencies'
    }
  }
);

app.listen({ port: process.env.PORT ?? 3000 });

console.log(
  `Server listening on port ${process.env.PORT ?? 3000}, at ${process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3000}`}`
);

await Pinger.init();
