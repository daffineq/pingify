import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  user: {
    services: r.many.service({
      from: r.user.id,
      to: r.service.user_id
    }),
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.user_id
    })
  },
  service: {
    user: r.one.user({
      from: r.service.user_id,
      to: r.user.id
    }),
    checks: r.many.serviceCheck({
      from: r.service.id,
      to: r.serviceCheck.service_id
    })
  },
  serviceCheck: {
    service: r.one.service({
      from: r.serviceCheck.service_id,
      to: r.service.id
    })
  },
  session: {
    user: r.one.user({
      from: r.session.user_id,
      to: r.user.id
    })
  }
}));
