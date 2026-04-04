import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface PlaceholderPageProps {
  readonly title: string;
}

const PlaceholderPageComponent = memo(function PlaceholderPage({ title }: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-2xl font-bold text-[#2C2440] dark:text-[#EDE8FA] mb-2">
        {t(`nav.${title}`)}
      </h1>
      <p className="text-[#6A627F] dark:text-[#B9B0D3]">
        {t('placeholder.comingSoon')}
      </p>
    </div>
  );
});

PlaceholderPageComponent.displayName = 'PlaceholderPage';

export const PlaceholderPage = PlaceholderPageComponent;
