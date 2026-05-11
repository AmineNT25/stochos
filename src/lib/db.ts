import { neon } from '@neondatabase/serverless';

function getDb() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set');

  const url = raw
    .replace(/^﻿/, '')                    // strip BOM if copy-pasted from some editors
    .replace(/&channel_binding=[^&]*/g, '')    // strip TCP-only param unsupported by neon serverless
    .replace(/\?channel_binding=[^&]*&/, '?')
    .replace(/\?channel_binding=[^&]*$/, '');

  return neon(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql: any = (strings: TemplateStringsArray, ...values: any[]) =>
  getDb()(strings, ...values);
