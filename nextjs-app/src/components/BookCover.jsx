import { useState } from 'react';
import { IconBookCover } from './Icons';

/**
 * Kitob muqovasi: cover_url bo'lsa rasm, xato bo'lsa yoki bo'lmasa gradient + ikonka.
 * size: 'sm' | 'md' | 'lg'
 */
export default function BookCover({ coverUrl, size = 'md', alt = '', className = '' }) {
  const [error, setError] = useState(false);
  const sizeMap = {
    sm: { width: 52, height: 70, icon: 24 },
    md: { width: 140, height: 'auto', aspectRatio: '2/3', icon: 40 },
    lg: { width: 160, height: 220, icon: 64 },
    cover: { width: '100%', height: '100%', objectFit: 'cover', icon: 48 },
  };
  const s = sizeMap[size];
  const style = {
    width: s.width,
    ...(s.height && { height: s.height }),
    ...(s.aspectRatio && { aspectRatio: s.aspectRatio }),
    ...(s.objectFit && { objectFit: s.objectFit }),
  };

  const showImage = coverUrl && !error;

  if (showImage) {
    return (
      <img
        src={coverUrl}
        alt={alt}
        className={`book-cover book-cover--img ${className}`}
        style={style}
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
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
