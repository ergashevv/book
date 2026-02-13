import { IconBookCover } from './Icons';

/**
 * Kitob muqovasi: cover_url bo'lsa rasm, aks holda gradient + ikonka.
 * size: 'sm' | 'md' | 'lg'
 */
export default function BookCover({ coverUrl, size = 'md', alt = '', className = '' }) {
  const sizeMap = {
    sm: { width: 52, height: 70, icon: 24 },
    md: { width: 140, height: 'auto', aspectRatio: '2/3', icon: 40 },
    lg: { width: 160, height: 220, icon: 64 },
  };
  const s = sizeMap[size];
  const style = {
    width: s.width,
    ...(s.height && { height: s.height }),
    ...(s.aspectRatio && { aspectRatio: s.aspectRatio }),
  };

  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={alt}
        className={`book-cover book-cover--img ${className}`}
        style={style}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div
      className={`book-cover book-cover--placeholder ${className}`}
      style={style}
      aria-hidden
    >
      <IconBookCover style={{ width: s.icon, height: s.icon }} />
    </div>
  );
}
