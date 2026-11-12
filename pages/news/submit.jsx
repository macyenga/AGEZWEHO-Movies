import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import CinematicBackground from '../../components/CinematicBackground';
import { ArrowLeft, Send, Image as ImageIcon, Loader2, Smartphone, CheckCircle2, Newspaper, AlertTriangle, Hash, FileText, Info } from 'lucide-react';

const CATEGORIES = [
  'Amakuru agezweho', 'Amakuru mashya', 'Politiki', 'M23',
  'Ubukungu', 'Imyidagaduro', 'Siporo', 'Ubuzima', 'Uburezi', 'Ikoranabuhanga',
];

export default function SubmitNews() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publisherMomo, setPublisherMomo] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (success) return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <CinematicBackground />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center px-6 max-w-md">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <CheckCircle2 size={56} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
        </motion.div>
        <h2 className="font-cinzel text-2xl mb-3" style={{ fontFamily: 'Cinzel,serif', color: '#22c55e' }}>Published!</h2>
        <p className="text-sm mb-6" style={{ color: '#8a8778' }}>Your story is live on Amakuru.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/news">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
              <Newspaper size={14} /> View News
            </motion.div>
          </Link>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setSuccess(false); setTitle(''); setContent(''); setImageUrl(''); setPublisherMomo(''); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8778' }}>
            Publish Another
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setPosting(true);
    setError('');
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          image_url: imageUrl.trim() || null,
          category,
          author_name: authorName.trim() || 'Anonymous',
          publisher_momo: publisherMomo.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep">
      <SEOHead title="Publish News" description="Publish a news story on Agasobanuye.rw Amakuru" canonical="https://agasobanuye.rw/news/submit" />
      <CinematicBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/news">
            <motion.div whileHover={{ x: -3 }} className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#6a6a5a' }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#6a6a5a'}>
              <ArrowLeft size={13} /> Back to Amakuru
            </motion.div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
            <Newspaper size={24} style={{ color: '#38bdf8' }} />
          </div>
          <h1 className="font-cinzel font-bold text-xl mb-2" style={{
            fontFamily: 'Cinzel,serif',
            background: 'linear-gradient(135deg,#7dd3fc,#38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Publish a Story</h1>
          <p className="text-xs" style={{ color: '#6a6a5a' }}>Share news with the community — your story appears instantly</p>
          <div className="divider-gold w-16 mx-auto mt-3" />
        </motion.div>

        {/* Pro Guide */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="mb-6 p-4 rounded-xl relative overflow-hidden"
          style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)' }}>
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(56,189,248,0.06) 50%,transparent 70%)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', repeatDelay: 3 }} />
          <div className="flex gap-3 items-start relative z-10">
            <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#38bdf8' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-1.5" style={{ color: '#38bdf8' }}>Publisher Guide — How to Add an Image</p>
              <ol className="text-[10px] leading-relaxed space-y-1" style={{ color: '#8a8778' }}>
                <li><span style={{ color: '#38bdf8' }}>1.</span> Go to <strong>https://postimages.org</strong> (free, no account needed)</li>
                <li><span style={{ color: '#38bdf8' }}>2.</span> Click <strong>"Choose your images"</strong> and select your photo</li>
                <li><span style={{ color: '#38bdf8' }}>3.</span> Wait for upload, then copy the <strong>"Direct link"</strong> URL</li>
                <li><span style={{ color: '#38bdf8' }}>4.</span> Paste that URL into the <strong>Image URL</strong> field below</li>
                <li className="pt-1" style={{ color: '#4a4a3a' }}>Alternatively use ImgBB, Imgur, or any image host — just need a direct image URL.</li>
              </ol>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-5 p-6 rounded-2xl"
          style={{ background: 'rgba(14,14,22,0.8)', border: '1px solid rgba(56,189,248,0.12)', backdropFilter: 'blur(20px)' }}>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>
              Headline <span style={{ color: '#e05c3a' }}>*</span>
              <span className="ml-2 text-[9px] normal-case tracking-normal" style={{ color: '#4a4a3a' }}>{title.length}/200</span>
            </label>
            <input className={`input-dark w-full px-3 py-2 rounded-lg text-sm ${error && !title.trim() ? 'border-red-500/40' : ''}`}
              value={title} onChange={e => { if (e.target.value.length <= 200) setTitle(e.target.value); setError(''); }}
              placeholder="e.g. M23: New Developments in Eastern DRC" />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>
              <FileText size={10} className="inline mr-1" />Story <span style={{ color: '#3a3a2a' }}>optional</span>
              <span className="ml-2 text-[9px] normal-case tracking-normal" style={{ color: '#4a4a3a' }}>{content.length}/1000</span>
            </label>
            <textarea className="input-dark w-full px-3 py-2 rounded-lg text-sm resize-none" rows={5}
              value={content} onChange={e => { if (e.target.value.length <= 1000) setContent(e.target.value); }}
              placeholder="Write your story... Share details, context, and background information." />
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>
              Your Name <span style={{ color: '#3a3a2a' }}>optional</span>
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={authorName} onChange={e => setAuthorName(e.target.value)}
              placeholder="e.g. Jean Pierre — shown as author" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>
              <Hash size={10} className="inline mr-1" />Category
            </label>
            <select className="input-dark w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
              value={category} onChange={e => setCategory(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              {CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: '#0f0f16' }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#6a6a5a' }}>
              <ImageIcon size={10} className="inline mr-1" />Image URL <span style={{ color: '#3a3a2a' }}>optional</span>
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..." />
            <AnimatePresence>
              {imageUrl && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-2">
                  <img src={imageUrl} alt="preview" className="w-full max-h-40 object-cover rounded-lg"
                    style={{ border: '1px solid rgba(56,189,248,0.15)' }}
                    onError={e => { e.target.style.display = 'none'; }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MoMo */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <label className="block text-[10px] font-medium mb-1.5 tracking-[2px] uppercase" style={{ color: '#22c55e' }}>
              <Smartphone size={10} className="inline mr-1" />Your MoMo Number — receive tips
            </label>
            <input className="input-dark w-full px-3 py-2 rounded-lg text-sm"
              value={publisherMomo} onChange={e => setPublisherMomo(e.target.value)}
              placeholder="e.g. 0788123456 — readers can tip you" />
            <p className="text-[10px] mt-1.5" style={{ color: '#4a4a3a' }}>
              Readers can send you tips via MoMo when you provide your number.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg text-xs"
              style={{ background: 'rgba(224,92,58,0.1)', border: '1px solid rgba(224,92,58,0.2)', color: '#e05c3a' }}>
              <AlertTriangle size={14} /> {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={posting || !title.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: !title.trim() ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,rgba(56,189,248,0.2),rgba(14,165,233,0.1))',
              border: `1px solid ${!title.trim() ? 'rgba(255,255,255,0.06)' : 'rgba(56,189,248,0.35)'}`,
              color: !title.trim() ? '#4a4a3a' : '#38bdf8',
            }}>
            {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {posting ? 'Publishing...' : 'Publish Story'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
