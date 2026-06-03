import { lt, sql } from 'drizzle-orm';
import { db, service, serviceCheck } from 'src/db';

class PingerModule {
  private activeTimers = new Map<string, Timer>();

  async addTimer(data: typeof service.$inferSelect) {
    if (this.activeTimers.has(data.id)) {
      clearInterval(this.activeTimers.get(data.id));
    }

    const timer = setInterval(
      async () => {
        const start = Date.now();
        const response = await fetch(data.url);
        const latency = Date.now() - start;

        await db.insert(serviceCheck).values({
          service_id: data.id,
          status: response.status,
          latency_ms: latency
        });

        await db.update(service).set({
          is_okay: response.ok,
          last_checked: new Date()
        });
      },
      data.interval_m * 60 * 1000
    );

    this.activeTimers.set(data.id, timer);
  }

  async removeTimer(id: string) {
    if (this.activeTimers.has(id)) {
      this.activeTimers.delete(id);
      clearInterval(this.activeTimers.get(id));
    }
  }

  async init() {
    const services = await db.select().from(service);

    for (const service of services) {
      this.addTimer(service);
    }

    setInterval(
      async () => {
        await db.delete(serviceCheck).where(lt(serviceCheck.created_at, sql`NOW() - INTERVAL '7 days'`));
      },
      30 * 60 * 1000
    );
  }
}

const Pinger = new PingerModule();

export { Pinger, PingerModule };
