import {
  Channel,
  ContentFormat,
  ContentItem,
  FormatTemplate,
  Platform,
  Priority,
  Stage,
  SubStage,
} from '../types';

export const PLATFORMS: { id: Platform; label: string; defaultFormat: ContentFormat }[] = [
  { id: 'youtube', label: 'YouTube', defaultFormat: 'video largo' },
  { id: 'tiktok', label: 'TikTok', defaultFormat: 'tiktok' },
  { id: 'instagram', label: 'Instagram', defaultFormat: 'reel' },
];

export const FORMATS: { id: ContentFormat; label: string; platforms: Platform[] }[] = [
  { id: 'video largo', label: 'Video largo', platforms: ['youtube'] },
  { id: 'short', label: 'Short', platforms: ['youtube'] },
  { id: 'reel', label: 'Reel', platforms: ['instagram'] },
  { id: 'tiktok', label: 'TikTok', platforms: ['tiktok'] },
  { id: 'carrusel', label: 'Carrusel', platforms: ['instagram', 'tiktok'] },
  { id: 'story', label: 'Story', platforms: ['instagram', 'tiktok', 'youtube'] },
  { id: 'post', label: 'Post', platforms: ['instagram', 'youtube'] },
];

export const STAGES: { id: Stage; label: string; description: string }[] = [
  { id: 'idea', label: 'Idea', description: 'Banco de conceptos y captura inicial' },
  { id: 'proceso', label: 'En Proceso', description: 'Guion, rodaje, edición y programación' },
  { id: 'publicado', label: 'Publicado', description: 'Contenido en vivo con enlace y métricas' },
];

export const SUB_STAGES: { id: SubStage; label: string }[] = [
  { id: 'guion', label: 'Guion' },
  { id: 'grabación', label: 'Grabación' },
  { id: 'edición', label: 'Edición' },
  { id: 'programado', label: 'Programado' },
];

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: 'alta', label: 'Alta' },
  { id: 'media', label: 'Media' },
  { id: 'baja', label: 'Baja' },
];

export const CHANNEL_COLORS = [
  '#FF3B30', // Rojo de sistema
  '#FF9500', // Naranja de sistema
  '#FFCC00', // Amarillo de sistema
  '#34C759', // Verde de sistema
  '#007AFF', // Azul de sistema
  '#5856D6', // Índigo de sistema
  '#AF52DE', // Morado de sistema
  '#FF2D55', // Rosa de sistema
];

export const DEFAULT_FORMAT_TEMPLATES: FormatTemplate[] = [
  {
    formato: 'video largo',
    tareas: [
      'Investigación y ángulo diferencial',
      'Escribir guion y gancho (primeros 30s)',
      'Grabar vídeo principal y B-roll',
      'Edición narrativa y diseño sonoro',
      'Diseñar miniatura A/B y título SEO',
      'Subir, añadir capítulos y pantallas finales',
    ],
  },
  {
    formato: 'short',
    tareas: [
      'Definir gancho visual (0-3 segundos)',
      'Redactar guion de menos de 50 segundos',
      'Grabación vertical 9:16',
      'Edición dinámica y subtítulos',
      'Seleccionar audio o música de fondo',
    ],
  },
  {
    formato: 'reel',
    tareas: [
      'Definir gancho en primera frase',
      'Grabar clips verticales con buena iluminación',
      'Edición con cortes rápidos y subtítulos limpios',
      'Elegir portada para el feed 4:5',
      'Redactar copy y hashtags estratégicos',
    ],
  },
  {
    formato: 'tiktok',
    tareas: [
      'Identificar tendencia o pregunta clave de la audiencia',
      'Grabar toma directa y natural',
      'Añadir texto nativo en pantalla y subtítulos',
      'Revisión de retención y bucle final',
    ],
  },
  {
    formato: 'carrusel',
    tareas: [
      'Estructurar historia en 7-10 diapositivas',
      'Diseñar portada de alto impacto (Slide 1)',
      'Desarrollar contenido visual por lámina',
      'Añadir diapositiva final de resumen + CTA (Guardar/Compartir)',
      'Escribir pie de publicación detallado',
    ],
  },
  {
    formato: 'story',
    tareas: [
      'Definir objetivo (interacción, enlace o detrás de cámaras)',
      'Grabar o diseñar secuencia de 3 historias',
      'Añadir sticker de encuesta, caja de preguntas o link',
    ],
  },
  {
    formato: 'post',
    tareas: [
      'Seleccionar fotografía o gráfico principal',
      'Redactar reflexión o micro-artículo de valor',
      'Añadir pregunta final para impulsar comentarios',
    ],
  },
];

// Helper para fechas relativas al día actual de forma consistente
function offsetDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_SAMPLE_CHANNELS: Channel[] = [
  {
    id: 'ch-yt-main',
    nombre: 'Estudio Tech & Código',
    plataforma: 'youtube',
    handle: '@estudiotech',
    color: '#FF3B30',
    creadoEn: offsetDate(-30),
  },
  {
    id: 'ch-tt-clips',
    nombre: 'Tech en 60 Segundos',
    plataforma: 'tiktok',
    handle: '@techen60s',
    color: '#007AFF',
    creadoEn: offsetDate(-25),
  },
  {
    id: 'ch-ig-design',
    nombre: 'Diseño & Producto UI',
    plataforma: 'instagram',
    handle: '@disenoproducto.ui',
    color: '#AF52DE',
    creadoEn: offsetDate(-20),
  },
];

export const INITIAL_SAMPLE_ITEMS: ContentItem[] = [
  {
    id: 'item-1',
    channelId: 'ch-yt-main',
    titulo: 'Arquitectura Frontend Moderna: De Monolito a Micro-módulos en React',
    descripcion: 'Guía práctica comparando estado global, capas de servicio y patrones escalables en producción.',
    formato: 'video largo',
    etapa: 'proceso',
    subEtapa: 'edición',
    prioridad: 'alta',
    fechaPlanificada: offsetDate(2),
    etiquetas: ['arquitectura', 'react', 'typescript'],
    checklist: [
      { id: 'ck-101', texto: 'Investigación y ángulo diferencial', hecho: true },
      { id: 'ck-102', texto: 'Escribir guion y gancho (primeros 30s)', hecho: true },
      { id: 'ck-103', texto: 'Grabar vídeo principal y B-roll', hecho: true },
      { id: 'ck-104', texto: 'Edición narrativa y diseño sonoro', hecho: false },
      { id: 'ck-105', texto: 'Diseñar miniatura A/B y título SEO', hecho: false },
      { id: 'ck-106', texto: 'Subir, añadir capítulos y pantallas finales', hecho: false },
    ],
    notas: 'Mostrar el diagrama de capas en el minuto 02:15. Enlazar repositorio de ejemplo en la descripción.',
    orden: 0,
    creadoEn: offsetDate(-7),
  },
  {
    id: 'item-2',
    channelId: 'ch-tt-clips',
    titulo: '3 atajos de VS Code que ahorran 4 horas a la semana',
    descripcion: 'Demostración rápida con pantalla dividida y teclado mecánico en vivo.',
    formato: 'tiktok',
    etapa: 'proceso',
    subEtapa: 'programado',
    prioridad: 'media',
    fechaPlanificada: offsetDate(1),
    etiquetas: ['vscode', 'productividad', 'setup'],
    checklist: [
      { id: 'ck-201', texto: 'Identificar tendencia o pregunta clave de la audiencia', hecho: true },
      { id: 'ck-202', texto: 'Grabar toma directa y natural', hecho: true },
      { id: 'ck-203', texto: 'Añadir texto nativo en pantalla y subtítulos', hecho: true },
      { id: 'ck-204', texto: 'Revisión de retención y bucle final', hecho: true },
    ],
    notas: 'El bucle conecta la última frase con el inicio. Listo para publicar mañana a las 19:00.',
    orden: 1,
    creadoEn: offsetDate(-5),
  },
  {
    id: 'item-3',
    channelId: 'ch-ig-design',
    titulo: '7 reglas de jerarquía tipográfica para interfaces en modo oscuro',
    descripcion: 'Desglose visual de pesos, contraste óptico y números tabulares en dashboards.',
    formato: 'carrusel',
    etapa: 'proceso',
    subEtapa: 'guion',
    prioridad: 'alta',
    fechaPlanificada: offsetDate(-2), // Vencida intencionalmente para mostrar alerta en Dashboard
    etiquetas: ['ui', 'tipografia', 'darkmode'],
    checklist: [
      { id: 'ck-301', texto: 'Estructurar historia en 7-10 diapositivas', hecho: true },
      { id: 'ck-302', texto: 'Diseñar portada de alto impacto (Slide 1)', hecho: true },
      { id: 'ck-303', texto: 'Desarrollar contenido visual por lámina', hecho: false },
      { id: 'ck-304', texto: 'Añadir diapositiva final de resumen + CTA (Guardar/Compartir)', hecho: false },
      { id: 'ck-305', texto: 'Escribir pie de publicación detallado', hecho: false },
    ],
    notas: 'Comparar lado a lado números proporcionales vs tabular-nums en la diapositiva 5.',
    orden: 2,
    creadoEn: offsetDate(-6),
  },
  {
    id: 'item-4',
    channelId: 'ch-yt-main',
    titulo: 'Cómo configurar tu entorno local de IA sin pagar suscripciones',
    descripcion: 'Comparativa de consumo de RAM, velocidad de inferencia e integración con el editor.',
    formato: 'video largo',
    etapa: 'idea',
    prioridad: 'alta',
    fechaPlanificada: offsetDate(6),
    etiquetas: ['ia', 'herramientas', 'tutorial'],
    checklist: [
      { id: 'ck-401', texto: 'Investigación y ángulo diferencial', hecho: true },
      { id: 'ck-402', texto: 'Escribir guion y gancho (primeros 30s)', hecho: false },
      { id: 'ck-403', texto: 'Grabar vídeo principal y B-roll', hecho: false },
      { id: 'ck-404', texto: 'Edición narrativa y diseño sonoro', hecho: false },
    ],
    notas: 'Probar en portátil de 16GB para que sea realista para la mayoría de suscriptores.',
    orden: 0,
    creadoEn: offsetDate(-4),
  },
  {
    id: 'item-5',
    channelId: 'ch-ig-design',
    titulo: 'Antes y después: Rediseñando una pantalla de checkout saturada',
    descripcion: 'Vídeo corto mostrando el proceso en Figma paso a paso en 45 segundos.',
    formato: 'reel',
    etapa: 'idea',
    prioridad: 'media',
    fechaPlanificada: offsetDate(4),
    etiquetas: ['figma', 'rediseño', 'ux'],
    checklist: [
      { id: 'ck-501', texto: 'Definir gancho en primera frase', hecho: false },
      { id: 'ck-502', texto: 'Grabar clips verticales con buena iluminación', hecho: false },
      { id: 'ck-503', texto: 'Edición con cortes rápidos y subtítulos limpios', hecho: false },
    ],
    notas: 'Empezar directamente con el diseño final durante 1.5s antes de explicar los cambios.',
    orden: 1,
    creadoEn: offsetDate(-3),
  },
  {
    id: 'item-6',
    channelId: 'ch-tt-clips',
    titulo: 'Por qué tu CSS Grid se rompe en móviles (El truco de minmax)',
    descripcion: 'Explicación de 30 segundos sobre overflow en columnas flexibles.',
    formato: 'tiktok',
    etapa: 'idea',
    prioridad: 'baja',
    fechaPlanificada: offsetDate(8),
    etiquetas: ['css', 'frontend', 'webdev'],
    checklist: [
      { id: 'ck-601', texto: 'Identificar tendencia o pregunta clave de la audiencia', hecho: true },
      { id: 'ck-602', texto: 'Grabar toma directa y natural', hecho: false },
    ],
    notas: 'Usar ejemplo real de tarjeta con texto largo sin truncar.',
    orden: 2,
    creadoEn: offsetDate(-2),
  },
  {
    id: 'item-7',
    channelId: 'ch-yt-main',
    titulo: 'Mi sistema de productividad para publicar en 3 redes sin quemarme',
    descripcion: 'Recorrido completo por nuestro flujo de reutilización de contenido y plantillas.',
    formato: 'video largo',
    etapa: 'publicado',
    prioridad: 'alta',
    fechaPlanificada: offsetDate(-5),
    fechaPublicacion: offsetDate(-5),
    url: 'https://youtube.com/watch?v=contentflow-demo',
    etiquetas: ['productividad', 'creadores', 'workflow'],
    checklist: [
      { id: 'ck-701', texto: 'Investigación y ángulo diferencial', hecho: true },
      { id: 'ck-702', texto: 'Escribir guion y gancho (primeros 30s)', hecho: true },
      { id: 'ck-703', texto: 'Grabar vídeo principal y B-roll', hecho: true },
      { id: 'ck-704', texto: 'Edición narrativa y diseño sonoro', hecho: true },
      { id: 'ck-705', texto: 'Diseñar miniatura A/B y título SEO', hecho: true },
      { id: 'ck-706', texto: 'Subir, añadir capítulos y pantallas finales', hecho: true },
    ],
    notas: 'Gran CTR en las primeras 24 horas (8.4%). Sacar 2 shorts adicionales de la sección 3.',
    orden: 0,
    creadoEn: offsetDate(-12),
  },
  {
    id: 'item-8',
    channelId: 'ch-ig-design',
    titulo: 'Guía rápida de espaciado 8pt en sistemas de diseño',
    descripcion: 'Resumen visual para guardar y tener a mano al maquetar componentes.',
    formato: 'short',
    etapa: 'publicado',
    prioridad: 'media',
    fechaPlanificada: offsetDate(-3),
    fechaPublicacion: offsetDate(-3),
    url: 'https://instagram.com/p/contentflow-ui-grid',
    etiquetas: ['ui', 'sistemas', 'figma'],
    checklist: [
      { id: 'ck-801', texto: 'Definir gancho visual (0-3 segundos)', hecho: true },
      { id: 'ck-802', texto: 'Redactar guion de menos de 50 segundos', hecho: true },
      { id: 'ck-803', texto: 'Grabación vertical 9:16', hecho: true },
      { id: 'ck-804', texto: 'Edición dinámica y subtítulos', hecho: true },
    ],
    notas: 'Más de 420 guardados en las primeras 48h.',
    orden: 1,
    creadoEn: offsetDate(-9),
  },
];
