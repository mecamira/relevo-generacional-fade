const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fade-blue focus:border-transparent text-sm'

let _seq = Date.now()
function nextId() { return String(++_seq) }

export default function ContactosEditor({ value = [], onChange }) {
  function addContacto() {
    onChange([...value, { _id: nextId(), nombre: '', email: '', telefono: '', rol: '' }])
  }

  function updateContacto(idx, field, val) {
    onChange(value.map((c, i) => i === idx ? { ...c, [field]: val } : c))
  }

  function removeContacto(idx) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      {value.map((c, idx) => (
        <div key={c._id || String(idx)} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg relative">
          {value.length > 1 && (
            <button
              type="button"
              onClick={() => removeContacto(idx)}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors"
              title="Eliminar contacto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre</label>
            <input className={inp} value={c.nombre} onChange={e => updateContacto(idx, 'nombre', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cargo / Rol</label>
            <input className={inp} value={c.rol} onChange={e => updateContacto(idx, 'rol', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
            <input className={inp} type="email" value={c.email} onChange={e => updateContacto(idx, 'email', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teléfono</label>
            <input className={inp} type="tel" value={c.telefono} onChange={e => updateContacto(idx, 'telefono', e.target.value)} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addContacto}
        className="px-3 py-1.5 bg-fade-light text-fade-blue text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Añadir contacto
      </button>
    </div>
  )
}
