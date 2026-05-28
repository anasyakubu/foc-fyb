import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Link2, Check, ArrowLeft, Pencil } from 'lucide-react';
import { type Person } from '../lib/types';
import { getPerson } from '../lib/store';
import { downloadCard } from '../lib/download';
import { FybCard } from '../components/FybCard';

export default function View() {
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPerson(getPerson(id!) || null); }, [id]);

  if (!person) return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">404</div>
      <h1 className="mt-2 font-display text-[36px] font-400 tracking-tightest">This page was <span className="serif-italic text-vermillion">lost in print.</span></h1>
      <Link to="/gallery" className="mt-6 inline-block font-display text-[15px] italic text-ink underline decoration-vermillion decoration-2 underline-offset-4">← back to the archive</Link>
    </div>
  );

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* breadcrumb + actions */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/gallery" className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:text-ink">
          <ArrowLeft size={13} /> Back to the archive
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={share}
            className="flex items-center gap-2 border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite hover:border-ink">
            {copied ? <Check size={12} className="text-vermillion" /> : <Link2 size={12} />} {copied ? 'Link copied' : 'Copy link'}
          </button>
          <Link to="/admin" className="flex items-center gap-2 border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite hover:border-ink">
            <Pencil size={12} /> Edit
          </Link>
          <button onClick={() => cardRef.current && downloadCard(cardRef.current, `${person.name.replace(/\s+/g,'_')}_FYB.png`)}
            className="flex items-center gap-2 border border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper hover:bg-graphite">
            <Download size={12} /> Download
          </button>
        </div>
      </div>

      {/* card on a desk */}
      <div className="flex justify-center overflow-x-auto bg-cream/40 py-10">
        <div className="animate-rise">
          <FybCard ref={cardRef} person={person} />
        </div>
      </div>

      {/* footer plate info */}
      <div className="mt-6 flex items-center justify-between border-t border-rule pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        <span>Plate №{String(person.issue).padStart(3,'0')}</span>
        <span className="serif-italic normal-case tracking-normal text-ink">Save the file, share the link — or print it.</span>
        <span>Faculty of Computing</span>
      </div>
    </div>
  );
}
