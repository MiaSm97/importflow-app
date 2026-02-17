'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMenu } from '@/lib/context/MenuContext';
import { redirectToSection } from '@/lib/navigation';
import { Sections } from '@/lib/types/types';
import { useTranslations } from 'next-intl';
import Loading from './loading/Loading';
import Button from './ui/button/Button';

export default function Menu({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { optionsMenu, isLoading } = useMenu();

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
    <div className="flex h-full flex-col">
      <header className="flex border-b-custom bg-white shadow-sm">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-8 sm:py-0">
          <h1 className="text-[20px] font-medium sm:py-4 sm:text-[22px]">
            {optionsMenu.title}
          </h1>
          <nav className="flex flex-wrap pb-1 sm:pb-0">
            {tabs.map((tab) => (
              <Button
                key={tab.label}
                classname={`w-[100px] ${!tab.selected ? 'border-none!' : ''}`}
                label={tab.label}
                type={tab.selected ? 'primary' : 'secondary'}
                onClick={tab.onClick}
              />
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-bgmain p-3 sm:p-4">{children}</main>
      {isLoading && <Loading />}
    </div>
  );
}
