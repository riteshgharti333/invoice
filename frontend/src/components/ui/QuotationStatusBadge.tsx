import type { QuotationStatus } from '../../types';

const styles: Record<QuotationStatus, { bg: string; text: string; dot: string; label: string }> = {
  DRAFT: { bg: 'bg-slate-100', text: 'text-text-secondary', dot: 'bg-slate-400', label: 'Draft' },
  SENT: { bg: 'bg-brand-light', text: 'text-brand', dot: 'bg-brand', label: 'Sent' },
  APPROVED: { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success', label: 'Approved' },
  REJECTED: { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger', label: 'Rejected' },
  EXPIRED: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Expired' },
};

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
}

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  const style = styles[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}