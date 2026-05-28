import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import { type Person } from '../lib/types';
import { loadPeople } from '../lib/store';
import BukLogo from '../components/BukLogo';

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  useEffect(() => { setPeople(loadPeople().sort((a,b) => b.issue - a.issue)); }, []);

  const featured = people[0];
  const next = people.slice(1, 4);
  const rest = people.slice(4, 10);

  return (
    <div>
      {/* MASTHEAD */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-6xl px-6 pt-10">
          <div className="flex items-end justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-muted">
            <span>Vol. I</span>
            <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>Bayero University Kano</span>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <BukLogo size={56} />
          </div>
          <h1 className="mt-3 text-center font-display text-[88px] font-300 leading-[0.92] tracking-tightest sm:text-[112px]">
            The Class <span className="serif-italic text-vermillion">Quarterly</span>
          </h1>
          <p className="mt-4 text-center font-display text-[18px] italic text-muted">
            A small press for the Faculty of Computing, BUK · Class of 2022.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 border-t border-rule pt-4 pb-6 font-mono text-[10px] tracking-[0.22em] uppercase text-muted">
            <span>Portraits</span>
            <span>·</span>
            <span>Profiles</span>
            <span>·</span>
            <span>Personalities of the Week</span>
          </div>
        </div>
      </section>

      {/* COVER STORY */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-vermillion">Cover Story · This Week</div>
            <h2 className="mt-4 font-display text-[60px] font-300 leading-[0.95] tracking-tightest sm:text-[72px]">
              {featured
                ? <><span>{featured.name.split(' ')[0]}</span><span className="serif-italic">, in</span><br />their own words.</>
                : <>A new face, <span className="serif-italic text-vermillion">every week.</span></>}
            </h2>
            <p className="mt-6 max-w-md font-display text-[18px] leading-relaxed text-graphite">
              {featured
                ? (featured.quote ? `"${featured.quote}"` : `Meet ${featured.name}, ${featured.department}. The full profile is inside.`)
                : 'A printed-feeling little magazine for the final-year class. Every issue spotlights one personality — their levels, their lecturers, the things they would have done if not for computing.'}
            </p>
            <div className="mt-7 flex items-center gap-5">
              <Link to={featured ? `/p/${featured.id}` : '/admin'}
                className="group flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-display text-[15px] tracking-tight text-paper hover:bg-graphite">
                {featured ? 'Read this issue' : 'Print the first issue'}
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link to="/gallery" className="font-display text-[15px] italic text-ink underline decoration-vermillion decoration-2 underline-offset-4">
                Browse the archive
              </Link>
            </div>
          </div>

          <div className="lg:pl-10">
            {featured ? <CoverFeatured person={featured} /> : <CoverPlaceholder />}
          </div>
        </div>
      </section>

      {/* IN THIS ISSUE */}
      {next.length > 0 && (
        <section className="border-b border-rule">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-end justify-between border-b border-rule pb-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">In Recent Issues</div>
                <h2 className="mt-1 font-display text-[36px] font-400 tracking-tightest">Also <span className="serif-italic text-vermillion">featured.</span></h2>
              </div>
              <Link to="/gallery" className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ink hover:text-vermillion sm:block">See all →</Link>
            </div>

            <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-3">
              {next.map(p => (
                <article key={p.id}>
                  <Link to={`/p/${p.id}`} className="block group">
                    <div className="aspect-[4/5] overflow-hidden bg-cream">
                      {p.photo
                        ? <img src={p.photo} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" style={{ filter: 'contrast(1.02) saturate(0.95)' }} />
                        : <div className="flex h-full items-center justify-center font-display text-[13px] italic text-muted">— portrait —</div>}
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-muted">№ {String(p.issue).padStart(3,'0')}</span>
                      <span className="font-display text-[12px] italic text-vermillion">read</span>
                    </div>
                    <h3 className="mt-1 font-display text-[26px] font-400 leading-tight tracking-tight text-ink">{p.name}</h3>
                    <div className="mt-0.5 font-display text-[14px] italic text-muted">'{p.nickname || '—'}' · {p.department}</div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT SHEET (small thumbnails) */}
      {rest.length > 0 && (
        <section className="border-b border-rule">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">From The Archive</div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {rest.map(p => (
                <Link key={p.id} to={`/p/${p.id}`} className="group aspect-square overflow-hidden bg-cream">
                  {p.photo
                    ? <img src={p.photo} className="h-full w-full object-cover transition group-hover:scale-105" />
                    : <div className="flex h-full items-center justify-center font-display text-[11px] italic text-muted">no photo</div>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COLOPHON */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">How it works</div>
              <h3 className="mt-2 font-display text-[24px] font-400 tracking-tight">Compose. <span className="serif-italic text-vermillion">Print.</span> Share.</h3>
              <p className="mt-3 font-display text-[15px] leading-relaxed text-graphite">
                Fill the profile, drop in a portrait, hit publish. The system prints an editorial card you can download, share by link, or pin to the archive.
              </p>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">By the dozen</div>
              <h3 className="mt-2 font-display text-[24px] font-400 tracking-tight">From a <span className="serif-italic text-vermillion">Google Form.</span></h3>
              <p className="mt-3 font-display text-[15px] leading-relaxed text-graphite">
                Already collected responses? Export to CSV, import once, queue the whole class. Headers are mapped automatically.
              </p>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">A little help</div>
              <h3 className="mt-2 font-display text-[24px] font-400 tracking-tight">With <span className="serif-italic text-vermillion">AI</span> at the desk.</h3>
              <p className="mt-3 font-display text-[15px] leading-relaxed text-graphite">
                One click brightens a portrait. Another polishes the text — fixing capitalization, smoothing phrasing, and writing a quote when one is missing.
              </p>
            </div>
          </div>

          <div className="mt-14 border-t border-rule pt-6 text-center font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted">
            Printed at Kano · Faculty of Computing · Set of 2022 ·
            <span className="serif-italic normal-case tracking-normal text-ink"> with care.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function CoverFeatured({ person }: { person: Person }) {
  return (
    <Link to={`/p/${person.id}`} className="block group">
      <div className="relative">
        <div className="aspect-[3/4] w-full overflow-hidden bg-cream">
          {person.photo
            ? <img src={person.photo} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" style={{ filter: 'contrast(1.02) saturate(0.95)' }} />
            : <div className="flex h-full items-center justify-center font-display text-[14px] italic text-muted">— portrait —</div>}
        </div>
        <div className="absolute -bottom-4 -right-3 bg-paper px-4 py-2 shadow-sm">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-vermillion">Plate</div>
          <div className="numeral text-[28px] font-300 leading-none">№ {String(person.issue).padStart(3,'0')}</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-rule pt-4">
        <Mini label="Hobbies" value={person.hobbies} />
        <Mini label="Department" value={person.department} />
        <Mini label="Easiest" value={person.easiestLevel} />
      </div>
    </Link>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted">{label}</div>
      <div className="mt-1 font-display text-[14px] leading-snug text-ink">{value || '—'}</div>
    </div>
  );
}

function CoverPlaceholder() {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden border border-rule bg-cream">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <Quote className="text-vermillion" size={28} />
        <p className="mt-4 max-w-xs font-display text-[18px] italic leading-snug text-graphite">
          "The first issue is always the hardest. After that, it gets fun."
        </p>
        <Link to="/admin" className="mt-6 border border-ink bg-ink px-4 py-2 font-display text-[13px] text-paper hover:bg-graphite">
          Open the editor's desk
        </Link>
      </div>
    </div>
  );
}
