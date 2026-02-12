'use client';

import { useRouter } from "next/navigation";
import { TiWarning } from "react-icons/ti";
import { useTranslations } from "use-intl";
import Box from "../box/Box";

function WarmingBanner() {
    const t = useTranslations();
    const router = useRouter();

    return (
        <Box classname="flex bg-amber-100! w-full items-start">
            <TiWarning className="w-6 h-6 text-yellow-800 mr-2" />
            <div className="flex w-full flex-col">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-yellow-800">{t("dashboard.warning.title")}</span>
                    <span className="cursor-pointer text-bgBlue" onClick={() => router.push("/imports")}>{t("dashboard.warning.cta")}</span>
                </div>
                <span className="text-yellow-800">{t("dashboard.warning.description")}</span>
            </div>
        </Box>
    );
}

export default WarmingBanner;
