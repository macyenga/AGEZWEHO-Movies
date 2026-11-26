import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import CATEGORIES from '../../lib/categories';
import { PREMIUM_CONTENT_TYPES } from '../../lib/premium-content';

const GENRES = ['Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Adventure', 'Fantasy', 'Sci-Fi', 'Romance'];
const TYPES = ['Movie', 'Series', 'Anime', 'Documentary', 'Short Film'];
const NEWS_CATEGORIES = ['Amakuru', 'Entertainment', 'Tech & AI', 'Sports', 'Reviews'];
const SHOP_CATEGORIES = ['Gaming', 'Subscriptions', 'Electronics', 'Accessories', 'Services', 'Other'];
const GAME_TYPES = PREMIUM_CONTENT_TYPES;
const GAME_CATEGORIES = ['Action', 'Sports', 'Entertainment', 'Education', 'Courses', 'Tutorials', 'Technology', ...CATEGORIES.filter((c) => !['Action', 'Sports', 'Entertainment', 'Education', 'Courses', 'Tutorials', 'Technology'].includes(c))];

function FieldLabel({ htmlFor, label, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text2)' }}>
      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
    </label>
  );
}

function FormShell({ title, onCancel, onSubmit, loading, submitLabel = 'Save', children }) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-5 rounded-xl space-y-4 mb-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border2)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--gold2)' }}>{title}</h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label={`Close ${title}`}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-ghost)]"
          style={{ color: 'var(--muted)' }}
        >
          <X size={15} />
        </button>
      </div>
      {children}
      <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost px-4 py-2 rounded-lg text-xs font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function ComingSoonForm({ initial = null, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    releaseDate: initial?.releaseDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    type: initial?.type || 'Movie',
    genre: initial?.genre || 'Action',
    language: initial?.language || 'Kinyarwanda',
    interpreter: initial?.interpreter || 'Rocky Kimomo',
    poster_url: initial?.poster_url || '',
    trailer_url: initial?.trailer_url || '',
    overview: initial?.overview || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <FormShell
      title={initial ? 'Edit Upcoming Release' : 'Schedule Upcoming Release'}
      onCancel={onCancel}
      loading={loading}
      submitLabel={initial ? 'Update Release' : 'Add to Coming Soon'}
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.releaseDate) return;
        onSave(form);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="cs-title" label="Title" required />
          <input id="cs-title" required className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. KGF Chapter 3" />
        </div>
        <div>
          <FieldLabel htmlFor="cs-date" label="Release Date" required />
          <input id="cs-date" type="date" required className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.releaseDate} onChange={(e) => set('releaseDate', e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="cs-type" label="Format" />
          <select id="cs-type" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.type} onChange={(e) => set('type', e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="cs-genre" label="Genre" />
          <select id="cs-genre" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.genre} onChange={(e) => set('genre', e.target.value)}>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="cs-interpreter" label="Interpreter / Studio" />
          <input id="cs-interpreter" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.interpreter} onChange={(e) => set('interpreter', e.target.value)} placeholder="Rocky Kimomo" />
        </div>
        <div>
          <FieldLabel htmlFor="cs-lang" label="Language" />
          <input id="cs-lang" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.language} onChange={(e) => set('language', e.target.value)} placeholder="Kinyarwanda" />
        </div>
        <div>
          <FieldLabel htmlFor="cs-poster" label="Poster URL" />
          <input id="cs-poster" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.poster_url} onChange={(e) => set('poster_url', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <FieldLabel htmlFor="cs-trailer" label="YouTube Trailer URL" />
          <input id="cs-trailer" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.trailer_url} onChange={(e) => set('trailer_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="cs-overview" label="Synopsis / Notes" />
        <textarea id="cs-overview" rows={2} className="input-dark w-full px-3 py-2 rounded-lg text-xs resize-none"
          value={form.overview} onChange={(e) => set('overview', e.target.value)} placeholder="Upcoming plot preview..." />
      </div>
    </FormShell>
  );
}

export function GameForm({ initial = null, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    type: initial?.type || 'Video',
    category: initial?.category || 'Entertainment',
    version: initial?.version || '1.0',
    rating: initial?.rating || '4.8',
    cover_url: initial?.cover_url || '',
    video_url: initial?.video_url || '',
    overview: initial?.overview || '',
    premium: initial ? Boolean(initial.premium) : true,
    price: initial?.price ?? 500,
    uploader_momo_number: initial?.uploader_momo_number || '',
    status: initial?.status || 'approved',
    download_url: initial?.links?.[0]?.url || '',
    download_label: initial?.links?.[0]?.label || 'Download File',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <FormShell
      title={initial ? 'Edit Private Video / Premium Item' : 'Add Private Video / Premium Item'}
      onCancel={onCancel}
      loading={loading}
      submitLabel={initial ? 'Update Item' : 'Create Item'}
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        const remainingLinks = Array.isArray(initial?.links) ? initial.links.slice(1) : [];
        const links = form.download_url.trim()
          ? [{ label: form.download_label.trim() || 'Download', url: form.download_url.trim() }, ...remainingLinks]
          : remainingLinks;
        onSave({
          title: form.title.trim(),
          type: form.type,
          category: form.category,
          version: form.version,
          rating: form.rating,
          cover_url: form.cover_url.trim(),
          video_url: form.video_url.trim(),
          overview: form.overview,
          premium: form.premium,
          price: form.premium ? Number(form.price) || 0 : 0,
          uploader_momo_number: form.uploader_momo_number.trim(),
          status: form.status,
          links,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="game-title" label="Title" required />
          <input id="game-title" required className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. VIP Dubbing Masterclass" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="game-type" label="Type" />
            <select id="game-type" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.type} onChange={(e) => set('type', e.target.value)}>
              {GAME_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="game-cat" label="Category" />
            <select id="game-cat" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.category} onChange={(e) => set('category', e.target.value)}>
              {GAME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="game-ver" label="Version / Quality" />
            <input id="game-ver" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.version} onChange={(e) => set('version', e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="game-status" label="Status" />
            <select id="game-status" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 items-end">
          <label className="flex items-center gap-2 py-2 cursor-pointer text-xs" style={{ color: 'var(--text)' }}>
            <input type="checkbox" checked={form.premium} onChange={(e) => set('premium', e.target.checked)} className="w-4 h-4 accent-amber-400" />
            Paid Unlock (RWF)
          </label>
          <div>
            <FieldLabel htmlFor="game-price" label="Price (RWF)" />
            <input id="game-price" type="number" min="0" disabled={!form.premium}
              className="input-dark w-full px-3 py-2 rounded-lg text-xs disabled:opacity-40 tabular-nums"
              value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="game-video" label="Private Video Stream URL (.mp4, YouTube, Vimeo, Google Drive)" />
          <input id="game-video" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.video_url} onChange={(e) => set('video_url', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <FieldLabel htmlFor="game-cover" label="Cover Image URL" />
          <input id="game-cover" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.cover_url} onChange={(e) => set('cover_url', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <FieldLabel htmlFor="game-momo" label="Uploader MoMo Number" />
          <input id="game-momo" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.uploader_momo_number} onChange={(e) => set('uploader_momo_number', e.target.value)} placeholder="078..." />
        </div>
        <div>
          <FieldLabel htmlFor="game-dl-label" label="Download Label" />
          <input id="game-dl-label" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.download_label} onChange={(e) => set('download_label', e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="game-dl-url" label="Download URL (Optional)" />
          <input id="game-dl-url" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.download_url} onChange={(e) => set('download_url', e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="game-overview" label="Description" />
        <textarea id="game-overview" rows={2} className="input-dark w-full px-3 py-2 rounded-lg text-xs resize-none"
          value={form.overview} onChange={(e) => set('overview', e.target.value)} />
      </div>
    </FormShell>
  );
}

export function RequestForm({ initial = null, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    requested_by: initial?.requested_by || '',
    year: initial?.year || '',
    language: initial?.language || 'Kinyarwanda',
    donation_goal: initial?.donation_goal ?? 5000,
    votes: initial?.votes ?? 1,
    note: initial?.note || '',
    fulfilled: Boolean(initial?.fulfilled),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <FormShell
      title={initial ? 'Edit Movie Request' : 'Create Movie Request'}
      onCancel={onCancel}
      loading={loading}
      submitLabel={initial ? 'Update Request' : 'Create Request'}
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="req-title" label="Requested Movie Title" required />
          <input id="req-title" required className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Salaar Part 2" />
        </div>
        <div>
          <FieldLabel htmlFor="req-by" label="Requested By" />
          <input id="req-by" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.requested_by} onChange={(e) => set('requested_by', e.target.value)} placeholder="Viewer name" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="req-goal" label="Goal (RWF)" />
            <input id="req-goal" type="number" min="0" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.donation_goal} onChange={(e) => set('donation_goal', e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="req-votes" label="Votes" />
            <input id="req-votes" type="number" min="0" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.votes} onChange={(e) => set('votes', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 items-end">
          <div>
            <FieldLabel htmlFor="req-lang" label="Language" />
            <input id="req-lang" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.language} onChange={(e) => set('language', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 py-2 cursor-pointer text-xs" style={{ color: 'var(--text)' }}>
            <input type="checkbox" checked={form.fulfilled} onChange={(e) => set('fulfilled', e.target.checked)} className="w-4 h-4 accent-emerald-400" />
            Fulfilled
          </label>
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="req-note" label="Note" />
        <textarea id="req-note" rows={2} className="input-dark w-full px-3 py-2 rounded-lg text-xs resize-none"
          value={form.note} onChange={(e) => set('note', e.target.value)} />
      </div>
    </FormShell>
  );
}

export function NewsForm({ initial = null, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    category: initial?.category || 'Amakuru',
    author_name: initial?.author_name || 'Agasobanuye.rw News',
    image_url: initial?.image_url || '',
    publisher_momo: initial?.publisher_momo || '',
    status: initial?.status || 'approved',
    content: initial?.content || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <FormShell
      title={initial ? 'Edit News Article' : 'Publish News Article'}
      onCancel={onCancel}
      loading={loading}
      submitLabel={initial ? 'Update Article' : 'Publish Article'}
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="news-title" label="Headline" required />
          <input id="news-title" required className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="news-author" label="Author" />
          <input id="news-author" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.author_name} onChange={(e) => set('author_name', e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="news-cat" label="Category" />
          <select id="news-cat" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.category} onChange={(e) => set('category', e.target.value)}>
            {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="news-status" label="Status" />
          <select id="news-status" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="news-img" label="Cover Image URL" />
          <input id="news-img" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <FieldLabel htmlFor="news-momo" label="Publisher MoMo (Tips)" />
          <input id="news-momo" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.publisher_momo} onChange={(e) => set('publisher_momo', e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="news-body" label="Article Content" />
        <textarea id="news-body" rows={3} className="input-dark w-full px-3 py-2 rounded-lg text-xs resize-none"
          value={form.content} onChange={(e) => set('content', e.target.value)} />
      </div>
    </FormShell>
  );
}

export function ShopForm({ initial = null, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    price: initial?.price || '',
    currency: initial?.currency || 'RWF',
    category: initial?.category || 'Gaming',
    seller_name: initial?.seller_name || 'Agasobanuye.rw Store',
    seller_whatsapp: initial?.seller_whatsapp || '+250789690247',
    image_url: initial?.image_url || '',
    status: initial?.status || 'active',
    description: initial?.description || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <FormShell
      title={initial ? 'Edit Shop Listing' : 'Add Shop Listing'}
      onCancel={onCancel}
      loading={loading}
      submitLabel={initial ? 'Update Listing' : 'Create Listing'}
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="shop-title" label="Product Title" required />
          <input id="shop-title" required className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="shop-price" label="Price" />
            <input id="shop-price" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="15,000" />
          </div>
          <div>
            <FieldLabel htmlFor="shop-currency" label="Currency" />
            <input id="shop-currency" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.currency} onChange={(e) => set('currency', e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="shop-cat" label="Category" />
          <select id="shop-cat" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.category} onChange={(e) => set('category', e.target.value)}>
            {SHOP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="shop-status" label="Status" />
          <select id="shop-status" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="shop-seller" label="Seller Name" />
          <input id="shop-seller" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.seller_name} onChange={(e) => set('seller_name', e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="shop-wa" label="Seller WhatsApp" />
          <input id="shop-wa" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.seller_whatsapp} onChange={(e) => set('seller_whatsapp', e.target.value)} />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="shop-img" label="Image URL" />
        <input id="shop-img" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
          value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <FieldLabel htmlFor="shop-desc" label="Description" />
        <textarea id="shop-desc" rows={2} className="input-dark w-full px-3 py-2 rounded-lg text-xs resize-none"
          value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
    </FormShell>
  );
}

export function ManualDonationForm({ requests = [], onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    donor_name: '',
    amount: '2000',
    phone_last4: '',
    request_id: '',
    confirmed: true,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <FormShell
      title="Record Manual Donation"
      onCancel={onCancel}
      loading={loading}
      submitLabel="Save Donation"
      onSubmit={(e) => {
        e.preventDefault();
        if (!Number(form.amount)) return;
        onSave(form);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="don-name" label="Donor Name" />
          <input id="don-name" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.donor_name} onChange={(e) => set('donor_name', e.target.value)} placeholder="e.g. Jean Claude" />
        </div>
        <div>
          <FieldLabel htmlFor="don-amount" label="Amount (RWF)" required />
          <input id="don-amount" type="number" min="1" required className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="don-phone" label="Phone Last 4 Digits" />
          <input id="don-phone" maxLength={4} className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.phone_last4} onChange={(e) => set('phone_last4', e.target.value)} placeholder="1234" />
        </div>
        <div>
          <FieldLabel htmlFor="don-req" label="Linked Movie Request" />
          <select id="don-req" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.request_id} onChange={(e) => set('request_id', e.target.value)}>
            <option value="">General Support</option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--text)' }}>
        <input type="checkbox" checked={form.confirmed} onChange={(e) => set('confirmed', e.target.checked)} className="w-4 h-4 accent-emerald-400" />
        Mark as Confirmed immediately (credits votes & total if linked to a request)
      </label>
    </FormShell>
  );
}

export function GrantSubscriptionForm({ registeredUsers = [], onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    email: registeredUsers[0]?.email || '',
    months: '1',
    amount: '1000',
    phone: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <FormShell
      title="Grant Pro Subscription"
      onCancel={onCancel}
      loading={loading}
      submitLabel="Activate Pro"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.email.trim()) return;
        onSave(form);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="sub-email" label="Registered User Email" required />
          <input id="sub-email" type="email" required list="admin-user-emails"
            className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="user@example.com" />
          <datalist id="admin-user-emails">
            {registeredUsers.map((u) => <option key={u.id} value={u.email} />)}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="sub-months" label="Duration (Months)" />
            <input id="sub-months" type="number" min="1" max="36" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.months} onChange={(e) => set('months', e.target.value)} />
          </div>
          <div>
            <FieldLabel htmlFor="sub-amount" label="Amount (RWF)" />
            <input id="sub-amount" type="number" min="0" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
              value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="sub-phone" label="MoMo Phone (Optional)" />
          <input id="sub-phone" className="input-dark w-full px-3 py-2 rounded-lg text-xs"
            value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="078..." />
        </div>
      </div>
    </FormShell>
  );
}
