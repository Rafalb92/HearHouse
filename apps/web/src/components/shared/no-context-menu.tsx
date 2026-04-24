'use client';

export function NoContextMenu({ className }: { className?: string }) {
  return (
    <div className={className} onContextMenu={(e) => e.preventDefault()} />
  );
}
