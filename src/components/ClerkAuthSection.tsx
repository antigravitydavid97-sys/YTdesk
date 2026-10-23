import React, { useEffect } from 'react';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { esES } from '@clerk/localizations';
import { UserCircle2, LogIn } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { useResolvedTheme } from '../utils/themeUtils';
import { getClerkAppearance } from '../utils/clerkAppearance';
import { AuthMode } from '../views/AuthView';

const RAW_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
export const IS_CLERK_CONFIGURED =
  RAW_KEY.startsWith('pk_test_') || RAW_KEY.startsWith('pk_live_');

/**
 * Sincroniza el ID del usuario autenticado en Clerk con storageService y Zustand
 */
const ClerkSessionSync: React.FC = () => {
  const { user, isLoaded } = useUser();
  const syncUserSession = useContentStore((s) => s.syncUserSession);

  useEffect(() => {
    if (!isLoaded) return;
    syncUserSession(user?.id ?? null);
  }, [isLoaded, user?.id, syncUserSession]);

  return null;
};

/**
 * Proveedor raíz que envuelve la aplicación con <ClerkProvider> usando
 * localization={esES} y getClerkAppearance(resolvedTheme) reactivo al tema actual.
 */
export const AppClerkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themePreference = useContentStore((s) => s.themePreference);
  const resolvedTheme = useResolvedTheme(themePreference);

  const appearance = React.useMemo(
    () => getClerkAppearance(resolvedTheme),
    [resolvedTheme]
  );

  if (!IS_CLERK_CONFIGURED) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={RAW_KEY}
      afterSignOutUrl="/"
      localization={esES}
      appearance={appearance}
    >
      <ClerkSessionSync />
      {children}
    </ClerkProvider>
  );
};

interface AuthTriggerProps {
  onOpenAuthScreen: (mode?: AuthMode) => void;
}

/**
 * Control de cuenta para la barra lateral estilo macOS Ajustes / Apple ID:
 * Avatar de 32px y menú con el mismo material, radio y colores.
 */
const ActiveClerkSidebarProfile: React.FC<AuthTriggerProps> = ({
  onOpenAuthScreen,
}) => {
  const { user } = useUser();
  const themePreference = useContentStore((s) => s.themePreference);
  const resolvedTheme = useResolvedTheme(themePreference);
  const appearance = React.useMemo(
    () => getClerkAppearance(resolvedTheme),
    [resolvedTheme]
  );

  return (
    <div className="rounded-[12px] bg-[var(--fill)] p-2.5">
      <SignedIn>
        <div className="flex items-center gap-2.5">
          <UserButton appearance={appearance} />
          <div className="min-w-0 flex-1">
            <p className="truncate hig-footnote font-semibold text-[var(--label)]">
              {user?.fullName || user?.firstName || 'Cuenta activa'}
            </p>
            <p className="truncate hig-caption text-[var(--label-2)]">
              {user?.primaryEmailAddress?.emailAddress || 'Sesión iniciada'}
            </p>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <UserCircle2
              strokeWidth={1.75}
              className="h-8 w-8 shrink-0 text-[var(--label-2)]"
            />
            <div className="min-w-0">
              <p className="truncate hig-footnote font-semibold text-[var(--label)]">
                Invitado
              </p>
              <p className="truncate hig-caption text-[var(--label-2)]">
                Sin iniciar sesión
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuthScreen('sign-in')}
            className="apple-press apple-focus min-h-[34px] rounded-[8px] bg-[var(--accent)] px-3 py-1 hig-caption font-semibold text-white whitespace-nowrap shrink-0"
          >
            Entrar
          </button>
        </div>
      </SignedOut>
    </div>
  );
};

/**
 * Control de cuenta para la cabecera superior
 */
const ActiveClerkHeaderControl: React.FC<AuthTriggerProps> = ({
  onOpenAuthScreen,
}) => {
  const themePreference = useContentStore((s) => s.themePreference);
  const resolvedTheme = useResolvedTheme(themePreference);
  const appearance = React.useMemo(
    () => getClerkAppearance(resolvedTheme),
    [resolvedTheme]
  );

  return (
    <div className="flex items-center gap-2 shrink-0">
      <SignedOut>
        <button
          type="button"
          onClick={() => onOpenAuthScreen('sign-in')}
          className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
        >
          <LogIn strokeWidth={1.75} className="h-4 w-4 text-[var(--accent)]" />
          <span>Iniciar sesión</span>
        </button>
      </SignedOut>

      <SignedIn>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fill)]">
          <UserButton appearance={appearance} />
        </div>
      </SignedIn>
    </div>
  );
};

export const SidebarAuthProfile: React.FC<AuthTriggerProps> = ({
  onOpenAuthScreen,
}) => {
  if (IS_CLERK_CONFIGURED) {
    return <ActiveClerkSidebarProfile onOpenAuthScreen={onOpenAuthScreen} />;
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-[12px] bg-[var(--fill)] p-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <UserCircle2
          strokeWidth={1.75}
          className="h-8 w-8 shrink-0 text-[var(--label-2)]"
        />
        <div className="min-w-0">
          <p className="truncate hig-footnote font-semibold text-[var(--label)]">
            Acceso a cuenta
          </p>
          <p className="truncate hig-caption text-[var(--label-2)]">
            Login / Registro
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpenAuthScreen('sign-in')}
        className="apple-press apple-focus min-h-[34px] rounded-[8px] bg-[var(--accent)] px-3 py-1 hig-caption font-semibold text-white whitespace-nowrap shrink-0"
      >
        Entrar
      </button>
    </div>
  );
};

export const HeaderAuthControl: React.FC<AuthTriggerProps> = ({
  onOpenAuthScreen,
}) => {
  if (IS_CLERK_CONFIGURED) {
    return <ActiveClerkHeaderControl onOpenAuthScreen={onOpenAuthScreen} />;
  }

  return (
    <button
      type="button"
      onClick={() => onOpenAuthScreen('sign-in')}
      className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
      aria-label="Abrir pantalla de acceso"
    >
      <LogIn strokeWidth={1.75} className="h-4 w-4 text-[var(--accent)]" />
      <span className="hidden sm:inline">Iniciar sesión</span>
    </button>
  );
};
