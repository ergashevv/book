/**
 * Skeleton placeholder: width/height optional, class for variants.
 */
export function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden
    />
  );
}

/** Gorizontal scroll qatorida 3 ta continue-card skeleton */
export function SkeletonContinueRow({ count = 3 }) {
  return (
    <div className="continue-scroll">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="continue-card skeleton-card">
          <Skeleton className="skeleton-card__cover" height={100} />
          <div className="skeleton-card__body">
            <Skeleton height={14} style={{ width: '90%', marginBottom: 6 }} />
            <Skeleton height={12} style={{ width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Kitoblar ro'yxati skeleton */
export function SkeletonBookList({ count = 5 }) {
  return (
    <div className="book-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="book-card skeleton-card" style={{ cursor: 'default' }}>
          <Skeleton width={52} height={70} className="skeleton-book-cover" />
          <div className="book-card__body">
            <Skeleton height={16} style={{ width: '80%', marginBottom: 8 }} />
            <Skeleton height={14} style={{ width: '50%', marginBottom: 6 }} />
            <Skeleton height={12} style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bitta kitob detali (cover + title + btn) skeleton */
export function SkeletonBookDetail() {
  return (
    <div className="book-detail">
      <Skeleton width={160} height={220} className="skeleton-detail-cover" />
      <Skeleton height={24} style={{ width: '80%', margin: '0 auto 12px' }} />
      <Skeleton height={18} style={{ width: '50%', margin: '0 auto 24px' }} />
      <Skeleton height={48} style={{ width: 160, margin: '0 auto', borderRadius: 10 }} />
    </div>
  );
}
