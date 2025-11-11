import React from 'react';

const statusConfig = {
  draft: { label: 'Draft', className: 'badge-gray' },
  sent: { label: 'Sent', className: 'badge-info' },
  signed: { label: 'Signed', className: 'badge-success' },
  active: { label: 'Active', className: 'badge-success' },
  completed: { label: 'Completed', className: 'badge-gray' },
  cancelled: { label: 'Cancelled', className: 'badge-danger' },
  pending: { label: 'Pending', className: 'badge-warning' },
  inactive: { label: 'Inactive', className: 'badge-gray' }
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'badge-gray' };
  
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
