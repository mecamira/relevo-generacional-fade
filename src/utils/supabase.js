import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// True only when both env vars are set and non-placeholder
export const isSupabaseConfigured =
  !!(url && key && !url.includes('your-project') && url.startsWith('https://'))

export const supabase = isSupabaseConfigured ? createClient(url, key) : null

// ── Generic CRUD helpers ─────────────────────────────────────────────────────
// Each table stores records as: { id TEXT PK, data JSONB, created_at TIMESTAMPTZ }
// The `data` JSONB column contains the full JS object (including `id`).

export async function dbFetchAll(table) {
  const { data, error } = await supabase
    .from(table)
    .select('data')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(row => row.data)
}

export async function dbInsert(table, record) {
  const { error } = await supabase
    .from(table)
    .insert({ id: record.id, data: record })
  if (error) throw error
}

export async function dbUpdate(table, id, fullRecord) {
  const { error } = await supabase
    .from(table)
    .update({ data: fullRecord })
    .eq('id', id)
  if (error) throw error
}

export async function dbDelete(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
  if (error) throw error
}
