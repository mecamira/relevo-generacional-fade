const COLOR_MAP = {
  blue:   'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-800',
}

export default function Badge({ label, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${COLOR_MAP[color] || COLOR_MAP.gray} ${className}`}>
      {label}
    </span>
  )
}
