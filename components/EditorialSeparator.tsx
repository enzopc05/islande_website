'use client';

interface EditorialSeparatorProps {
  text?: string;
  dayNumber?: number;
}

export default function EditorialSeparator({ text, dayNumber }: EditorialSeparatorProps) {
  return (
    <div className="editorial-separator">
      <div className="editorial-separator-content">
        {dayNumber && (
          <span className="flex items-center gap-3">
            <span className="text-[var(--basalt-ash)]">Jour</span>
            <span className="text-2xl font-display font-bold text-[var(--warm-copper)]">{dayNumber}</span>
            {text && <span className="text-[var(--basalt-ash)]">•</span>}
          </span>
        )}
        {text && !dayNumber && <span>{text}</span>}
      </div>
    </div>
  );
}
