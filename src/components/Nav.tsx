import { Link, useLocation } from 'react-router-dom';
import Wordmark from './Wordmark';

export default function Nav() {
  const { pathname } = useLocation();
  const item = (to: string, label: string) => {
    const active = pathname === to || (to !== '/' && pathname.startsWith(to));
    return (
      <Link to={to}
        className={`relative font-display text-[15px] tracking-tight transition ${active ? 'text-ink' : 'text-muted hover:text-ink'}`}>
        {label}
        {active && <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-vermillion" />}
      </Link>
    );
  };
  return (
    <header className="border-b border-rule bg-paper/90 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Wordmark />
        <nav className="flex items-center gap-7">
          {item('/', 'Home')}
          {item('/gallery', 'Archive')}
          {item('/admin', 'Editor')}
        </nav>
      </div>
    </header>
  );
}
