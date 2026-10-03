const SHAPES = [
  { icon: '➕', style: { left: '6%', top: '12%', animationDelay: '0s' } },
  { icon: '✖️', style: { left: '88%', top: '18%', animationDelay: '1.2s' } },
  { icon: '➗', style: { left: '12%', top: '72%', animationDelay: '2.1s' } },
  { icon: 'π', style: { left: '82%', top: '68%', animationDelay: '0.6s' } },
  { icon: '√', style: { left: '48%', top: '88%', animationDelay: '3s' } },
  { icon: '％', style: { left: '70%', top: '6%', animationDelay: '1.8s' } },
];

export default function FunBackground() {
  return (
    <div className="fun-bg" aria-hidden>
      {SHAPES.map(s => (
        <span key={s.icon} style={s.style}>
          {s.icon}
        </span>
      ))}
    </div>
  );
}
