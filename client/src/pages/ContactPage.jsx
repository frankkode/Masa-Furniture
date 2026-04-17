import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    label: 'Visit us',
    value: 'Mannerheimintie 10, 00100 Helsinki, Finland',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
    label: 'Email us',
    value: 'hello@masa.fi',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
      </svg>
    ),
    label: 'Call us',
    value: '+358 9 000 0000 · Mon–Fri 9–18',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    label: 'Showroom hours',
    value: 'Mon–Fri 10–19 · Sat 10–17 · Sun closed',
  },
];

const TOPICS = [
  'Order & delivery',
  'Product question',
  'Returns & warranty',
  'Interior design advice',
  'Wholesale / trade',
  'Other',
];

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', topic: '', message: '' });
  const [status, setStatus]   = useState('idle'); // idle | sending | sent | error
  const [errMsg, setErrMsg]   = useState('');

  const f = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    try {
      await api.post('/contact', {
        name:    form.name,
        email:   form.email,
        subject: form.topic || undefined,
        message: form.message,
      });
      setStatus('sent');
    } catch {
      setErrMsg('Something went wrong. Please email us directly at hello@masa.fi');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ── hero ── */}
      <section className="bg-masa-light border-b border-masa-border py-16 px-4 text-center">
        <p className="text-masa-accent text-sm font-semibold tracking-widest uppercase mb-3">Contact</p>
        <h1 className="text-4xl font-bold text-masa-dark mb-4">We'd love to hear from you</h1>
        <p className="text-masa-gray max-w-md mx-auto leading-relaxed">
          Have a question about an order, need design advice, or just want to say hello?
          Our team usually replies within one business day.
        </p>
      </section>

      <div className="container-main py-16 grid lg:grid-cols-5 gap-12 max-w-5xl">

        {/* ── contact info ── */}
        <aside className="lg:col-span-2 space-y-6">
          {CONTACT_INFO.map(c => (
            <div key={c.label} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-masa-accent/10 text-masa-accent flex items-center justify-center shrink-0">
                {c.icon}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-masa-gray mb-0.5">{c.label}</p>
                <p className="text-sm text-masa-dark leading-relaxed">{c.value}</p>
              </div>
            </div>
          ))}

          {/* map placeholder */}
          <div className="mt-6 rounded-2xl overflow-hidden border border-masa-border">
            <iframe
              title="Masa Helsinki showroom"
              src="https://maps.google.com/maps?q=Mannerheimintie+10,+Helsinki&output=embed"
              width="100%"
              height="220"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>

        {/* ── contact form ── */}
        <div className="lg:col-span-3">
          {status === 'sent' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-masa-dark mb-2">Message sent!</h2>
                <p className="text-masa-gray mb-6">Thanks for reaching out. We'll be in touch within one business day.</p>
                <button onClick={() => { setStatus('idle'); setForm({ name:'', email:'', topic:'', message:'' }); }}
                  className="btn-outline px-6 py-2.5">Send another message</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-bold text-masa-dark mb-1">Send us a message</h2>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{errMsg}</div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-masa-dark mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.name} required onChange={f('name')}
                    placeholder="Jane Smith"
                    className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-masa-dark mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input type="email" value={form.email} required onChange={f('email')}
                    placeholder="jane@example.com"
                    className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-masa-dark mb-1.5">Topic</label>
                <select value={form.topic} onChange={f('topic')}
                  className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors bg-white">
                  <option value="">— Select a topic —</option>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-masa-dark mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message} required onChange={f('message')} rows={6}
                  placeholder="Tell us how we can help…"
                  className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors resize-none"/>
              </div>

              <button type="submit" disabled={status === 'sending'}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
                {status === 'sending' ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>Sending…</>
                ) : 'Send Message'}
              </button>

              <p className="text-xs text-masa-gray text-center">
                You can also email us directly at{' '}
                <a href="mailto:hello@masa.fi" className="text-masa-accent hover:underline">hello@masa.fi</a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── FAQ teaser ── */}
      <section className="bg-masa-light border-t border-masa-border py-12 px-4">
        <div className="container-main max-w-2xl text-center">
          <h3 className="font-bold text-masa-dark text-lg mb-2">Looking for quick answers?</h3>
          <p className="text-sm text-masa-gray mb-5">
            Check out the most common questions about shipping, returns and product care.
          </p>
          <Link to="/shop" className="btn-outline px-6 py-2.5">Browse FAQ</Link>
        </div>
      </section>
    </div>
  );
}
