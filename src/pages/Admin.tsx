import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Wand2, ImagePlus, Trash2, FileSpreadsheet, Loader2, Check, LogOut, ArrowRight, Sparkles, Pencil } from 'lucide-react';
import { type Person, emptyPerson } from '../lib/types';
import { upsertPerson, addManyPeople, getPerson } from '../lib/store';
import { parseCSV, mapRowsToPeopleWithPhotos } from '../lib/csv';
import { enhanceImage, polishProfile } from '../lib/ai';
import { isAuthed, signOut } from '../lib/auth';
import Passcode from '../components/Passcode';
import Loading from '../components/Loading';

const fileToDataUrl = (f: File) => new Promise<string>((res) => {
  const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(f);
});

export default function Admin() {
  const [authed, setAuthed] = useState(isAuthed());
  if (!authed) return <Passcode onPass={() => setAuthed(true)} />;
  return <Editor onSignOut={() => { signOut(); setAuthed(false); }} />;
}

function Editor({ onSignOut }: { onSignOut: () => void }) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');

  const [draft, setDraft] = useState<Person>(emptyPerson());
  const [loadingEdit, setLoadingEdit] = useState<boolean>(!!editId);
  const [busy, setBusy] = useState<string>('');
  const [queue, setQueue] = useState<Person[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editId && draft.id === editId;

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    getPerson(editId).then(p => {
      if (cancelled) return;
      if (p) setDraft(p);
      else alert("Couldn't find that personality. It may have been removed.");
      setLoadingEdit(false);
    });
    return () => { cancelled = true; };
  }, [editId]);

  const onField = (k: keyof Person) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setDraft(d => ({ ...d, [k]: e.target.value }));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await fileToDataUrl(f);
    setDraft(d => ({ ...d, photo: url }));
  };

  const aiEnhance = async () => {
    if (!draft.photo) return;
    setBusy('enhance');
    const out = await enhanceImage(draft.photo);
    setDraft(d => ({ ...d, photo: out }));
    setBusy('');
  };

  const aiPolish = async () => {
    setBusy('polish');
    const out = await polishProfile({
      name: draft.name, nickname: draft.nickname, hobbies: draft.hobbies,
      relationship: draft.relationship, ifNotCS: draft.ifNotCS, quote: draft.quote,
    });
    setDraft(d => ({ ...d, ...out }));
    setBusy('');
  };

  const publishOne = async () => {
    if (!draft.name.trim()) return alert('A name is required.');

    setBusy('publish');

    try {
      const saved = await upsertPerson(draft);
      nav(`/p/${saved.id}`);
    } catch (e: unknown) {
      console.error(e);

      const message =
        e instanceof Error ? e.message : 'Unknown error';

      alert('Could not publish: ' + message);
      setBusy('');
    }
  };
  const stage = () => {
    if (!draft.name.trim()) return alert('A name is required.');
    setQueue(q => [...q, draft]);
    setDraft(emptyPerson());
  };

  const publishAll = async () => {
    if (!queue.length) return;

    setBusy(`upload 0/${queue.length}`);

    try {
      await addManyPeople(queue, (done, total) =>
        setBusy(`upload ${done}/${total}`)
      );

      setQueue([]);
      nav('/gallery');
    } catch (e: unknown) {
      console.error(e);

      const message =
        e instanceof Error ? e.message : 'Unknown error';

      alert('Could not publish issue: ' + message);
      setBusy('');
    }
  };

  const onCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy('csv');
    try {
      const text = await f.text();
      const rows = parseCSV(text);
      const people = await mapRowsToPeopleWithPhotos(rows, (loaded, total) => {
        setBusy(`photos ${loaded}/${total}`);
      });
      setQueue(q => [...q, ...people]);
      if (people.length === 0) {
        alert("Couldn't read any rows. Check that your CSV has a header row and at least one response.");
      } else {
        const failed = people.filter(p => p.photo && /^https?:/i.test(p.photo)).length;
        if (failed > 0) {
          alert(
            `Imported ${people.length} ${people.length === 1 ? 'person' : 'people'}.\n\n` +
            `${failed} photo${failed === 1 ? '' : 's'} couldn't load — most likely because the Drive folder isn't shared publicly.\n\n` +
            `Fix: open the Drive folder where Forms saved the photos, select all, right-click → Share → "Anyone with the link → Viewer", then re-import.\n\n` +
            `You can also upload portraits manually by clicking each person in the queue.`
          );
        }
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong importing that file.');
    } finally {
      setBusy('');
      if (csvRef.current) csvRef.current.value = '';
    }
  };

  useEffect(() => { document.title = "Editor's Desk · The Class Quarterly"; }, []);

  if (loadingEdit) return <Loading label="Pulling the file" />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between border-b border-rule pb-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">
            {isEditing ? `The Editor's Desk · Editing №${String(draft.issue).padStart(3, '0')}` : "The Editor's Desk"}
          </div>
          <h1 className="mt-1 font-display text-[42px] font-400 leading-none tracking-tightest">
            {isEditing
              ? <>Editing <span className="serif-italic text-vermillion">{draft.name.split(' ')[0] || 'this personality'}.</span></>
              : <>Commission a <span className="serif-italic text-vermillion">personality.</span></>}
          </h1>
          <p className="mt-2 font-display text-[16px] italic text-muted">
            {isEditing ? 'Make the changes, then save.' : 'One by one, or by the dozen.'}
          </p>
        </div>
        <button onClick={onSignOut}
          className="flex items-center gap-2 border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:border-ink hover:text-ink">
          <LogOut size={12} /> Sign out
        </button>
      </div>

      <div className={`grid gap-10 ${isEditing ? '' : 'lg:grid-cols-[1.5fr_1fr]'}`}>
        {/* COMPOSE */}
        <section>
          {/* tools row — hidden when editing a single existing person */}
          {!isEditing && (
            <div className="mb-7 flex flex-wrap gap-2">
              <button onClick={aiPolish} disabled={busy === 'polish'}
                className="flex items-center gap-2 border border-ink bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper hover:bg-graphite disabled:opacity-50">
                {busy === 'polish' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI polish & quote
              </button>
              <input ref={csvRef} type="file" accept=".csv,.tsv,.txt" onChange={onCSV} className="hidden" />
              <button onClick={() => csvRef.current?.click()} disabled={busy.startsWith('csv') || busy.startsWith('photos')}
                className="flex items-center gap-2 border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite hover:border-ink disabled:opacity-50">
                {busy === 'csv'
                  ? <><Loader2 size={12} className="animate-spin" /> Reading CSV</>
                  : busy.startsWith('photos ')
                    ? <><Loader2 size={12} className="animate-spin" /> Loading {busy.replace('photos ', '')}</>
                    : <><FileSpreadsheet size={12} /> Import CSV</>}
              </button>
            </div>
          )}

          {/* AI polish is still available when editing */}
          {isEditing && (
            <div className="mb-7 flex flex-wrap gap-2">
              <button onClick={aiPolish} disabled={busy === 'polish'}
                className="flex items-center gap-2 border border-ink bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper hover:bg-graphite disabled:opacity-50">
                {busy === 'polish' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI polish & quote
              </button>
            </div>
          )}

          {/* portrait + name row */}
          <div className="grid grid-cols-[160px_1fr] gap-6">
            <div>
              <div className="lbl">Portrait</div>
              <div className="aspect-[3/4] w-full overflow-hidden border border-rule bg-cream">
                {draft.photo
                  ? <img src={draft.photo} className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center font-display text-[12px] italic text-muted">no portrait</div>}
              </div>
              <input ref={photoRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
              <button onClick={() => photoRef.current?.click()}
                className="mt-2 flex w-full items-center justify-center gap-1.5 border border-rule py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-graphite hover:border-ink">
                <ImagePlus size={12} /> Upload
              </button>
              <button onClick={aiEnhance} disabled={!draft.photo || busy === 'enhance'}
                className="mt-1.5 flex w-full items-center justify-center gap-1.5 bg-ink py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper hover:bg-graphite disabled:opacity-40">
                {busy === 'enhance' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} AI enhance
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="lbl">Full Name</label>
                <input className="fld font-display text-[22px]" value={draft.name} onChange={onField('name')} placeholder="e.g. Aisha Yusuf Bello" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="lbl">Nickname</label>
                  <input className="fld" value={draft.nickname} onChange={onField('nickname')} placeholder="e.g. Aishacodes" />
                </div>
                <div>
                  <label className="lbl">Department</label>
                  <input className="fld" value={draft.department} onChange={onField('department')} />
                </div>
              </div>
            </div>
          </div>

          <div className="rule mt-10" />

          {/* rest of the form */}
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-2">
              <label className="lbl">Hobbies</label>
              <input className="fld" value={draft.hobbies} onChange={onField('hobbies')} placeholder="Traveling, meeting new people…" />
            </div>
            <div>
              <label className="lbl">Relationship Status</label>
              <input className="fld" value={draft.relationship} onChange={onField('relationship')} placeholder="Single · In a relationship · NIL" />
            </div>
            <div>
              <label className="lbl">Favourite Lecturer</label>
              <input className="fld" value={draft.favLecturer} onChange={onField('favLecturer')} placeholder="NIL" />
            </div>
            <div>
              <label className="lbl">Easiest Level</label>
              <input className="fld" value={draft.easiestLevel} onChange={onField('easiestLevel')} placeholder="200 Level" />
            </div>
            <div>
              <label className="lbl">Most Stressful Level</label>
              <input className="fld" value={draft.stressfulLevel} onChange={onField('stressfulLevel')} placeholder="300 Level" />
            </div>
            <div className="col-span-2">
              <label className="lbl">If not Computing, what else</label>
              <input className="fld" value={draft.ifNotCS} onChange={onField('ifNotCS')} />
            </div>
            <div className="col-span-2">
              <label className="lbl">Best Quote</label>
              <textarea rows={2} className="fld resize-none italic" value={draft.quote} onChange={onField('quote')} placeholder="A line worth printing." />
            </div>
            <div>
              <label className="lbl">Social Handle</label>
              <input className="fld" value={draft.social} onChange={onField('social')} placeholder="@handle" />
            </div>
            <div>
              <label className="lbl">Platform</label>
              <select className="fld" value={draft.socialPlatform} onChange={onField('socialPlatform')}>
                {['Instagram', 'X (Twitter)', 'TikTok', 'LinkedIn', 'Snapchat'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button onClick={publishOne} disabled={busy === 'publish'}
              className="group flex items-center gap-2 bg-ink px-5 py-3 font-display text-[14px] tracking-tight text-paper hover:bg-graphite disabled:opacity-50">
              {busy === 'publish'
                ? <><Loader2 size={15} className="animate-spin" /> {isEditing ? 'Saving…' : 'Publishing…'}</>
                : isEditing
                  ? <><Pencil size={14} /> Save changes</>
                  : <>Publish & preview <ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></>}
            </button>
            {!isEditing && (
              <button onClick={stage} disabled={busy === 'publish'}
                className="flex items-center gap-2 border border-ink px-5 py-3 font-display text-[14px] tracking-tight text-ink hover:bg-ink hover:text-paper disabled:opacity-50">
                <Plus size={15} /> Add to issue
              </button>
            )}
            {isEditing && (
              <button onClick={() => nav(`/p/${draft.id}`)}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
        </section>

        {/* QUEUE — hidden in edit mode */}
        {!isEditing && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-rule bg-white">
              <div className="flex items-center justify-between border-b border-rule px-5 py-4">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">Next Issue</div>
                  <div className="font-display text-[20px] font-400 tracking-tight">Composing…</div>
                </div>
                <div className="numeral text-[32px] font-300 text-vermillion">
                  {String(queue.length).padStart(2, '0')}
                </div>
              </div>
              {queue.length === 0
                ? <div className="px-5 py-8 text-center">
                  <p className="font-display text-[14px] italic text-muted">The roster is empty. Add personalities and they'll line up here.</p>
                </div>
                : <ul>
                  {queue.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3 border-b border-rule px-5 py-3 last:border-b-0">
                      <span className="numeral w-6 text-right text-[14px] text-muted">{i + 1}</span>
                      <div className="h-10 w-10 shrink-0 overflow-hidden bg-cream">
                        {p.photo && <img src={p.photo} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-[14px] font-500">{p.name}</div>
                        <div className="truncate font-mono text-[9.5px] uppercase tracking-widest text-muted">{p.department}</div>
                      </div>
                      <button onClick={() => setQueue(q => q.filter(x => x.id !== p.id))}
                        className="text-muted hover:text-vermillion"><Trash2 size={14} /></button>
                    </li>
                  ))}
                </ul>}
              {queue.length > 0 &&
                <button onClick={publishAll} disabled={busy.startsWith('upload')}
                  className="flex w-full items-center justify-center gap-2 border-t border-rule bg-ink py-3 font-display text-[14px] text-paper hover:bg-graphite disabled:opacity-60">
                  {busy.startsWith('upload ')
                    ? <><Loader2 size={15} className="animate-spin" /> Uploading {busy.replace('upload ', '')}</>
                    : <><Check size={15} /> Publish all {queue.length}</>}
                </button>}
            </div>

            <div className="mt-5 border border-rule p-4">
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-vermillion">From a Google Form</div>
              <p className="mt-2 font-display text-[13px] leading-relaxed text-graphite">
                Export responses to CSV with any of these column names:
                <span className="serif-italic text-muted"> Full Name, Nickname, Hobbies, Relationship, Favourite Lecturer, Easiest Level, Most Stressful Level, If not Computing, Quote, Social Handle, Department, Photo (URL).</span>
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
