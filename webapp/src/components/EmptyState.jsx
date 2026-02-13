import { IconEmptyBook } from './Icons';

/**
 * Bo'sh holat: ikonka + matn. children orqali qo'shimcha (masalan, CTA) berish mumkin.
 */
export default function EmptyState({ icon: Icon = IconEmptyBook, message, children, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__icon" aria-hidden>
        <Icon />
      </div>
      <p className="empty-state__text">{message}</p>
      {children && <div className="empty-state__action">{children}</div>}
    </div>
  );
}
