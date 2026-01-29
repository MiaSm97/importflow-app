import { useTranslations } from 'next-intl';

type TProps = {
  id: string;
  ns?: string;
  values?: Record<string, any>;
}

export default function T({ id, ns, values }: TProps) {
  const t = useTranslations(ns);
  return <>{t(id, values)}</>;
}
