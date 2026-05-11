import { neon } from '@neondatabase/serverless';

function getDb() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set');

  // Remove BOM (U+FEFF) and channel_binding (TCP-only, unsupported by neon serverless)
  let url = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
  url = url
    .replace(/&channel_binding=[^&]*/g, '')
    .replace(/\?channel_binding=[^&]*&/, '?')
    .replace(/\?channel_binding=[^&]*$/, '');

  return neon(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: any = (strings: TemplateStringsArray, ...values: any[]) =>
  getDb()(strings, ...values);
