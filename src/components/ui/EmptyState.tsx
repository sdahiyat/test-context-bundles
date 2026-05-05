'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface ActionWithClick {
  label: string;
  onClick: () => void;
}

interface ActionWithHref {
  label: string;
  href: string;
}

type Action = ActionWithClick | ActionWithHref;

function isHrefAction(action: Action): action is ActionWithHref {
  return 'href' in action;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: Action;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && (
        <>
          {isHrefAction(action) ? (
            <Link
              href={action.href}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}
