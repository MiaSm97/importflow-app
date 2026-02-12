import Box from '../box/Box';
import Button from '../ui/button/Button';
import { useTranslations } from 'use-intl';

type ImportsEmptyProps = {
  onCtaClick: () => void;
};

export default function ImportsEmpty({ onCtaClick }: ImportsEmptyProps) {
  const t = useTranslations();

  return (
    <Box classname="w-full">
      <h2 className="text-lg font-semibold text-textDark">
        {t("imports.empty.title")}
      </h2>
      <p className="mt-2 text-sm text-textGray">
        {t("imports.empty.description")}
      </p>
      <Button
        classname="mt-6 w-fit px-4 py-2 text-sm font-semibold"
        label={t("imports.empty.cta")}
        onClick={onCtaClick}
      />
    </Box>
  );
}
