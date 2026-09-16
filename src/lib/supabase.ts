import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Both variables set → production: real sign-in, data in Postgres.
 * Either missing → demo: role picker, mock data, everything in this browser.
 * The public GitHub Pages build sets neither, so it stays a demo.
 */
export const supabase = url && key ? createClient(url, key) : null;
export const isDemo = supabase === null;
