import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { authenticate } from '../lib/auth';
import BukLogo from './BukLogo';

export default function Passcode({ onPass }: { onPass: () => void }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticate(code)) onPass();
    else { setErr(true); setCode(''); setTimeout(() => setErr(false), 600); }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center"><BukLogo size={48} /></div>
          <div className="mt-5 font-mono text-[10px] tracking-[0.22em] uppercase text-muted">The Editor's Desk</div>
          <h1 className="mt-2 font-display text-[34px] font-400 leading-tight tracking-tightest">
            Pass through, <span className="serif-italic text-vermillion">please.</span>
          </h1>
          <p className="mt-2 font-display text-[15px] italic text-muted">A small word from the class is required.</p>
        </div>
        <form onSubmit={submit} className={err ? 'animate-[shake_.4s]' : ''}>
          <label className="lbl">Passcode</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            placeholder="● ● ● ● ● ● ● ●"
            className="fld text-center font-display text-[20px] tracking-[0.35em]"
          />
          {err && <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-vermillion">Not quite. Try again.</p>}
          <button type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 border border-ink bg-ink px-5 py-3 font-display text-[14px] tracking-tight text-paper transition hover:bg-graphite">
            Open the desk <ArrowRight size={15} />
          </button>
          <p className="mt-5 text-center font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted">Session-only access</p>
        </form>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
    </div>
  );
}
