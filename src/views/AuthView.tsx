import React, { useState, useEffect } from 'react';
import {
  ClerkLoaded,
  ClerkLoading,
  SignIn,
  SignUp,
} from '@clerk/clerk-react';
import {
  Layers,
  Sun,
  Moon,
  ArrowLeft,
  Lock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { useResolvedTheme } from '../utils/themeUtils';
import { getClerkAppearance } from '../utils/clerkAppearance';
import { IS_CLERK_CONFIGURED } from '../components/ClerkAuthSection';
import { PlatformIcon } from '../components/PlatformIcon';

export type AuthMode = 'sign-in' | 'sign-up';

interface AuthViewProps {
  initialMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onBackToApp?: () => void;
}

/**
 * Skeleton con shimmer sutil mientras Clerk se inicializa (<ClerkLoading>)
 */
export const AuthCardSkeleton: React.FC = () => {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando formulario de acceso"
      className="w-full max-w-[400px] mx-auto rounded-none sm:rounded-[20px] bg-transparent sm:bg-[var(--surface)] dark:sm:bg-[var(--surface-elevated)] p-0 sm:p-7 shadow-none sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none space-y-4"
    >
      {/* Botones sociales skeleton */}
      <div className="space-y-2.5">
        <div className="apple-shimmer h-[44px] w-full rounded-[12px]" />
        <div className="apple-shimmer h-[44px] w-full rounded-[12px]" />
      </div>

      {/* Separador "o" */}
      <div className="flex items-center gap-3 py-2">
        <div className="h-[0.5px] flex-1 bg-[var(--separator)]" />
        <div className="apple-shimmer h-3 w-4 rounded" />
        <div className="h-[0.5px] flex-1 bg-[var(--separator)]" />
      </div>

      {/* Campos de formulario skeleton */}
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <div className="apple-shimmer h-3.5 w-28 rounded-[6px]" />
          <div className="apple-shimmer h-[44px] w-full rounded-[12px]" />
        </div>
        <div className="space-y-1.5">
          <div className="apple-shimmer h-3.5 w-24 rounded-[6px]" />
          <div className="apple-shimmer h-[44px] w-full rounded-[12px]" />
        </div>
      </div>

      {/* Botón primario skeleton */}
      <div className="apple-shimmer h-[44px] w-full rounded-[12px] mt-2" />

      {/* Pie skeleton */}
      <div className="pt-4 hairline-t flex flex-col items-center gap-2">
        <div className="apple-shimmer h-3.5 w-44 rounded-[6px]" />
        <div className="apple-shimmer h-3 w-28 rounded-[6px]" />
      </div>
    </div>
  );
};

/**
 * Panel derecho en escritorio ancho (>1024px):
 * Mini maqueta estilizada en CSS del tablero Kanban (Idea / Proceso / Publicado),
 * ligeramente inclinada y con fundido suave en los bordes.
 */
const KanbanStylizedMockup: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center p-8 select-none overflow-hidden"
    >
      {/* Máscara con fundido en los bordes */}
      <div
        className="w-full max-w-[600px] -rotate-[2deg] transform transition-transform duration-500 hover:rotate-0"
        style={{
          WebkitMaskImage:
            'radial-gradient(ellipse 92% 88% at 50% 50%, #000 68%, transparent 100%)',
          maskImage:
            'radial-gradient(ellipse 92% 88% at 50% 50%, #000 68%, transparent 100%)',
        }}
      >
        {/* Ventana estilo macOS */}
        <div
          className="rounded-[20px] bg-[var(--surface)]/90 dark:bg-[var(--surface)]/95 hairline-border p-5 backdrop-blur-xl"
          style={{ boxShadow: 'var(--sheet-shadow)' }}
        >
          {/* Barra superior de la ventana maqueta */}
          <div className="flex items-center justify-between pb-4 hairline-b">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF3B30]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFCC00]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#34C759]/80" />
              <span className="ml-2 hig-caption font-semibold text-[var(--label)]">
                ContentFlow — Tablero Kanban
              </span>
            </div>
            <div className="inline-flex rounded-[8px] bg-[var(--fill)] p-0.5 hig-caption">
              <span className="rounded-[6px] bg-[var(--surface)] px-2.5 py-0.5 font-medium text-[var(--label)] shadow-2xs">
                Kanban
              </span>
              <span className="px-2.5 py-0.5 text-[var(--label-2)]">
                Calendario
              </span>
              <span className="px-2.5 py-0.5 text-[var(--label-2)]">Lista</span>
            </div>
          </div>

          {/* 3 Columnas Kanban en miniatura (Idea / Proceso / Publicado) */}
          <div className="mt-4 grid grid-cols-3 gap-3.5">
            {/* Columna 1: Idea */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--sys-orange)' }}
                  />
                  <span className="hig-caption font-semibold text-[var(--label)]">
                    Idea
                  </span>
                </div>
                <span className="font-mono tabular-nums hig-caption text-[var(--label-2)]">
                  3
                </span>
              </div>

              <div className="rounded-[14px] bg-[var(--surface-2)] dark:bg-[var(--surface-elevated)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--label-2)]">
                  <span className="h-2 w-2 rounded-full bg-[#FF3B30]" />
                  <PlatformIcon platform="youtube" className="h-3 w-3" />
                  <span className="truncate font-medium">Estudio Tech</span>
                </div>
                <p className="text-[12px] leading-[16px] font-semibold text-[var(--label)]">
                  Entorno local de IA sin suscripciones
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[var(--label-2)]">
                  <span>Video largo</span>
                  <span>·</span>
                  <span style={{ color: 'var(--sys-red)' }}>Alta</span>
                </div>
              </div>

              <div className="rounded-[14px] bg-[var(--surface-2)] dark:bg-[var(--surface-elevated)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--label-2)]">
                  <span className="h-2 w-2 rounded-full bg-[#AF52DE]" />
                  <PlatformIcon platform="instagram" className="h-3 w-3" />
                  <span className="truncate font-medium">Diseño UI</span>
                </div>
                <p className="text-[12px] leading-[16px] font-semibold text-[var(--label)]">
                  Rediseño de pantalla de checkout en 45s
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[var(--label-2)]">
                  <span>Reel</span>
                  <span>·</span>
                  <span style={{ color: 'var(--sys-orange)' }}>Media</span>
                </div>
              </div>
            </div>

            {/* Columna 2: En Proceso */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--sys-blue)' }}
                  />
                  <span className="hig-caption font-semibold text-[var(--label)]">
                    Proceso
                  </span>
                </div>
                <span className="font-mono tabular-nums hig-caption text-[var(--label-2)]">
                  2
                </span>
              </div>

              <div className="rounded-[14px] bg-[var(--surface-2)] dark:bg-[var(--surface-elevated)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--label-2)]">
                  <span className="h-2 w-2 rounded-full bg-[#FF3B30]" />
                  <PlatformIcon platform="youtube" className="h-3 w-3" />
                  <span className="truncate font-medium">Estudio Tech</span>
                </div>
                <p className="text-[12px] leading-[16px] font-semibold text-[var(--label)]">
                  Arquitectura Frontend Modular en React
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[var(--label-2)]">
                  <span style={{ color: 'var(--sys-blue)' }}>Edición</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">3/6</span>
                </div>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill)]">
                  <div
                    className="h-full w-1/2 rounded-full"
                    style={{ backgroundColor: 'var(--sys-blue)' }}
                  />
                </div>
              </div>

              <div className="rounded-[14px] bg-[var(--surface-2)] dark:bg-[var(--surface-elevated)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--label-2)]">
                  <span className="h-2 w-2 rounded-full bg-[#007AFF]" />
                  <PlatformIcon platform="tiktok" className="h-3 w-3" />
                  <span className="truncate font-medium">Tech en 60s</span>
                </div>
                <p className="text-[12px] leading-[16px] font-semibold text-[var(--label)]">
                  3 atajos de VS Code imprescindibles
                </p>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill)]">
                  <div
                    className="h-full w-4/5 rounded-full"
                    style={{ backgroundColor: 'var(--sys-blue)' }}
                  />
                </div>
              </div>
            </div>

            {/* Columna 3: Publicado */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--sys-green)' }}
                  />
                  <span className="hig-caption font-semibold text-[var(--label)]">
                    Publicado
                  </span>
                </div>
                <span className="font-mono tabular-nums hig-caption text-[var(--label-2)]">
                  2
                </span>
              </div>

              <div className="rounded-[14px] bg-[var(--surface-2)] dark:bg-[var(--surface-elevated)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--label-2)]">
                  <span className="h-2 w-2 rounded-full bg-[#FF3B30]" />
                  <PlatformIcon platform="youtube" className="h-3 w-3" />
                  <span className="truncate font-medium">Estudio Tech</span>
                </div>
                <p className="text-[12px] leading-[16px] font-semibold text-[var(--label)]">
                  Sistema para publicar en 3 redes sin quemarse
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className="inline-flex items-center gap-1 font-medium"
                    style={{ color: 'var(--sys-green)' }}
                  >
                    <CheckCircle2 strokeWidth={1.75} className="h-3 w-3" />
                    <span>6/6 listo</span>
                  </span>
                  <span className="font-mono tabular-nums text-[var(--label-2)]">
                    18 oct
                  </span>
                </div>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill)]">
                  <div
                    className="h-full w-full rounded-full"
                    style={{ backgroundColor: 'var(--sys-green)' }}
                  />
                </div>
              </div>

              <div className="rounded-[14px] bg-[var(--surface-2)] dark:bg-[var(--surface-elevated)] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--label-2)]">
                  <span className="h-2 w-2 rounded-full bg-[#AF52DE]" />
                  <PlatformIcon platform="instagram" className="h-3 w-3" />
                  <span className="truncate font-medium">Diseño UI</span>
                </div>
                <p className="text-[12px] leading-[16px] font-semibold text-[var(--label)]">
                  Guía de espaciado 8pt en sistemas de diseño
                </p>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill)]">
                  <div
                    className="h-full w-full rounded-full"
                    style={{ backgroundColor: 'var(--sys-green)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Tarjeta interactiva con el mismo sistema de clases de getClerkAppearance
 * cuando aún no se ha inyectado VITE_CLERK_PUBLISHABLE_KEY en el entorno de previsualización,
 * garantizando que el diseño de /sign-in y /sign-up se vea y funcione al 100%.
 */
const PreviewAppleClerkCard: React.FC<{
  mode: AuthMode;
  onToggleMode: (m: AuthMode) => void;
  onContinueLocal?: () => void;
}> = ({ mode, onToggleMode, onContinueLocal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSkeletonPreview, setShowSkeletonPreview] = useState(false);

  useEffect(() => {
    setValidationError(null);
  }, [mode]);

  if (showSkeletonPreview) {
    return (
      <div className="space-y-3">
        <AuthCardSkeleton />
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowSkeletonPreview(false)}
            className="hig-caption font-medium text-[var(--accent)] hover:underline"
          >
            Ocultar vista previa de carga (ClerkLoading)
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setValidationError(
        'Introduce una dirección de correo electrónico válida.'
      );
      return;
    }
    if (password.length < 8) {
      setValidationError(
        'La contraseña debe contener al menos 8 caracteres.'
      );
      return;
    }
    setValidationError(null);
    onContinueLocal?.();
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="w-full max-w-[400px] rounded-none sm:rounded-[20px] bg-transparent sm:bg-[#FFFFFF] dark:sm:bg-[#2C2C2E] sm:backdrop-blur-[20px] sm:saturate-[180%] shadow-none sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-0 overflow-hidden transition-colors duration-200">
        <div className="w-full p-0 sm:p-7">
          {/* Botones Sociales (44px, radio 12px, fondo --fill, sin borde) */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onContinueLocal?.()}
              className="min-h-[44px] h-[44px] w-full flex items-center justify-center gap-2.5 rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] hover:bg-[rgba(120,120,128,0.18)] dark:hover:bg-[rgba(120,120,128,0.32)] border-0 shadow-none text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[15px] transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 dark:focus-visible:ring-[#0A84FF]/30"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>Continuar con Apple</span>
            </button>

            <button
              type="button"
              onClick={() => onContinueLocal?.()}
              className="min-h-[44px] h-[44px] w-full flex items-center justify-center gap-2.5 rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] hover:bg-[rgba(120,120,128,0.18)] dark:hover:bg-[rgba(120,120,128,0.32)] border-0 shadow-none text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[15px] transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 dark:focus-visible:ring-[#0A84FF]/30"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>

          {/* Separador "o" con línea de 0.5px en --separator */}
          <div className="my-5 flex items-center">
            <div className="h-[0.5px] flex-1 bg-[rgba(60,60,67,0.18)] dark:bg-[rgba(84,84,88,0.65)]" />
            <span className="px-3 text-[13px] leading-[18px] text-[#6E6E73] dark:text-[rgba(235,235,245,0.6)]">
              o
            </span>
            <div className="h-[0.5px] flex-1 bg-[rgba(60,60,67,0.18)] dark:bg-[rgba(84,84,88,0.65)]" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {mode === 'sign-up' && (
              <div>
                <label
                  htmlFor="auth-fullname"
                  className="text-[13px] leading-[18px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 block"
                >
                  Nombre completo
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  autoFocus
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  className="min-h-[44px] h-[44px] w-full rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] border-0 px-3.5 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[rgba(60,60,67,0.3)] dark:placeholder:text-[rgba(235,235,245,0.3)] shadow-none transition-all duration-200 focus:outline-none focus:ring-[3px] focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="text-[13px] leading-[18px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 block"
              >
                Correo electrónico
              </label>
              <input
                id="auth-email"
                type="email"
                autoFocus={mode === 'sign-in'}
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="nombre@ejemplo.com"
                className="min-h-[44px] h-[44px] w-full rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] border-0 px-3.5 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[rgba(60,60,67,0.3)] dark:placeholder:text-[rgba(235,235,245,0.3)] shadow-none transition-all duration-200 focus:outline-none focus:ring-[3px] focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="text-[13px] leading-[18px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 block"
              >
                Contraseña
              </label>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="••••••••"
                className="min-h-[44px] h-[44px] w-full rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] border-0 px-3.5 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[rgba(60,60,67,0.3)] dark:placeholder:text-[rgba(235,235,245,0.3)] shadow-none transition-all duration-200 focus:outline-none focus:ring-[3px] focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30"
              />
            </div>

            {validationError && (
              <p
                role="alert"
                className="animate-apple-error flex items-center gap-1.5 text-[13px] leading-[18px] text-[#FF3B30] dark:text-[#FF453A] mt-1.5"
              >
                <AlertCircle strokeWidth={1.75} className="h-3.5 w-3.5 shrink-0" />
                <span>{validationError}</span>
              </p>
            )}

            <button
              type="submit"
              className="min-h-[44px] h-[44px] w-full rounded-[12px] bg-[#007AFF] dark:bg-[#0A84FF] hover:opacity-95 text-white font-semibold text-[15px] shadow-none border-0 transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 dark:focus-visible:ring-[#0A84FF]/30 mt-1"
            >
              {mode === 'sign-in' ? 'Continuar' : 'Crear cuenta'}
            </button>
          </form>

          {/* Pie de tarjeta con enlace en --accent sin subrayado y firma de Clerk intacta */}
          <div className="bg-transparent pt-4 mt-5 border-t-[0.5px] border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.65)] text-center space-y-3">
            <p className="text-[13px] leading-[18px] text-[#6E6E73] dark:text-[rgba(235,235,245,0.6)]">
              {mode === 'sign-in'
                ? '¿No tienes una cuenta?'
                : '¿Ya tienes una cuenta?'}{' '}
              <button
                type="button"
                onClick={() =>
                  onToggleMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
                }
                className="text-[13px] leading-[18px] font-medium text-[#007AFF] dark:text-[#0A84FF] no-underline hover:no-underline hover:opacity-80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 rounded-[6px] px-1"
              >
                {mode === 'sign-in' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>

            <div className="flex items-center justify-center gap-3 text-[12px] text-[#6E6E73] dark:text-[rgba(235,235,245,0.6)]">
              <a
                href="#terminos"
                onClick={(e) => e.preventDefault()}
                className="text-[#007AFF] dark:text-[#0A84FF] no-underline hover:opacity-80"
              >
                Términos
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="#privacidad"
                onClick={(e) => e.preventDefault()}
                className="text-[#007AFF] dark:text-[#0A84FF] no-underline hover:opacity-80"
              >
                Privacidad
              </a>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setShowSkeletonPreview(true)}
                className="text-[#007AFF] dark:text-[#0A84FF] no-underline hover:opacity-80"
              >
                Ver Skeleton
              </button>
            </div>

            {/* Pie oficial de Clerk sin ocultar */}
            <div className="flex items-center justify-center gap-1.5 pt-1 text-[12px] font-medium text-[#6E6E73] dark:text-[rgba(235,235,245,0.45)]">
              <Lock strokeWidth={1.75} className="h-3 w-3" />
              <span>Secured by Clerk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'sign-in',
  onModeChange,
  onBackToApp,
}) => {
  const themePreference = useContentStore((s) => s.themePreference);
  const setThemePreference = useContentStore((s) => s.setThemePreference);
  const resolvedTheme = useResolvedTheme(themePreference);

  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleModeSwitch = (nextMode: AuthMode) => {
    setMode(nextMode);
    onModeChange?.(nextMode);
    try {
      window.history.pushState({}, '', nextMode === 'sign-up' ? '/sign-up' : '/sign-in');
    } catch {}
  };

  const toggleResolvedTheme = () => {
    setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const clerkAppearance = React.useMemo(
    () => getClerkAppearance(resolvedTheme),
    [resolvedTheme]
  );

  return (
    <div className="apple-auth-ambient-bg relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden text-[var(--label)]">
      {/* Barra superior discreta: Volver a la app (si aplica) y selector de tema Sol/Luna en esquina superior derecha */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-4 sm:px-8 sm:pt-6">
        <div>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="apple-press apple-focus inline-flex min-h-[44px] items-center gap-1.5 rounded-[12px] bg-[var(--fill)] px-3.5 py-2 hig-footnote font-medium text-[var(--label)] hover:bg-[var(--fill-hover)]"
            >
              <ArrowLeft strokeWidth={1.75} className="h-4 w-4 text-[var(--accent)]" />
              <span>Volver al tablero</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={toggleResolvedTheme}
          className="apple-press apple-focus flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-hover)]"
          aria-label={
            resolvedTheme === 'dark'
              ? 'Cambiar a modo claro'
              : 'Cambiar a modo oscuro'
          }
          title={
            resolvedTheme === 'dark'
              ? 'Cambiar a modo claro'
              : 'Cambiar a modo oscuro'
          }
        >
          {resolvedTheme === 'dark' ? (
            <Sun strokeWidth={1.75} className="h-4 w-4" />
          ) : (
            <Moon strokeWidth={1.75} className="h-4 w-4" />
          )}
        </button>
      </header>

      {/* Cuerpo principal: 1 columna en móvil/tablet, 2 columnas en escritorio ancho (>1024px) */}
      <main className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-12 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-10">
        {/* Columna izquierda: Icono 64px, Large Title, Subtítulo y Tarjeta de Clerk */}
        <div className="animate-apple-auth-entry flex flex-col items-center justify-center lg:col-span-6">
          <div className="w-full max-w-[400px] text-center mb-6">
            {/* Icono de la app: cuadrado redondeado de 64px con esquinas continuas y símbolo de lucide-react */}
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] text-white shadow-sm"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Layers strokeWidth={1.75} className="h-8 w-8" />
            </div>

            {/* Large Title (34px, bold, letter-spacing -0.02em) */}
            <h1 className="hig-large-title text-balance text-[var(--label)]">
              Bienvenido a ContentFlow
            </h1>

            {/* Subtítulo en --label-2 */}
            <p className="mt-2 hig-subhead text-balance text-[var(--label-2)]">
              Organiza el contenido de YouTube, TikTok e Instagram en un solo lugar
            </p>

            {/* Conmutador rápido /sign-in y /sign-up */}
            <div
              className="mt-5 inline-flex rounded-[10px] bg-[var(--fill)] p-1"
              role="tablist"
              aria-label="Seleccionar inicio de sesión o registro"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'sign-in'}
                onClick={() => handleModeSwitch('sign-in')}
                className={`apple-press apple-focus min-h-[34px] rounded-[8px] px-4 py-1 hig-footnote font-medium transition-all ${
                  mode === 'sign-in'
                    ? 'bg-[var(--surface)] text-[var(--label)] shadow-2xs'
                    : 'text-[var(--label-2)] hover:text-[var(--label)]'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'sign-up'}
                onClick={() => handleModeSwitch('sign-up')}
                className={`apple-press apple-focus min-h-[34px] rounded-[8px] px-4 py-1 hig-footnote font-medium transition-all ${
                  mode === 'sign-up'
                    ? 'bg-[var(--surface)] text-[var(--label)] shadow-2xs'
                    : 'text-[var(--label-2)] hover:text-[var(--label)]'
                }`}
              >
                Crear cuenta
              </button>
            </div>
          </div>

          {/* Tarjeta de Clerk (<SignIn /> / <SignUp />) con <ClerkLoading> Skeleton */}
          <div className="w-full max-w-[400px]">
            {IS_CLERK_CONFIGURED ? (
              <>
                <ClerkLoading>
                  <AuthCardSkeleton />
                </ClerkLoading>
                <ClerkLoaded>
                  {mode === 'sign-in' ? (
                    <SignIn
                      appearance={clerkAppearance}
                      routing="virtual"
                    />
                  ) : (
                    <SignUp
                      appearance={clerkAppearance}
                      routing="virtual"
                    />
                  )}
                </ClerkLoaded>
              </>
            ) : (
              <PreviewAppleClerkCard
                mode={mode}
                onToggleMode={handleModeSwitch}
                onContinueLocal={onBackToApp}
              />
            )}
          </div>
        </div>

        {/* Columna derecha (>1024px): Panel con mini maqueta estilizada del tablero Kanban */}
        <div className="hidden lg:col-span-6 lg:flex lg:items-center lg:justify-center">
          <KanbanStylizedMockup />
        </div>
      </main>

      <div className="h-4" />
    </div>
  );
};
