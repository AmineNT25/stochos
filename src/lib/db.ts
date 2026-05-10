import { neon } from '@neondatabase/serverless';

// Lazy wrapper — defers neon() call to request time so the build
// doesn't fail when DATABASE_URL is absent from the build environment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: ReturnType<typeof neon> = ((...args: any[]) =>
  neon(process.env.DATABASE_URL!)(...args)
) as ReturnType<typeof neon>;
