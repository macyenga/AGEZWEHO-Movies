import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CinematicBackground from '../components/CinematicBackground';
import { CATEGORY_GROUPS } from '../lib/categories';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2, Package, Lock, Loader2, AlertTriangle, Image, Globe, DollarSign, Phone, FileText, Hash, Star, ChevronDown } from 'lucide-react';

const PLATFORMS = [
  { name: 'Google Drive', color: '#4285F4' },
  { name: 'Mega.nz',      color: '#D9272E' },
  { name: 'MediaFire',    color: '#1B82E4' },
  { name: 'Dropbox',      color: '#0061FF' },
  { name: 'OneDrive',     color: '#0078D4' },
  { name: 'Direct Link',  color: '#22c55e' },
  { name: 'Torrent',      color: '#a855f7' },
  { name: 'Custom',       color: '#c9a84c' },
];

const EMPTY = { title:'', category:'', version:'', rating:'', cover_url:'', overview:'', premium:true, price:50, uploader_momo_number:'' };

const validateUrl = u => !u || u.startsWith('http://') || u.startsWith('https://');
const validateMomo = n => !n || /^0[1-9]\d{8}$/.test(n.replace(/\s/g, ''));

export default function SubmitGame() {
  const [form, setForm] = useState(EMPTY);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [catOpen, setCatOpen] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const addLink = () => setLinks(l => [...l, { label:'', info:'', url:'' }]);
  const setLink = (i, k, v) => setLinks(l => l.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const removeLink = i => setLinks(l => l.filter((_, idx) => idx !== i));
  const applyPlatform = (i, p) => setLinks(l => l.map((x, idx) => idx === i ? { ...x, label: p.name, color: p.color } : x));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.category) errs.category = 'Category is required';
    links.forEach((l, i) => {
      if (l.url && !validateUrl(l.url)) errs[`link_${i}`] = 'Must start with http:// or https://';
    });
    if (form.uploader_momo_number && !validateMomo(form.uploader_momo_number)) errs.uploader_momo_number = 'Invalid MoMo format (e.g. 0788123456)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/games/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Math.max(50, parseInt(form.price) || 50),
          links: links.filter(l => l.url?.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
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
        <p className="text-sm mb-6" style={{ color:'#8a8778' }}>Your content is pending admin review and will appear once approved.</p>
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
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)' }}>
              <Package size={22} style={{ color:'#c9a84c' }} />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-xl" style={{
                fontFamily:'Cinzel,serif',
                background:'linear-gradient(135deg,#f5e4a8,#c9a84c)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>Add Content</h1>
              <p className="text-xs" style={{ color:'#6a6a5a' }}>Share premium content with the community</p>
            </div>
          </div>
          <div className="divider-gold w-20" />
        </motion.div>

        {/* Notice Banner */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.1 }}
          className="mb-6 p-4 rounded-xl relative overflow-hidden"
          style={{ background:'rgba(234,179,8,0.06)', border:'1px solid rgba(234,179,8,0.25)' }}>
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background:'linear-gradient(105deg,transparent 30%,rgba(234,179,8,0.06) 50%,transparent 70%)' }}
            animate={{ x:['-100%','200%'] }}
            transition={{ repeat:Infinity, duration:4, ease:'easeInOut', repeatDelay:3 }} />
          <div className="flex gap-3 items-start relative z-10">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color:'#fbbf24' }} />
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color:'#fbbf24' }}>Guidelines</p>
              <p className="text-[11px] leading-relaxed" style={{ color:'#8a8060' }}>
                Submit valid working links only. Fake or broken links will be rejected and your uploads may be blocked.
                All submissions are reviewed by admin before going live.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="space-y-5 p-6 rounded-2xl"
          style={{ background:'rgba(14,14,22,0.8)', border:'1px solid rgba(201,168,76,0.15)', backdropFilter:'blur(20px)' }}>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              Title <span style={{ color:'#e05c3a' }}>*</span>
              <span className="ml-2 text-[9px] normal-case tracking-normal" style={{ color:'#3a3a2a' }}>
                {form.title.length}/100
              </span>
            </label>
            <input className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.title?'border-red-500/40':''}`}
              value={form.title} onChange={e => { if (e.target.value.length <= 100) set('title', e.target.value); }}
              placeholder="e.g. GTA 5 Mobile, WhatsApp Gold..." />
            {errors.title && <p className="text-red-400/80 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              Category <span style={{ color:'#e05c3a' }}>*</span>
            </label>
            <button type="button" onClick={() => setCatOpen(o => !o)}
              className={`input-dark w-full px-3 py-2 rounded-lg text-sm text-left flex items-center justify-between ${errors.category?'border-red-500/40':''}`}
              style={{ background:'rgba(255,255,255,0.03)', color: form.category ? '#e8e4d8' : '#4a4a3a' }}>
              <span>{form.category || 'Select a category...'}</span>
              <motion.div animate={{ rotate: catOpen ? 180 : 0 }}>
                <ChevronDown size={14} style={{ color:'#6a6a5a' }} />
              </motion.div>
            </button>
            {errors.category && <p className="text-red-400/80 text-xs mt-1">{errors.category}</p>}
            <AnimatePresence>
              {catOpen && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden max-h-64 overflow-y-auto"
                  style={{ background:'rgba(14,14,22,0.98)', border:'1px solid rgba(201,168,76,0.2)', backdropFilter:'blur(20px)' }}>
                  {CATEGORY_GROUPS.map(group => (
                    <div key={group.label}>
                      <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider font-semibold" style={{ color:'#6a6a5a', background:'rgba(0,0,0,0.2)' }}>
                        {group.label}
                      </div>
                      {group.items.map(item => (
                        <motion.button key={item} type="button"
                          whileHover={{ background:'rgba(201,168,76,0.08)' }}
                          onClick={() => { set('category', item); setCatOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs transition-colors"
                          style={{ color: form.category === item ? '#c9a84c' : '#e8e4d8' }}>
                          {item}
                        </motion.button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Version + Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
                <Hash size={10} className="inline mr-1" />Version <span style={{ color:'#3a3a2a' }}>optional</span>
              </label>
              <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                value={form.version} onChange={e => set('version', e.target.value)}
                placeholder="1.1.1" />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
                <Star size={10} className="inline mr-1" />Rating <span style={{ color:'#3a3a2a' }}>optional</span>
              </label>
              <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                value={form.rating} onChange={e => set('rating', e.target.value)}
                placeholder="9.5" />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              <Image size={10} className="inline mr-1" />Cover Image URL <span style={{ color:'#3a3a2a' }}>optional</span>
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={form.cover_url} onChange={e => set('cover_url', e.target.value)}
              placeholder="https://i.postimg.cc/..." />
            <AnimatePresence>
              {form.cover_url && (
                <motion.div key="preview" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="mt-2 flex items-center gap-3 p-2 rounded-lg"
                  style={{ background:'rgba(0,0,0,0.2)' }}>
                  <img src={form.cover_url} alt="preview"
                    className="w-12 h-16 object-cover rounded-md"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    style={{ border:'1px solid rgba(139,92,246,0.2)' }} />
                  <div className="hidden items-center gap-2 text-xs" style={{ color:'#6a6a5a' }}>
                    <AlertTriangle size={12} /> Invalid image URL
                  </div>
                  <div className="text-[10px]" style={{ color:'#8a8778' }}>
                    {form.category || 'No category'} &middot; {form.rating ? `${form.rating}/10` : 'No rating'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
              <FileText size={10} className="inline mr-1" />Description <span style={{ color:'#3a3a2a' }}>optional</span>
              <span className="ml-2 text-[9px] normal-case tracking-normal" style={{ color:'#3a3a2a' }}>
                {form.overview.length}/500
              </span>
            </label>
            <textarea className="input-dark w-full px-3 py-2 rounded-lg text-sm resize-none" rows={3}
              value={form.overview} onChange={e => { if (e.target.value.length <= 500) set('overview', e.target.value); }}
              placeholder="What makes this content special?" />
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
                style={{ background: form.premium ? '#fbbf24' : 'rgba(255,255,255,0.1)' }} />
            </label>
          </div>

          {/* Unlock Price */}
          <div className="p-4 rounded-xl" style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.15)' }}>
            <label className="block text-[11px] font-semibold mb-1.5 tracking-[2px] uppercase" style={{ color:'#fbbf24' }}>
              <DollarSign size={12} className="inline mr-1" />Unlock Price (RWF) — min 50
            </label>
            <input type="number" min="100" step="50" className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={form.price} onChange={e => set('price', parseInt(e.target.value) || 50)}
              placeholder="50" />
            <p className="text-[10px] mt-1.5" style={{ color:'#4a4a3a' }}>
              Users must donate this amount via MoMo to unlock download links
            </p>
          </div>

          {/* MoMo Number */}
          <div className="p-4 rounded-xl" style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)' }}>
            <label className="block text-[11px] font-semibold mb-1.5 tracking-[2px] uppercase" style={{ color:'#22c55e' }}>
              <Phone size={12} className="inline mr-1" />Your MoMo Number — for crediting
            </label>
            <input className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${errors.uploader_momo_number?'border-red-500/40':''}`}
              value={form.uploader_momo_number} onChange={e => set('uploader_momo_number', e.target.value)}
              placeholder="e.g. 0788123456" />
            {errors.uploader_momo_number
              ? <p className="text-red-400/80 text-xs mt-1">{errors.uploader_momo_number}</p>
              : <p className="text-[10px] mt-1.5" style={{ color:'#4a4a3a' }}>
                  Admin uses this to send your earnings when users unlock your content
                </p>}
          </div>

          {/* Download Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-medium tracking-[2px] uppercase" style={{ color:'#6a6a5a' }}>
                  <Globe size={10} className="inline mr-1" />Download Links
                </span>
                <span className="text-[10px] ml-1" style={{ color:'#3a3a2a' }}>optional</span>
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
                  className="mb-3 p-3 rounded-xl space-y-2.5"
                  style={{ background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.15)' }}>

                  {/* Platform presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map(p => (
                      <button key={p.name} onClick={() => applyPlatform(i, p)}
                        className="text-[10px] px-2 py-0.5 rounded-md transition-all"
                        style={{
                          background: link.label === p.name ? p.color+'22' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${link.label === p.name ? p.color+'55' : 'rgba(255,255,255,0.07)'}`,
                          color: link.label === p.name ? p.color : '#6a6a5a',
                        }}>
                        {p.name}
                      </button>
                    ))}
                  </div>

                  {/* Link info */}
                  <div>
                    <input className="input-dark w-full px-2.5 py-1.5 rounded-lg text-xs"
                      value={link.info || ''} onChange={e => setLink(i, 'info', e.target.value)}
                      placeholder="Link info — e.g. Latest Version, Mod Menu, OBB File..." />
                  </div>

                  <div className="flex gap-2 items-center flex-wrap">
                    <input className="input-dark flex-1 min-w-[90px] px-2.5 py-1.5 rounded-lg text-xs"
                      value={link.label} onChange={e => setLink(i, 'label', e.target.value)}
                      placeholder="Label" />
                    <input className={`input-dark flex-[2] min-w-[130px] px-2.5 py-1.5 rounded-lg text-xs ${errors[`link_${i}`]?'border-red-500/40':''}`}
                      value={link.url} onChange={e => { setLink(i, 'url', e.target.value); setErrors(e => ({ ...e, [`link_${i}`]: '' })); }}
                      placeholder="Download URL" />
                    <button onClick={() => removeLink(i)} style={{ color:'#e05c3a44' }}
                      onMouseEnter={e => e.currentTarget.style.color='#e05c3a'}
                      onMouseLeave={e => e.currentTarget.style.color='#e05c3a44'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {errors[`link_${i}`] && <p className="text-red-400/80 text-[10px]">{errors[`link_${i}`]}</p>}
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

          {/* Submit Error */}
          {errors.submit && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="flex items-center gap-2 p-3 rounded-lg text-xs"
              style={{ background:'rgba(224,92,58,0.1)', border:'1px solid rgba(224,92,58,0.2)', color:'#e05c3a' }}>
              <AlertTriangle size={14} /> {errors.submit}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold relative overflow-hidden"
            style={{
              background: loading
                ? 'rgba(139,92,246,0.15)'
                : 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(34,197,94,0.1))',
              border:'1px solid rgba(139,92,246,0.35)', color: loading ? '#6a6a5a' : '#a78bfa' }}>
            {loading ? (
              <>
                <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:'linear' }}>
                  <Loader2 size={16} />
                </motion.div>
                Submitting...
              </>
            ) : (
              <><Save size={16} /> Add Content</>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
