export default function StatCard({ label, value, sub, icon, accent = false }) {
  return (
    <div className={`rounded-xl p-5 flex items-center gap-4 shadow-sm border ${accent ? 'bg-fade-dark border-fade-dark text-white' : 'bg-white border-gray-100'}`}>
      {icon && (
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/15' : 'bg-fade-light'}`}>
          <span className={`text-2xl ${accent ? 'text-white' : 'text-fade-blue'}`}>{icon}</span>
        </div>
      )}
      <div>
        <p className={`text-sm font-medium ${accent ? 'text-white/75' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-3xl font-bold leading-none mt-0.5 ${accent ? 'text-white' : 'text-fade-dark'}`}>{value}</p>
        {sub && <p className={`text-xs mt-1 ${accent ? 'text-white/60' : 'text-gray-400'}`}>{sub}</p>}
      </div>
    </div>
  )
}
