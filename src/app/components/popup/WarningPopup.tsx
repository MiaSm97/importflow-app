import { useTranslations } from "next-intl";
import Button from "../ui/button/Button";
import Box from "../box/Box";

type WarningPopupProps = {
    toggle: () => void;
    onSubmit: () => void;
}

function WarningPopup({ toggle, onSubmit }: WarningPopupProps) {
    const t = useTranslations();

    return (
        <Box classname="flex border-none! flex-col gap-5 sm:gap-6">
            <h2 className="text-textAlert text-center text-[22px] font-bold">
                {t('warning.title').toUpperCase()}
            </h2>
            <p className="text-center">{t('warning.description')}</p>
            <div className="border-t-custom flex flex-col-reverse gap-2 px-4 pb-4 pt-5 sm:flex-row sm:px-6 sm:pb-0 sm:pt-6">
                <Button classname="w-full" label={t("imports.buttons.cancel")} type="secondary" onClick={toggle} />
                <Button classname="w-full" label={t("imports.buttons.delete")} onClick={onSubmit} />
            </div>
        </Box>
    );
}

export default WarningPopup;
