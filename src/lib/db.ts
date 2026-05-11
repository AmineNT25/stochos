import { neon } from '@neondatabase/serverless';

function getDb() {
  // channel_binding=require is a TCP-level feature unsupported by the neon
  // serverless driver (HTTP/WebSocket). Strip it so production doesn't break.
  const url = (process.env.DATABASE_URL ?? '').replace(/[?&]channel_binding=[^&]*/g, (m) =>
    m.startsWith('?') ? '?' : ''
  ).replace(/\?$/, '');
  return neon(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: any = (strings: TemplateStringsArray, ...values: any[]) =>
  getDb()(strings, ...values);
