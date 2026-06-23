type Props = { value: number; scale: number };

export default function Gauge({ value, scale }: Props) {
  const cx = 150, cy = 150, R = 120;
  const safeScale = scale > 0 ? scale : 1;
  const t = Math.max(-1, Math.min(1, value / safeScale)); // -1..1
  const theta = (90 - t * 90) * (Math.PI / 180);
  const tipX = cx + R * Math.cos(theta);
  const tipY = cy - R * Math.sin(theta);

  const eur = (n: number) =>
    n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const positivo = value >= 0;

  return (
    <svg viewBox="0 0 300 190" className="w-full max-w-sm mx-auto">
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth="22" strokeLinecap="round"
      />

      <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke="#111827" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="6" fill="#111827" />

      <text x={cx} y={cy - 30} textAnchor="middle" fontSize="22" fontWeight="600"
        fill={positivo ? "#16a34a" : "#dc2626"}>{eur(value)}</text>

      <text x={cx - R} y={cy + 24} textAnchor="middle" fontSize="13" fill="#6b7280">HELL</text>
      <text x={cx + R} y={cy + 24} textAnchor="middle" fontSize="13" fill="#6b7280">PARADISE</text>
    </svg>
  );
}