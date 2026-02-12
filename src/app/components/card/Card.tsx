import { ImportStatus } from "@/lib/types/types";
import { FcApproval, FcHighPriority, FcMediumPriority, FcComboChart } from "react-icons/fc";
import { useTranslations } from "use-intl";
import Box from "../box/Box";

type CardProps = {
    status: ImportStatus;
    numberOfImports?: number;
};

function Card({ status, numberOfImports }: CardProps) {
    const t = useTranslations();

    const getIcon = () => {
        switch (status) {
            case ImportStatus.ALL:
                return <FcComboChart className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" />;
            case ImportStatus.PENDING:
                return <FcMediumPriority className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" />;
            case ImportStatus.FAILED:
                return <FcHighPriority className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" />;
            case ImportStatus.COMPLETED:
                return <FcApproval className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" />;
            default:
                return null;
        }
    };

    return (
        <Box classname="w-full flex flex-col items-center text-center">
            {getIcon()}
            <h2 className="mt-3 text-xl font-semibold sm:mt-4 sm:text-2xl">{numberOfImports}</h2>
            <span className="text-lg text-gray-500 sm:text-2xl">{t(`imports.filterOptions.${status}`)}</span>
        </Box>
    );
}

export default Card;
