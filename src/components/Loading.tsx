export default function Loading({ label = 'Setting type' }: { label?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">{label}…</div>
      <div className="mx-auto mt-4 h-px w-24 bg-rule">
        <div className="h-px w-1/3 animate-[slide_1.4s_ease-in-out_infinite] bg-ink" />
      </div>
      <style>{`@keyframes slide { 0%{transform:translateX(0);width:25%} 50%{transform:translateX(200%);width:60%} 100%{transform:translateX(400%);width:25%} }`}</style>
    </div>
  );
}
