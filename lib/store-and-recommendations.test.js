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

test('supabase memory client scopes .update().eq() and .update().in() strictly to matched rows', async () => {
  const { data: before } = await client.from('movies').select('id, featured');
  const firstId = before[0].id;
  const secondId = before[1].id;
  const originalFirst = Boolean(before[0].featured);
  const originalSecond = Boolean(before[1].featured);

  const { data: updatedSingle, error: singleErr } = await client
    .from('movies')
    .update({ featured: !originalFirst })
    .eq('id', firstId)
    .select()
    .single();

  assert.equal(singleErr, null);
  assert.equal(updatedSingle.id, firstId);
  assert.equal(updatedSingle.featured, !originalFirst);

  const { data: afterSingle } = await client.from('movies').select('id, featured');
  const afterSecond = afterSingle.find((m) => m.id === secondId);
  assert.equal(Boolean(afterSecond.featured), originalSecond);

  // Bulk .in() update affects only target ids
  const thirdId = before[2].id;
  const originalThird = Boolean(before[2].featured);
  await client.from('movies').update({ featured: originalFirst }).in('id', [firstId, secondId]);

  const { data: afterIn } = await client.from('movies').select('id, featured');
  assert.equal(Boolean(afterIn.find((m) => m.id === thirdId).featured), originalThird);

  // Restore secondId
  await client.from('movies').update({ featured: originalSecond }).eq('id', secondId);
});

test('supabase memory client scopes .delete().eq() strictly to the targeted row', async () => {
  const { data: initialList } = await client.from('coming_soon').select('id');
  const initialCount = initialList.length;

  const { data: inserted, error: insErr } = await client
    .from('coming_soon')
    .insert({ title: 'Temp Release Check', genre: 'Action', releaseDate: '2026-12-01' })
    .select()
    .single();

  assert.equal(insErr, null);
  assert.ok(inserted.id);

  const { error: delErr } = await client
    .from('coming_soon')
    .delete()
    .eq('id', inserted.id);

  assert.equal(delErr, null);

  const { data: afterList } = await client.from('coming_soon').select('id');
  assert.equal(afterList.length, initialCount);
  assert.equal(afterList.some((item) => item.id === inserted.id), false);
});

test('supabase memory client supports .upsert() on user_watchlists and newsletter_subscribers inserts', async () => {
  const { data: created, error: createErr } = await client
    .from('user_watchlists')
    .upsert({ user_id: 'user-upsert-1', items: [{ id: 'm1', title: 'Movie 1' }] }, { onConflict: 'user_id' })
    .select()
    .single();

  assert.equal(createErr, null);
  assert.equal(created.user_id, 'user-upsert-1');
  assert.equal(created.items.length, 1);

  const { data: updated, error: updateErr } = await client
    .from('user_watchlists')
    .upsert({ user_id: 'user-upsert-1', items: [{ id: 'm1', title: 'Movie 1' }, { id: 'm2', title: 'Movie 2' }] }, { onConflict: 'user_id' })
    .select()
    .single();

  assert.equal(updateErr, null);
  assert.equal(updated.items.length, 2);

  const { data: allWatchlists } = await client.from('user_watchlists').select('*').eq('user_id', 'user-upsert-1');
  assert.equal(allWatchlists.length, 1);

  const { data: sub, error: subErr } = await client
    .from('newsletter_subscribers')
    .insert([{ email: 'test-sub@agasobanuye.rw', source: 'homepage', language: 'en', status: 'active' }])
    .select()
    .single();

  assert.equal(subErr, null);
  assert.equal(sub.email, 'test-sub@agasobanuye.rw');
});

