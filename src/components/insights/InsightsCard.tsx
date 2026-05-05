'use client';

interface InsightsCardProps {
  type: 'pattern' | 'suggestion';
  title: string;
  description: string;
  severity?: 'positive' | 'warning' | 'info';
  priority?: 'high' | 'medium' | 'low';
}

function getSeverityStyles(severity?: 'positive' | 'warning' | 'info') {
  switch (severity) {
    case 'positive':
      return {
        border: 'border-l-green-500',
        bg: 'bg-green-50',
        iconBg: 'bg-green-100',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700',
        icon: '✅',
        label: 'Positive',
      };
    case 'warning':
      return {
        border: 'border-l-amber-500',
        bg: 'bg-amber-50',
        iconBg: 'bg-amber-100',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        icon: '⚠️',
        label: 'Needs Attention',
      };
    case 'info':
    default:
      return {
        border: 'border-l-blue-500',
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        icon: 'ℹ️',
        label: 'Info',
      };
  }
}

function getPriorityStyles(priority?: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high':
      return {
        border: 'border-l-orange-500',
        bg: 'bg-orange-50',
        iconBg: 'bg-orange-100',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-700',
        icon: '🎯',
        label: 'High Priority',
      };
    case 'medium':
      return {
        border: 'border-l-blue-500',
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        icon: '💡',
        label: 'Medium Priority',
      };
    case 'low':
    default:
      return {
        border: 'border-l-green-500',
        bg: 'bg-green-50',
        iconBg: 'bg-green-100',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700',
        icon: '✨',
        label: 'Low Priority',
      };
  }
}

export default function InsightsCard({
  type,
  title,
  description,
  severity,
  priority,
}: InsightsCardProps) {
  const styles =
    type === 'pattern'
      ? getSeverityStyles(severity)
      : getPriorityStyles(priority);

  return (
    <div
      className={`rounded-xl border border-gray-200 border-l-4 ${styles.border} ${styles.bg} p-4 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${styles.iconBg} text-lg`}
        >
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
            >
              {styles.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
