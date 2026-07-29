import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import CATEGORIES from '../lib/categories';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2, Package, Lock, Loader2 } from 'lucide-react';

const EMPTY = { title:'', category:'', version:'', rating:'', cover_url:'', overview:'', premium: true, price: 50, uploader_momo_number: '' };

export default function SubmitGame() {
  const [form,    setForm]    = useState(EMPTY);
  const [links,   setLinks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const addLink    = () => setLinks(l => [...l, { label:'', url:'' }]);
  const setLink    = (i, k, v) => setLinks(l => l.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const removeLink = i => setLinks(l => l.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return; }
    if (!form.category) { setErrors({ category: 'Category is required' }); return; }
    setLoading(true);
    try {
      await supabase.from('games').insert([{ ...form, status: 'pending', links: links.filter(l => l.url) }]);
      setSuccess(true);
      setForm(EMPTY);
      setLinks([]);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <CinematicBackground />
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        className="relative z-10 text-center px-6 max-w-md">
        <motion.div animate={{ scale:[1,1.15,1] }} transition={{ repeat:Infinity, duration:2 }}>
          <CheckCircle2 size={56} className="mx-auto mb-4" style={{ color:'#c9a84c' }} />
        </motion.div>
        <h2 className="font-cinzel text-2xl mb-3" style={{ fontFamily:'Cinzel,serif', color:'#c9a84c' }}>Submitted!</h2>
        <p className="text-sm mb-6" style={{ color:'#8a8778' }}>Your submission is waiting for admin review.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/games">
            <motion.div whileHover={{ scale:1.03 }} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
              <Package size={14} /> Browse Content
            </motion.div>
          </Link>
          <motion.button whileHover={{ scale:1.03 }} onClick={() => setSuccess(false)}
            className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
            <Plus size={14} /> Add Another
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead
        title="Add Game / Modded App"
        description="Submit your game or modded app to Agezweho Movies premium content library and earn money."
        canonical="https://agezweho.com/submit-game"
      />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">

        {/* Back */}
        <motion.div initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} className="mb-6">
          <Link href="/games">
            <motion.div whileHover={{ x:-3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color:'#6a6a5a' }}
              onMouseEnter={e=>e.currentTarget.style.color='#c9a84c'}
              onMouseLeave={e=>e.currentTarget.style.color='#6a6a5a'}>
              <ArrowLeft size={13} /> Back to Content
            </motion.div>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)' }}>
            <Package size={24} style={{ color:'#c9a84c' }} />
          </div>
          <h1 className="font-cinzel font-bold text-2xl mb-2"
            style={{ fontFamily:'Cinzel,serif', color:'#c9a84c' }}>
            Add Content
          </h1>
          <p className="text-xs" style={{ color:'#6a6a5a' }}>Share premium content with the community</p>
          <div className="divider-gold w-20 mx-auto mt-3" />
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="space-y-5 p-6 rounded-2xl"
          style={{ background:'rgba(14,14,22,0.8)', border:'1px solid rgba(201,168,76,0.15)', backdropFilter:'blur(20px)' }}>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              Title <span style={{ color:'#e05c3a' }}>*</span>
            </label>
            <input className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.title?'border-red-500/40':''}`}
              value={form.title} onChange={e=>set('title',e.target.value)}
              placeholder="e.g. GTA 5 Mobile, WhatsApp Gold..." />
            {errors.title && <p className="text-red-400/80 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              Category <span style={{ color:'#e05c3a' }}>*</span>
            </label>
            <select className="input-dark w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
              value={form.category} onChange={e=>set('category',e.target.value)}
              style={{ background:'rgba(255,255,255,0.03)' }}>
              <option value="" style={{ background:'#0f0f16' }}>Select a category...</option>
              {CATEGORIES.map(c =>
                <option key={c} value={c} style={{ background:'#0f0f16' }}>{c}</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
                Version <span style={{ color:'#3a3a2a' }}>optional</span>
              </label>
              <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                value={form.version} onChange={e=>set('version',e.target.value)}
                placeholder="e.g. 2.1.0" />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
                Rating <span style={{ color:'#3a3a2a' }}>optional</span>
              </label>
              <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                value={form.rating} onChange={e=>set('rating',e.target.value)}
                placeholder="9.5 out of 10" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              Cover Image URL <span style={{ color:'#3a3a2a' }}>optional</span>
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={form.cover_url} onChange={e=>set('cover_url',e.target.value)}
              placeholder="https://...jpg" />
            {form.cover_url && (
              <div className="mt-2">
                <img src={form.cover_url} alt="preview"
                  className="w-14 h-20 object-cover rounded-lg"
                  style={{ border:'1px solid rgba(139,92,246,0.2)' }}
                  onError={e=>e.target.style.display='none'} />
              <p className="text-[10px] mt-1" style={{ color:'#8a8778' }}>{form.category || 'No category selected'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              Description <span style={{ color:'#3a3a2a' }}>optional</span>
            </label>
            <textarea className="input-dark w-full px-3 py-2 rounded-lg text-sm resize-none" rows={3}
              value={form.overview} onChange={e=>set('overview',e.target.value)}
              placeholder="Short description..." />
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}>
            <Lock size={16} style={{ color: '#fbbf24' }} />
            <div className="flex-1">
              <label className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Premium Content</label>
              <p className="text-[10px]" style={{ color: '#8a8060' }}>Users donate to unlock download links</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.premium} onChange={e => set('premium', e.target.checked)}
                className="sr-only peer" />
              <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                style={{ background: form.premium ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}>
              </div>
            </label>
          </div>

          {/* Price — set your own unlock price */}
          <div className="p-4 rounded-xl" style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)' }}>
            <label className="block text-[11px] font-semibold mb-1.5 tracking-[2px] uppercase" style={{ color:'#fbbf24' }}>
              Unlock Price (RWF) — min 50 ✦
            </label>
            <input type="number" min="50" step="10" className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={form.price} onChange={e => set('price', parseInt(e.target.value) || 50)}
              placeholder="50" />
            <p className="text-[10px] mt-1.5" style={{ color:'#4a4a3a' }}>
              Users must donate this amount via MoMo to unlock download links
            </p>
          </div>

          {/* MoMo Number — for admin to credit uploader */}
          <div className="p-4 rounded-xl" style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)' }}>
            <label className="block text-[11px] font-semibold mb-1.5 tracking-[2px] uppercase" style={{ color:'#22c55e' }}>
              Your MoMo Number — for crediting ✦
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={form.uploader_momo_number} onChange={e => set('uploader_momo_number', e.target.value)}
              placeholder="e.g. 0788123456" />
            <p className="text-[10px] mt-1.5" style={{ color:'#4a4a3a' }}>
              Optional — admin uses this to send you your earnings when users unlock your content
            </p>
          </div>

          {/* Download Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-medium tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>Download Links </span>
                <span className="text-[10px]" style={{ color:'#3a3a2a' }}>optional</span>
              </div>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={addLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c' }}>
                <Plus size={11} /> Add Link
              </motion.button>
            </div>

            <AnimatePresence>
              {links.map((link, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                  className="mb-3 flex gap-2 items-center flex-wrap p-3 rounded-xl"
                  style={{ background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.15)' }}>
                  <input className="input-dark flex-1 min-w-[100px] px-2.5 py-1.5 rounded-lg text-xs"
                    value={link.label} onChange={e=>setLink(i,'label',e.target.value)}
                    placeholder="Label (e.g. APK Download, Drive)" />
                  <input className="input-dark flex-[2] min-w-[140px] px-2.5 py-1.5 rounded-lg text-xs"
                    value={link.url} onChange={e=>setLink(i,'url',e.target.value)}
                    placeholder="Download URL" />
                  <button onClick={()=>removeLink(i)} style={{ color:'#e05c3a44' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#e05c3a'}
                    onMouseLeave={e=>e.currentTarget.style.color='#e05c3a44'}>
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {links.length === 0 && (
              <div className="text-center py-3 rounded-xl text-xs"
                style={{ color:'#3a3a2a', border:'1px dashed rgba(201,168,76,0.15)' }}>
                No links yet — click Add Link above
              </div>
            )}
          </div>

          {errors.submit && <p className="text-red-400/80 text-xs">{errors.submit}</p>}

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(34,197,94,0.1))',
              border:'1px solid rgba(139,92,246,0.35)', color:'#a78bfa' }}>
            {loading
              ? <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:'linear' }}>
                  <Loader2 size={16}/>
                </motion.div>
              : <Save size={16} />}
            {loading ? 'Adding...' : 'Add Content'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
