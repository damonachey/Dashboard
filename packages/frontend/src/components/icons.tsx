// Inline SVGs rather than Unicode glyphs — some fonts render pencil/lock-style
// characters as colored emoji, which ignores text-color CSS entirely.

export function PencilIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
      />
    </svg>
  );
}

export function LockClosedIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5a4.5 4.5 0 0 0-4.5 4.5v3h-.75A2.25 2.25 0 0 0 4.5 11.25v8.25a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-8.25a2.25 2.25 0 0 0-2.25-2.25h-.75V6a4.5 4.5 0 0 0-4.5-4.5Zm3 8.25V6a3 3 0 1 0-6 0v3.75h6Z"
      />
    </svg>
  );
}

export function LockOpenIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18 1.5a4.5 4.5 0 0 0-4.5 4.5v3H6.75A2.25 2.25 0 0 0 4.5 11.25v8.25a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-8.25a2.25 2.25 0 0 0-2.25-2.25h-6V6a3 3 0 1 1 6 0v2.25a.75.75 0 0 0 1.5 0V6a4.5 4.5 0 0 0-4.5-4.5Z" />
    </svg>
  );
}
