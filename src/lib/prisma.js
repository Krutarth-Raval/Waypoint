import { PrismaClient as PrismaClientNode } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global;

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10000, // Reduced to kill stale connections faster
    connectionTimeoutMillis: 30000, 
    allowExitOnIdle: true,
  })

  pool.on('error', (err) => {
    console.warn('Pg pool error (background):', err.message)
    delete globalForPrisma.__wp_prisma
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClientNode({ adapter })
}

// Global auto-retry wrapper for Prisma to handle Neon cold starts / stale connections
export const prisma = new Proxy({}, {
  get(_, prop) {
    if (!globalForPrisma.__wp_prisma) {
      globalForPrisma.__wp_prisma = createPrismaClient()
    }
    
    const target = globalForPrisma.__wp_prisma[prop];
    
    // If accessing a model (e.g. prisma.user)
    if (typeof target === 'object' && target !== null && !prop.startsWith('$')) {
      return new Proxy(target, {
        get(modelTarget, modelProp) {
          const method = modelTarget[modelProp];
          
          // If calling a method (e.g. prisma.user.findUnique)
          if (typeof method === 'function') {
            return async (...args) => {
              for (let attempt = 0; attempt < 2; attempt++) {
                try {
                  return await method.apply(modelTarget, args);
                } catch (err) {
                  // Only retry on connection drops/timeouts
                  if (attempt === 0 && (err.code === 'ETIMEDOUT' || err.message.includes('Connection') || err.message.includes('timeout'))) {
                    console.warn(`Prisma query failed (${err.message}). Auto-reconnecting and retrying...`);
                    // Nuke the dead pool
                    delete globalForPrisma.__wp_prisma;
                    // Create a fresh pool
                    globalForPrisma.__wp_prisma = createPrismaClient();
                    // Re-run the query on the fresh pool
                    return await globalForPrisma.__wp_prisma[prop][modelProp].apply(globalForPrisma.__wp_prisma[prop], args);
                  }
                  throw err;
                }
              }
            };
          }
          return method;
        }
      });
    }
    
    return target;
  }
})
