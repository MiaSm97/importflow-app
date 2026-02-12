import { useTranslations } from 'use-intl';
import Box from '../box/Box';
import Button from '../ui/button/Button';
import { useRouter } from 'next/navigation';

export default function DashboardEmpty() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Box classname="w-full">
      <h2 className="text-lg font-semibold text-textDark">
        {t("dashboard.empty.title")}
      </h2>
      <p className="mt-2 text-sm text-textGray">
        {t("dashboard.empty.description")}
      </p>
      <Button
        classname="mt-6 w-fit px-4 py-2 text-sm font-semibold"
        label={t("dashboard.empty.cta")}
        onClick={() => router.push('/imports')}
      />
    </Box>
  );
}
