import { forwardRef } from 'react';
import { type Person, FACULTY, SCHOOL, SET } from '../lib/types';
import BukLogo from './BukLogo';

const formatIssue = (n: number) => `№ ${String(n).padStart(3, '0')}`;

export const FybCard = forwardRef<HTMLDivElement, { person: Person }>(({ person }, ref) => {
  return (
    <div
      ref={ref}
      className="relative w-[760px] font-body text-ink"
      style={{
        backgroundColor: '#faf7f2',
        color: '#1a1816',
        boxShadow: '0 40px 80px -40px rgba(26,24,22,0.25), 0 0 0 1px rgba(26,24,22,0.06)',
      }}
    >
      <div className="relative px-12 pb-10 pt-8">
        {/* MASTHEAD */}
        <div className="flex items-end justify-between border-b border-ink pb-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">{SCHOOL} · {SET}</div>
            <div className="mt-1 font-display text-[42px] font-400 leading-none tracking-tightest">
              The Class <span className="serif-italic text-vermillion">Quarterly</span>
            </div>
          </div>
          <BukLogo size={48} />
        </div>

        {/* DATELINE STRIP */}
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
          <span>{FACULTY}</span>
          <span className="numeral text-ink">{formatIssue(person.issue || 1)}</span>
          <span>Personality of the Week</span>
        </div>

        <div className="rule mt-2" />

        {/* COVER LINE */}
        <div className="mt-7 grid grid-cols-12 gap-8">
          <div className="col-span-7">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-vermillion">Cover Story</div>
            <h1 className="mt-3 font-display text-[64px] font-300 leading-[0.95] tracking-tightest text-ink">
              {person.name ? person.name.split(' ').slice(0, 2).join(' ') : 'A Name'},
              <span className="serif-italic font-400"> in their</span>
              <br />own words.
            </h1>
            {person.quote && (
              <p className="mt-5 font-display text-[20px] font-300 italic leading-snug text-graphite">
                &ldquo;{person.quote}&rdquo;
              </p>
            )}
            <div className="mt-5 font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              An interview · {person.department || 'Computing'}
            </div>
          </div>

          {/* PORTRAIT */}
          <div className="col-span-5">
            <div className="relative">
              <div className="aspect-[3/4] w-full overflow-hidden bg-cream">
                {person.photo
                  ? <img src={person.photo} alt={person.name} className="h-full w-full object-cover" style={{ filter: 'contrast(1.02) saturate(0.95)' }} crossOrigin="anonymous" />
                  : <div className="flex h-full items-center justify-center font-mono text-xs text-muted">— portrait —</div>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted">Plate {formatIssue(person.issue || 1)}</div>
                <div className="font-display text-[12px] italic text-vermillion">portrait</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rule-ink mt-9" />

        {/* DETAIL GRID */}
        <div className="mt-7 grid grid-cols-12 gap-x-8 gap-y-7">
          <Detail label="Name" value={person.name} primary />
          <Detail label="Also Known As" value={person.nickname ? `'${person.nickname}'` : '—'} />
          <Detail label="Department" value={person.department} />

          <Detail label="Hobbies" value={person.hobbies} wide />
          <Detail label="Relationship" value={person.relationship} />
          <Detail label="Favourite Lecturer" value={person.favLecturer || 'NIL'} />

          <Detail label="Easiest Level" value={person.easiestLevel} />
          <Detail label="Most Stressful" value={person.stressfulLevel} />
          <Detail label="If Not Computing" value={person.ifNotCS} />

          <Detail label={person.socialPlatform} value={person.social ? `@${person.social.replace(/^@/, '')}` : '—'} wide />
        </div>

        <div className="rule mt-9" />

        {/* COLOPHON */}
        <div className="mt-4 flex items-center justify-between font-mono text-[9.5px] tracking-[0.2em] uppercase text-muted">
          <span>Printed at Kano · Set of 2022</span>
          <span className="serif-italic normal-case tracking-normal text-ink">Final Year Brethren</span>
          <span>Volume I · {formatIssue(person.issue || 1)}</span>
        </div>
      </div>
    </div>
  );
});
FybCard.displayName = 'FybCard';

function Detail({ label, value, primary, wide }: { label: string; value: string; primary?: boolean; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-6' : 'col-span-4'}>
      <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted">{label}</div>
      <div className={primary
        ? 'mt-1.5 font-display text-[22px] font-400 leading-tight tracking-tight text-ink'
        : 'mt-1.5 font-display text-[16px] font-400 leading-snug text-ink'}>
        {value || '—'}
      </div>
    </div>
  );
}
