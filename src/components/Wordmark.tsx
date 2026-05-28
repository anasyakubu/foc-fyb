import { Link } from 'react-router-dom';
import BukLogo from './BukLogo';

export default function Wordmark({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <BukLogo size={36} />
      <div className="leading-tight">
        <div className="font-display text-[18px] font-500 tracking-tightest text-ink">
          The Class <span className="serif-italic text-vermillion">Quarterly</span>
        </div>
        {subtitle && <div className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-muted">Faculty of Computing · BUK '22</div>}
      </div>
    </Link>
  );
}
