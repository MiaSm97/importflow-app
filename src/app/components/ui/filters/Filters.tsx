import { ImportFilter } from "@/lib/types/types";
import { IoFilter } from "react-icons/io5";
import Input from "../input/Input";
import { useTranslations } from "next-intl";

type FiltersProps = {
    filter: ImportFilter;
    setFilter: React.Dispatch<React.SetStateAction<ImportFilter>>;
    decreasing: boolean;
    setDecreasing: React.Dispatch<React.SetStateAction<boolean>>;
    isMobile?: boolean;
}

function Filters({ filter, setFilter, decreasing, setDecreasing, isMobile = false }: FiltersProps) {
    const t = useTranslations();

    return (
        <>
            <Input
                value={filter}
                type="select"
                className={isMobile ? "w-full" : "w-[16%] pr-2"}
                classNameInput={isMobile ? "h-9 py-0 text-sm" : "py-1!"}
                onChange={(e) => setFilter(e.target.value as ImportFilter)}
            >
                <option value={ImportFilter.UPDATEDAT}>{t("imports.filterOptions.updatedAt")}</option>
                <option value={ImportFilter.NAME}>{t("imports.filterOptions.name")}</option>
                <option value={ImportFilter.STATUS}>{t("imports.filterOptions.status")}</option>
            </Input>
            <button
                type="button"
                className="shrink-0 px-2 rounded-md border border-textGray flex items-center justify-center cursor-pointer bg-white"
                onClick={() => setDecreasing((prev) => !prev)}
            >
                <IoFilter className={`text-black transition-transform duration-200 ${!decreasing ? "rotate-180" : "rotate-0"}`} />
            </button>
        </>
    );
}

export default Filters;
