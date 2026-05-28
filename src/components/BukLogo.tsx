export default function BukLogo({ size = 32, color = '#1a1816' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bayero University Kano">
      <circle cx="32" cy="32" r="30.5" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="0.6" fill="none" />
      {/* open book */}
      <path d="M32 26c-4-2.4-9-3-13-2.5v16c4-.6 9 0 13 2.5 4-2.5 9-3.1 13-2.5V23.5c-4-.5-9 .1-13 2.5z"
            stroke={color} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
      <path d="M32 26v16" stroke={color} strokeWidth="0.9" />
      {/* rays */}
      <g stroke={color} strokeWidth="0.9" strokeLinecap="round">
        <path d="M32 10v4M22 13l1.5 3.6M42 13l-1.5 3.6M14 22l3.5 1.7M50 22l-3.5 1.7" />
      </g>
      <text x="32" y="56" textAnchor="middle" fill={color} fontFamily="serif" fontStyle="italic" fontSize="7.5" letterSpacing="0.5">B · U · K</text>
    </svg>
  );
}
