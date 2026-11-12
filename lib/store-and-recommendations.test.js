import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockSupabaseClient } from './memory-store.js';

const client = createMockSupabaseClient();

test('supabase memory client supports .gte() and filters movies properly', async () => {
  const cutoff = new Date(Date.now() - 86400000 * 30).toISOString();
  const { data, error } = await client
    .from('movies')
    .select('*')
    .gte('created_at', cutoff);

  assert.equal(error, null);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('supabase memory client supports .in() and .eq() chained filters', async () => {
  const { data, error } = await client
    .from('movies')
    .select('id, title, genre')
    .eq('status', 'approved')
    .in('genre', ['Action', 'Thriller']);

  assert.equal(error, null);
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 2);
  data.forEach((item) => {
    assert.ok(['Action', 'Thriller'].includes(item.genre));
  });
});

test('supabase memory client supports count option without breaking', async () => {
  const { count, error } = await client
    .from('movies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  assert.equal(error, null);
  assert.ok(typeof count === 'number');
  assert.ok(count > 0);
});

test('supabase memory client supports .order() and .limit()', async () => {
  const { data, error } = await client
    .from('movies')
    .select('id, rating')
    .order('rating', { ascending: false })
    .limit(3);

  assert.equal(error, null);
  assert.equal(data.length, 3);
  assert.ok(parseFloat(data[0].rating) >= parseFloat(data[1].rating));
});
