import type { InvoiceStatus } from '../../types';

const styles: Record<InvoiceStatus, { bg: string; text: string; dot: string; label: string }> = {
  DRAFT: { bg: 'bg-slate-100', text: 'text-text-secondary', dot: 'bg-slate-400', label: 'Draft' },
  SENT: { bg: 'bg-brand-light', text: 'text-brand', dot: 'bg-brand', label: 'Sent' },
  PARTIALLY_PAID: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Partially Paid' },
  PAID: { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success', label: 'Paid' },
  OVERDUE: { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger', label: 'Overdue' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-text-muted', dot: 'bg-slate-300', label: 'Cancelled' },
};

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = styles[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}