import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Trash2, Search, BookOpen, Pencil } from 'lucide-react';
import { type Person } from '../lib/types';
import { loadPeople, removePerson } from '../lib/store';
import { downloadCard } from '../lib/download';
import { FybCard } from '../components/FybCard';
import { isAuthed } from '../lib/auth';
import Loading from '../components/Loading';

export default function Gallery() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const [renderTarget, setRenderTarget] = useState<Person | null>(null);
  const canManage = isAuthed();

  useEffect(() => {
    loadPeople().then(p => { setPeople(p); setLoading(false); });
  }, []);

  const filtered = people.filter(p =>
    [p.name, p.nickname, p.department].join(' ').toLowerCase().includes(q.toLowerCase()));

  const download = async (p: Person) => {
    setRenderTarget(p);
    await new Promise(r => setTimeout(r, 200));
    if (stageRef.current) await downloadCard(stageRef.current, `${p.name.replace(/\s+/g, '_')}_FYB.png`);
    setRenderTarget(null);
  };

  const del = async (id: string) => {
    if (!confirm('Remove this issue from the archive?')) return;

    try {
      await removePerson(id);
      setPeople(prev => prev.filter(x => x.id !== id));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Unknown error';

      alert('Could not remove: ' + message);
    }
  };

  if (loading) return <Loading label="Opening the archive" />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* MASTHEAD */}
      <div className="mb-10 border-b border-ink pb-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">The Bound Volume</div>
            <h1 className="mt-1 font-display text-[64px] font-300 leading-[0.95] tracking-tightest">
              The <span className="serif-italic text-vermillion">Archive.</span>
            </h1>
            <p className="mt-3 font-display text-[18px] italic text-muted">
              Every personality the class has commissioned.
            </p>
          </div>
          <div className="text-right">
            <div className="numeral text-[56px] font-300 leading-none text-ink">{String(people.length).padStart(2, '0')}</div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">issues in print</div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-rule pt-4">
          <Search size={14} className="text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name, nickname, or department…"
            className="w-full bg-transparent font-display text-[16px] outline-none placeholder:italic placeholder:text-muted" />
        </div>
      </div>

      {filtered.length === 0
        ? <div className="border border-dashed border-rule py-24 text-center">
          <BookOpen className="mx-auto text-muted/50" size={28} />
          <h2 className="mt-4 font-display text-[26px] font-400 tracking-tightest">The shelf is <span className="serif-italic text-vermillion">empty.</span></h2>
          <p className="mt-2 font-display text-[15px] italic text-muted">Visit the editor's desk to print the first issue.</p>
          <Link to="/admin" className="mt-5 inline-block border border-ink bg-ink px-5 py-2.5 font-display text-[14px] text-paper hover:bg-graphite">
            Go to the desk
          </Link>
        </div>
        : <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <article key={p.id} className="group">
              <Link to={`/p/${p.id}`} className="block">
                <div className="aspect-[3/4] overflow-hidden bg-cream">
                  {p.photo
                    ? <img src={p.photo} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" style={{ filter: 'contrast(1.02) saturate(0.95)' }} />
                    : <div className="flex h-full items-center justify-center font-display text-[14px] italic text-muted">— portrait —</div>}
                </div>
              </Link>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-muted">№ {String(p.issue).padStart(3, '0')}</span>
                <span className="font-display text-[12px] italic text-vermillion">portrait</span>
              </div>
              <Link to={`/p/${p.id}`} className="mt-1 block">
                <h3 className="font-display text-[24px] font-400 leading-tight tracking-tight text-ink">{p.name}</h3>
                <div className="mt-1 font-display text-[14px] italic text-muted">'{p.nickname || '—'}' · {p.department}</div>
              </Link>
              {p.quote && (
                <p className="mt-3 line-clamp-2 font-display text-[14px] italic leading-snug text-graphite">"{p.quote}"</p>
              )}
              <div className="mt-4 flex items-center gap-3 border-t border-rule pt-3">
                <Link to={`/p/${p.id}`} className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink underline decoration-vermillion decoration-2 underline-offset-4">Read the issue</Link>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => download(p)} title="Download"
                    className="text-muted hover:text-ink"><Download size={14} /></button>
                  {canManage && (
                    <Link to={`/admin?edit=${p.id}`} title="Edit"
                      className="text-muted hover:text-ink"><Pencil size={14} /></Link>
                  )}
                  {canManage &&
                    <button onClick={() => del(p.id)} title="Remove"
                      className="text-muted hover:text-vermillion"><Trash2 size={14} /></button>}
                </div>
              </div>
            </article>
          ))}
        </div>}

      <div className="pointer-events-none fixed -left-[9999px] top-0">
        {renderTarget && <FybCard ref={stageRef} person={renderTarget} />}
      </div>
    </div>
  );
}
