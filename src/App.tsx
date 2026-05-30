import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Gallery from './pages/Gallery';
import View from './pages/View';
import SetupScreen from './components/SetupScreen';
import { isConfigured } from './lib/supabase';

export default function App() {
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-paper">
        <SetupScreen />
      </div>
    );
  }
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-paper">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/p/:id" element={<View />} />
        </Routes>
        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 font-mono text-[10px] tracking-[0.22em] uppercase text-muted">
            <span>The Class Quarterly</span>
            <span className="serif-italic normal-case tracking-normal text-ink">a small press for FOC · BUK '22</span>
            <span>© Set of 2022</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
