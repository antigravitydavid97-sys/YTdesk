import { useEffect } from 'react';
import { ThemePreference } from '../types';

export function applyThemeToDOM(preference: ThemePreference): boolean {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark =
    preference === 'dark' || (preference === 'auto' && mediaQuery.matches);

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

  return isDark;
}

export function useAppleThemeSync(preference: ThemePreference) {
  useEffect(() => {
    applyThemeToDOM(preference);

    if (preference !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyThemeToDOM('auto');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);
}
