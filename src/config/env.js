import Constants from 'expo-constants';

const expoConfig = Constants.expoConfig ?? Constants.manifest ?? {};
const extra = expoConfig.extra ?? {};

export const API_URL = process.env.API_URL ?? extra.API_URL ?? '';
export const SUPABASE_URL = process.env.SUPABASE_URL ?? extra.SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? extra.SUPABASE_ANON_KEY ?? '';

export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
