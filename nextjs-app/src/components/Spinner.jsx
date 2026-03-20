export default function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  return (
    <span className={`spinner ${className}`} role="status" aria-label="Yuklanmoqda">
      <span className="spinner__inner" style={{ width: s, height: s }} />
    </span>
  );
}
