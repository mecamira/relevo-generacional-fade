export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
