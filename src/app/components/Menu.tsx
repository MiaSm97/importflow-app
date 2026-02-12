'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMenu } from '@/lib/context/MenuContext';
import { redirectToSection } from '@/lib/navigation';
import { Sections } from '@/lib/types/types';
import { useTranslations } from 'next-intl';

export default function Menu({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { optionsMenu } = useMenu();

  const tabs = useMemo(() => {
    if (optionsMenu.tabs && optionsMenu.tabs.length > 0) {
      return optionsMenu.tabs;
    }

    return [
      {
        label: t(Sections.DASHBOARD),
        onClick: () => redirectToSection(router, Sections.DASHBOARD),
        selected: pathname === '/dashboard',
      },
      {
        label: t(Sections.IMPORTS),
        onClick: () => redirectToSection(router, Sections.IMPORTS),
        selected: pathname.startsWith('/imports'),
      },
    ];
  }, [optionsMenu.tabs, pathname, router, t]);

  return (
    <>
      <header className="flex border-b-custom bg-white shadow-sm">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-8 sm:py-0">
          <h1 className="text-[20px] font-medium sm:py-4 sm:text-[22px]">
            {optionsMenu.title}
          </h1>
          <nav className="flex flex-wrap gap-2 pb-1 sm:gap-6 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={tab.onClick}
                type="button"
                className={`my-0 cursor-pointer whitespace-nowrap rounded-md px-2 py-1 transition-colors sm:my-3 ${tab.selected
                  ? "bg-bgmain"
                  : ""
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-66px)] bg-bgmain p-3 sm:p-4">{children}</main>
    </>
  );
}
