import React from 'react';

function EmptyState({ title = 'Nothing here yet', subtitle = 'There is no data to display.', action = null, icon = null }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="mb-4">
        {icon ? (
          <div className="text-primary-600 dark:text-primary-400">{icon}</div>
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <span className="text-lg">✦</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}

export default EmptyState;
