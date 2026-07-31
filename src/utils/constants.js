export const SECTORES = [
  'Agricultura y alimentación',
  'Automoción y componentes',
  'Construcción e inmobiliario',
  'Distribución y logística',
  'Energía y medioambiente',
  'Hostelería y turismo',
  'Industria manufacturera',
  'Informática y tecnología',
  'Metal y siderurgia',
  'Química y farmacia',
  'Retail y comercio',
  'Salud y bienestar',
  'Servicios profesionales',
  'Textil y moda',
  'Otro',
]

export const PROVINCIAS = [
  'Asturias',
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Ávila',
  'Badajoz', 'Baleares', 'Barcelona', 'Burgos',
  'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'A Coruña', 'Cuenca',
  'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa',
  'Huelva', 'Huesca',
  'Jaén',
  'León', 'Lleida', 'La Rioja', 'Lugo',
  'Madrid', 'Málaga', 'Murcia',
  'Navarra',
  'Ourense',
  'Palencia', 'Las Palmas', 'Pontevedra',
  'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
  'Tarragona', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya',
  'Zamora', 'Zaragoza',
  'Ceuta', 'Melilla',
]

export const ESTADOS_EMPRESA = [
  { value: 'captado',         label: 'Captado',             color: 'blue'   },
  { value: 'en_proceso',      label: 'En proceso',          color: 'orange' },
  { value: 'cerrado_exito',   label: 'Cerrado con éxito',   color: 'green'  },
  { value: 'cerrado_fracaso', label: 'Cerrado sin acuerdo', color: 'red'    },
  { value: 'descartado',      label: 'Descartado',          color: 'gray'   },
]

export const ESTADOS_COMPRADOR = [
  { value: 'activo',     label: 'Activo',     color: 'green'  },
  { value: 'en_proceso', label: 'En proceso', color: 'orange' },
  { value: 'cerrado',    label: 'Cerrado',    color: 'gray'   },
]

export const ESTADOS_MATCH = [
  { value: 'sugerido',       label: 'Sugerido',         color: 'blue'   },
  { value: 'presentado',     label: 'Presentado',       color: 'yellow' },
  { value: 'reunidos',       label: 'Reunidos',         color: 'orange' },
  { value: 'en_negociacion', label: 'En negociación',   color: 'purple' },
  { value: 'cerrado_exito',  label: 'Cerrado con éxito',color: 'green'  },
  { value: 'descartado',     label: 'Descartado',       color: 'gray'   },
]

export const TIPOS_COMPRADOR = [
  { value: 'pe',             label: 'Private Equity'       },
  { value: 'family_office',  label: 'Family Office'        },
  { value: 'industrial',     label: 'Comprador industrial' },
  { value: 'mbo',            label: 'MBO / Directivos'     },
  { value: 'privado',        label: 'Inversor privado'     },
  { value: 'otro',           label: 'Otro'                 },
]

export const MOTIVOS_VENTA = [
  'Jubilación / sucesión familiar',
  'Diversificación de patrimonio',
  'Búsqueda de socio estratégico',
  'Cambio de actividad',
  'Otro',
]

export const PORCENTAJES_VENTA = [
  '100%',
  'Mayoría (>50%)',
  'Minoría (<50%)',
  'A negociar',
]

export const CONFIDENCIALIDAD = [
  { value: 'anonimo',      label: 'Anónimo (sin NDA)'  },
  { value: 'nda_pendiente',label: 'NDA pendiente'      },
  { value: 'nda_firmado',  label: 'NDA firmado'        },
]
