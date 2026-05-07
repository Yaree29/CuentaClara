import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'SUPABASE_URL o SUPABASE_ANON_KEY no están configuradas. Revisa tu .env y app.config.js.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'cuentaclara',
    },
  },
});

const handleResult = ({ data, error }) => {
  if (error) {
    throw error;
  }
  return data;
};

export const select = async (
  table,
  { columns = '*', match, eq, order, limit, single } = {}
) => {
  let query = supabase.from(table).select(columns);

  if (match) {
    query = query.match(match);
  }

  if (eq) {
    Object.entries(eq).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (order?.column) {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  }

  if (limit) {
    query = query.limit(limit);
  }

  if (single) {
    query = query.single();
  }

  return handleResult(await query);
};

export const insert = async (
  table,
  values,
  { select: selectColumns = '*' } = {}
) => {
  let query = supabase.from(table).insert(values);

  if (selectColumns) {
    query = query.select(selectColumns);
  }

  return handleResult(await query);
};

export const update = async (
  table,
  values,
  match,
  { select: selectColumns = '*' } = {}
) => {
  if (!match || Object.keys(match).length === 0) {
    throw new Error('update requiere un objeto match para evitar actualizaciones masivas.');
  }

  let query = supabase.from(table).update(values).match(match);

  if (selectColumns) {
    query = query.select(selectColumns);
  }

  return handleResult(await query);
};

export const upsert = async (
  table,
  values,
  { onConflict, select: selectColumns = '*' } = {}
) => {
  let query = supabase.from(table).upsert(values, { onConflict });

  if (selectColumns) {
    query = query.select(selectColumns);
  }

  return handleResult(await query);
};

export const remove = async (table, match, { select: selectColumns = '*' } = {}) => {
  if (!match || Object.keys(match).length === 0) {
    throw new Error('remove requiere un objeto match para evitar eliminaciones masivas.');
  }

  let query = supabase.from(table).delete().match(match);

  if (selectColumns) {
    query = query.select(selectColumns);
  }

  return handleResult(await query);
};

export const rpc = async (fnName, params) => {
  return handleResult(await supabase.rpc(fnName, params));
};
