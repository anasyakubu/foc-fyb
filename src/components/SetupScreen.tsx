import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import BukLogo from './BukLogo';

const ENV_SAMPLE = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`;

export default function SetupScreen() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(ENV_SAMPLE);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <div className="flex justify-center"><BukLogo size={48} /></div>
        <div className="mt-5 font-mono text-[10px] tracking-[0.22em] uppercase text-muted">Setup Required</div>
        <h1 className="mt-2 font-display text-[42px] font-400 leading-tight tracking-tightest">
          A quiet word before <span className="serif-italic text-vermillion">we print.</span>
        </h1>
        <p className="mt-3 font-display text-[16px] italic text-muted">
          Connect a Supabase project so the archive has somewhere to live.
        </p>
      </div>

      <ol className="mt-10 space-y-7 border-t border-rule pt-8">
        <Step n={1} title="Make a Supabase project">
          Free at <a className="underline decoration-vermillion decoration-2 underline-offset-4" href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>. Takes about two minutes.
          <a href="https://supabase.com/dashboard/new" target="_blank" rel="noreferrer"
             className="mt-3 inline-flex items-center gap-1.5 border border-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink hover:bg-ink hover:text-paper">
            New project <ExternalLink size={11} />
          </a>
        </Step>

        <Step n={2} title="Run the schema">
          In your project: <span className="serif-italic">SQL Editor → New query →</span> paste the contents of
          <code className="mx-1 bg-cream px-1.5 py-0.5 text-[13px]">supabase-schema.sql</code> (in this repo) → <span className="serif-italic">Run</span>.
          <br />This creates the <code className="bg-cream px-1.5 py-0.5 text-[13px]">people</code> table and the
          <code className="mx-1 bg-cream px-1.5 py-0.5 text-[13px]">portraits</code> storage bucket.
        </Step>

        <Step n={3} title="Copy your API credentials">
          <span className="serif-italic">Project Settings → API.</span> Copy the <strong>Project URL</strong> and the <strong>anon / public</strong> key.
        </Step>

        <Step n={4} title="Create a .env file">
          In the project root, create a file called <code className="bg-cream px-1.5 py-0.5 text-[13px]">.env</code> with these two lines:
          <div className="mt-3 flex items-start gap-2">
            <pre className="flex-1 overflow-x-auto rounded-sm bg-ink px-4 py-3 font-mono text-[12px] leading-6 text-paper">{ENV_SAMPLE}</pre>
            <button onClick={copy}
              className="flex items-center gap-1.5 border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite hover:border-ink">
              <Copy size={11} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </Step>

        <Step n={5} title="Restart the dev server">
          Stop and run <code className="bg-cream px-1.5 py-0.5 text-[13px]">npm run dev</code> again so Vite picks up the new env vars.
        </Step>
      </ol>

      <p className="mt-10 border-t border-rule pt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        Once that's done, the archive opens automatically.
      </p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-4">
      <div className="numeral text-[32px] font-300 leading-none text-vermillion">{String(n).padStart(2, '0')}</div>
      <div>
        <h3 className="font-display text-[20px] font-400 tracking-tight text-ink">{title}</h3>
        <div className="mt-2 font-display text-[15px] leading-relaxed text-graphite">{children}</div>
      </div>
    </li>
  );
}
