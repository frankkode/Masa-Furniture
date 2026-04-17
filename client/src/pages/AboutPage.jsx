import { Link } from 'react-router-dom';

const TEAM = [
  {
    name: 'Elina Mäkinen',
    role: 'Founder & Creative Director',
    bio:  'With 15 years in Scandinavian interior design, Elina founded Masa to bring thoughtful, lasting furniture to modern homes.',
    initials: 'EM',
    color: 'bg-orange-400',
  },
  {
    name: 'Juhani Virtanen',
    role: 'Head of Product',
    bio:  'Juhani oversees material sourcing and craftsmanship standards, ensuring every piece meets our sustainability commitments.',
    initials: 'JV',
    color: 'bg-blue-500',
  },
  {
    name: 'Anni Korhonen',
    role: 'Customer Experience',
    bio:  'Anni leads our support and delivery operations, from white-glove assembly to after-sales care.',
    initials: 'AK',
    color: 'bg-green-500',
  },
];

const VALUES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
      </svg>
    ),
    title: 'Timeless Design',
    text:  'We create pieces that outlast trends — furniture you will still love in twenty years.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Sustainable Materials',
    text:  'FSC-certified wood, recycled metals and natural fibres — chosen with the planet in mind.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
    title: 'Crafted by People',
    text:  'Every joint, finish and curve is shaped by skilled artisans in our Helsinki workshop.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
      </svg>
    ),
    title: '10-Year Guarantee',
    text:  'We stand behind our work. Every piece ships with our decade-long structural warranty.',
  },
];

const STATS = [
  { value: '2014', label: 'Founded in Helsinki' },
  { value: '12 000+', label: 'Happy customers' },
  { value: '4', label: 'Nordic showrooms' },
  { value: '100%', label: 'Carbon-offset shipping' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ── hero ── */}
      <section className="bg-masa-dark text-white py-24 px-4">
        <div className="container-main max-w-3xl text-center">
          <p className="text-masa-accent text-sm font-semibold tracking-widest uppercase mb-4">Our Story</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Furniture that feels like home — wherever you are
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Masa was born in Helsinki in 2014 with one ambition: to make Scandinavian craftsmanship
            accessible without compromise. Every piece in our collection is designed to be lived in,
            handed down and loved for generations.
          </p>
        </div>
      </section>

      {/* ── stats ── */}
      <section className="border-b border-masa-border">
        <div className="container-main py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-masa-accent mb-1">{s.value}</p>
              <p className="text-sm text-masa-gray">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── values ── */}
      <section className="container-main py-20">
        <div className="max-w-xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold text-masa-dark mb-4">What we stand for</h2>
          <p className="text-masa-gray leading-relaxed">
            Four principles guide every decision we make — from which tree the timber comes from
            to how we pack and deliver your order.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map(v => (
            <div key={v.title} className="flex flex-col items-start gap-4 p-6 bg-masa-light rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-masa-accent/10 text-masa-accent flex items-center justify-center shrink-0">
                {v.icon}
              </div>
              <div>
                <h3 className="font-bold text-masa-dark mb-2">{v.title}</h3>
                <p className="text-sm text-masa-gray leading-relaxed">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── team ── */}
      <section className="bg-masa-light py-20 px-4">
        <div className="container-main">
          <div className="max-w-xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold text-masa-dark mb-4">The people behind Masa</h2>
            <p className="text-masa-gray leading-relaxed">
              A small team with a big obsession: getting the details right.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className={`w-16 h-16 rounded-full ${m.color} text-white text-2xl font-bold
                                flex items-center justify-center mx-auto mb-4`}>
                  {m.initials}
                </div>
                <h3 className="font-bold text-masa-dark">{m.name}</h3>
                <p className="text-xs text-masa-accent font-semibold mb-3">{m.role}</p>
                <p className="text-sm text-masa-gray leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container-main py-20 text-center">
        <h2 className="text-3xl font-bold text-masa-dark mb-4">Ready to find your favourite piece?</h2>
        <p className="text-masa-gray mb-8 max-w-lg mx-auto">
          Browse our full collection and enjoy free shipping on orders over €500. Assembly included.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/shop" className="btn-primary px-8 py-3">Shop Collection</Link>
          <Link to="/contact" className="btn-outline px-8 py-3">Get in Touch</Link>
        </div>
      </section>
    </div>
  );
}
