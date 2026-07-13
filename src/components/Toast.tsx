import { useEffect } from 'react';

export default function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 6000);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-lg"
    >
      {message}
    </div>
  );
}
