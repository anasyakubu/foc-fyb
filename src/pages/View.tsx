import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Link2, Check, ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react';
import { type Person } from '../lib/types';
import { getPerson, removePerson } from '../lib/store';
import { downloadCard } from '../lib/download';
import { FybCard } from '../components/FybCard';
import Loading from '../components/Loading';
import { isAuthed } from '../lib/auth';

export default function View() {
  const { id } = useParams();
  const nav = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const canManage = isAuthed();

  useEffect(() => {
    if (!id) return;
    getPerson(id).then(p => { setPerson(p || null); setLoading(false); });
  }, [id]);

  if (loading) return <Loading label="Fetching the plate" />;

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

  const onDelete = async () => {
    if (!confirm(`Remove "${person.name}" from the archive? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await removePerson(person.id);
      nav('/gallery');
    } catch (e: any) {
      console.error(e);
      alert('Could not remove: ' + (e?.message || e));
      setDeleting(false);
    }
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

          {/* Admin-only actions */}
          {canManage && (
            <>
              <Link to={`/admin?edit=${person.id}`}
                className="flex items-center gap-2 border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite hover:border-ink">
                <Pencil size={12} /> Edit
              </Link>
              <button onClick={onDelete} disabled={deleting}
                className="flex items-center gap-2 border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:border-vermillion hover:text-vermillion disabled:opacity-50">
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {deleting ? 'Removing' : 'Delete'}
              </button>
            </>
          )}

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
        <span className="serif-italic normal-case tracking-normal text-ink">
          {canManage ? 'Editor signed in — edits visible above.' : 'Save the file, share the link — or print it.'}
        </span>
        <span>Faculty of Computing</span>
      </div>
    </div>
  );
}
