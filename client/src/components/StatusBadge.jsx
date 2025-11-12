import React from 'react';

const statusConfig = {
  draft: { label: 'Draft', className: 'badge-pending' },
  sent: { label: 'Sent', className: 'badge-info' },
  signed: { label: 'Signed', className: 'badge-success' },
  active: { label: 'Active', className: 'badge-success' },
  completed: { label: 'Completed', className: 'badge-pending' },
  cancelled: { label: 'Cancelled', className: 'badge-error' },
  pending: { label: 'Pending', className: 'badge-warning' },
  inactive: { label: 'Inactive', className: 'badge-pending' },
  approved: { label: 'Approved', className: 'badge-success' },
  rejected: { label: 'Rejected', className: 'badge-error' }
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'badge-pending' };
  
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
