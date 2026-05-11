import { neon } from '@neondatabase/serverless';

function getDb() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set');

  // channel_binding=require is TCP-only — unsupported by neon serverless (HTTP/WS).
  const url = raw
    .replace(/&channel_binding=[^&]*/g, '')
    .replace(/\?channel_binding=[^&]*&/, '?')
    .replace(/\?channel_binding=[^&]*$/, '');

  return neon(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: any = (strings: TemplateStringsArray, ...values: any[]) =>
  getDb()(strings, ...values);
