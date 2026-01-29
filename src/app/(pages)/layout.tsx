import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Menu from '@/app/components/Menu';
import MenuProvider from '@/lib/context/MenuContext';

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <MenuProvider>
        <Menu>{children}</Menu>
      </MenuProvider>
    </NextIntlClientProvider>
  );
}
