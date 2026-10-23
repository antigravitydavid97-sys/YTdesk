import { dark } from '@clerk/themes';

export type ResolvedTheme = 'light' | 'dark';

/**
 * Devuelve el objeto `appearance` para <ClerkProvider>, <SignIn />, <SignUp /> y <UserButton />
 * siguiendo las Apple Human Interface Guidelines (iOS/macOS) y el tema resuelto actual.
 */
export function getClerkAppearance(resolvedTheme: ResolvedTheme) {
  const isDark = resolvedTheme === 'dark';

  return {
    baseTheme: isDark ? dark : undefined,
    layout: {
      socialButtonsPlacement: 'top' as const,
      socialButtonsVariant: 'blockButton' as const,
      logoPlacement: 'none' as const,
      termsPageUrl: '#terminos',
      privacyPageUrl: '#privacidad',
    },
    variables: {
      colorPrimary: isDark ? '#0A84FF' : '#007AFF',
      colorBackground: isDark ? '#1C1C1E' : '#FFFFFF',
      colorText: isDark ? '#F5F5F7' : '#1D1D1F',
      colorTextSecondary: isDark ? 'rgba(235,235,245,.6)' : '#6E6E73',
      colorInputBackground: isDark
        ? 'rgba(120,120,128,.24)'
        : 'rgba(120,120,128,.12)',
      colorInputText: isDark ? '#F5F5F7' : '#1D1D1F',
      colorDanger: isDark ? '#FF453A' : '#FF3B30',
      colorSuccess: isDark ? '#30D158' : '#34C759',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, system-ui, sans-serif',
      borderRadius: '12px',
    },
    elements: {
      rootBox: 'w-full max-w-[400px] mx-auto',
      cardBox:
        'w-full max-w-[400px] rounded-none sm:rounded-[20px] bg-transparent sm:bg-[#FFFFFF] dark:sm:bg-[#2C2C2E] sm:backdrop-blur-[20px] sm:saturate-[180%] shadow-none sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border-0 overflow-hidden transition-colors duration-200',
      card: 'w-full p-0 sm:p-7 bg-transparent shadow-none border-0',
      headerTitle:
        'text-[22px] leading-[28px] font-semibold tracking-[-0.02em] text-[#1D1D1F] dark:text-[#F5F5F7]',
      headerSubtitle:
        'text-[15px] leading-[20px] text-[#6E6E73] dark:text-[rgba(235,235,245,0.6)] mt-1',
      socialButtonsBlockButton:
        'min-h-[44px] h-[44px] w-full rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] hover:bg-[rgba(120,120,128,0.18)] dark:hover:bg-[rgba(120,120,128,0.32)] border-0 shadow-none text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[15px] transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 dark:focus-visible:ring-[#0A84FF]/30',
      socialButtonsBlockButtonText:
        'font-medium text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]',
      dividerRow: 'my-5',
      dividerLine:
        'h-[0.5px] bg-[rgba(60,60,67,0.18)] dark:bg-[rgba(84,84,88,0.65)] border-0',
      dividerText:
        'text-[13px] leading-[18px] text-[#6E6E73] dark:text-[rgba(235,235,245,0.6)] px-3 font-normal',
      formFieldRow: 'mb-3.5',
      formFieldLabel:
        'text-[13px] leading-[18px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 block',
      formFieldInput:
        'min-h-[44px] h-[44px] w-full rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] border-0 px-3.5 text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[rgba(60,60,67,0.3)] dark:placeholder:text-[rgba(235,235,245,0.3)] shadow-none transition-all duration-200 focus:outline-none focus:ring-[3px] focus:ring-[#007AFF]/30 dark:focus:ring-[#0A84FF]/30',
      formButtonPrimary:
        'min-h-[44px] h-[44px] w-full rounded-[12px] bg-[#007AFF] dark:bg-[#0A84FF] hover:opacity-95 text-white font-semibold text-[15px] shadow-none border-0 transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 dark:focus-visible:ring-[#0A84FF]/30 mt-1',
      formFieldErrorText:
        'text-[13px] leading-[18px] text-[#FF3B30] dark:text-[#FF453A] mt-1.5 animate-apple-error',
      footer:
        'bg-transparent pt-4 mt-2 border-t-[0.5px] border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.65)]',
      footerActionText:
        'text-[13px] leading-[18px] text-[#6E6E73] dark:text-[rgba(235,235,245,0.6)]',
      footerActionLink:
        'text-[13px] leading-[18px] font-medium text-[#007AFF] dark:text-[#0A84FF] no-underline hover:no-underline hover:opacity-80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 rounded-[6px] px-1',
      identityPreview:
        'rounded-[12px] bg-[rgba(120,120,128,0.12)] dark:bg-[rgba(120,120,128,0.24)] border-0 px-3.5 py-2.5',
      identityPreviewText: 'text-[14px] text-[#1D1D1F] dark:text-[#F5F5F7]',
      identityPreviewEditButton:
        'text-[13px] font-medium text-[#007AFF] dark:text-[#0A84FF] no-underline',
      userButtonBox: 'flex items-center',
      userButtonTrigger:
        'rounded-full focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 dark:focus-visible:ring-[#0A84FF]/30',
      userButtonAvatarBox: 'h-8 w-8 rounded-full',
      userButtonPopoverCard:
        'rounded-[20px] bg-[#FFFFFF]/88 dark:bg-[#2C2C2E]/88 backdrop-blur-[20px] saturate-[180%] border-[0.5px] border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.65)] shadow-[0_20px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.70)] overflow-hidden',
      userButtonPopoverMain: 'bg-transparent',
      userButtonPopoverActions: 'border-t-[0.5px] border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.65)]',
      userButtonPopoverActionButton:
        'min-h-[44px] rounded-[10px] px-4 text-[14px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[rgba(120,120,128,0.12)] dark:hover:bg-[rgba(120,120,128,0.24)] transition-colors',
      userButtonPopoverActionButtonText:
        'text-[14px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]',
      userButtonPopoverActionButtonIcon:
        'text-[#6E6E73] dark:text-[rgba(235,235,245,0.6)]',
      userButtonPopoverFooter:
        'border-t-[0.5px] border-[rgba(60,60,67,0.18)] dark:border-[rgba(84,84,88,0.65)]',
    },
  };
}
