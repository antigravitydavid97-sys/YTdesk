import { useEffect, useState } from 'react';
import { ThemePreference } from '../types';

export function resolveThemeValue(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export function applyThemeToDOM(preference: ThemePreference): 'light' | 'dark' {
  const resolved = resolveThemeValue(preference);
  const isDark = resolved === 'dark';

  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  const meta = document.getElementById('meta-theme-color');
  if (meta) {
    meta.setAttribute('content', isDark ? '#000000' : '#F5F5F7');
  }

  return resolved;
}

export function useResolvedTheme(preference: ThemePreference): 'light' | 'dark' {
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    resolveThemeValue(preference)
  );

  useEffect(() => {
    const nextResolved = applyThemeToDOM(preference);
    setResolved(nextResolved);

    if (preference !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const updated = applyThemeToDOM('auto');
      setResolved(updated);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  return resolved;
}

export function useAppleThemeSync(preference: ThemePreference) {
  useResolvedTheme(preference);
}
