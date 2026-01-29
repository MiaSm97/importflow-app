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
      <header className="flex border-b-custom">
        <div className='flex px-4 gap-8'>
          <h1 className="font-medium py-4 text-[22px]">
            {optionsMenu.title}
          </h1>
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={tab.onClick}
                type="button"
                className={`cursor-pointer my-3 px-2 rounded-md transition-colors ${tab.selected
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

      <main className="p-4 bg-bgmain h-[calc(100vh-66px)]">{children}</main>
    </>
  );
}
