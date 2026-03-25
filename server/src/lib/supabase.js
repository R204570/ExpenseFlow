import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || '';
export const hasSupabaseStorage = Boolean(supabaseUrl && supabaseServiceKey && supabaseStorageBucket);

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials are not configured. Cloud storage features are disabled.');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder'
);

export default supabase;
