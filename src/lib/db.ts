import { neon } from '@neondatabase/serverless';

// Lazy: defer neon() to request time so the build doesn't crash
// when DATABASE_URL is unavailable during module import.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: any = (strings: TemplateStringsArray, ...values: any[]) =>
  neon(process.env.DATABASE_URL!)(strings, ...values);
