import { Import } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import TablePages from "./TablePages";
import { useEffect, useState } from "react";
import { getColor } from "@/lib/commonFunctions";
import Box from "../box/Box";
import { CiExport } from "react-icons/ci";

type ImportsTableProps = {
    imports: Import[];
    onExport?: () => void;
};

function ImportsTable({ imports, onExport }: ImportsTableProps) {
    const t = useTranslations();
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(imports.length / itemsPerPage));
    const paginatedImports = imports.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    return (
        <Box classname="flex flex-col p-0!">
            {onExport &&
                <div className="flex flex-col justify-between gap-2 border-b-custom p-4 sm:flex-row sm:items-center sm:p-6">
                    <h2 className="text-xl font-semibold sm:text-[22px]">{t("imports.latestImports")}</h2>
                    <div className="flex gap-2 items-center cursor-pointer" onClick={onExport}>
                        <CiExport />
                        <span className="text-textGray">{t("imports.buttons.export")}</span>
                    </div>
                </div>
            }
            <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                    <div className="flex w-full border-b-custom px-4 pb-4 pt-4 text-textGray sm:px-6">
                        <span className="w-[35%]">{t("imports.table.name")}</span>
                        <span className="w-[25%]">{t("imports.table.status")}</span>
                        <span className="w-[15%]">{t("imports.table.progress")}</span>
                        <span className="w-[25%]">{t("imports.table.updatedAt")}</span>
                    </div>
                    {paginatedImports.map((importItem) => (
                        <div key={importItem.id} className="flex w-full items-center border-b-custom px-4 py-3 text-sm sm:px-6">
                            <span className="w-[35%] truncate pr-2">{importItem.name}</span>
                            <span className="w-[25%]">
                                <span
                                    className="inline-flex rounded-md px-3 py-1"
                                    style={{ backgroundColor: getColor(importItem.status) }}
                                >
                                    {t(`imports.status.${importItem.status.toLowerCase()}`)}
                                </span>
                            </span>
                            <span className="w-[15%]">{`${importItem.progress ?? 100}%`}</span> {/* For demo purposes, we set progress to 100% directly */}
                            <span className="w-[25%]">{new Date(importItem.updatedAt).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
            {
                imports.length > itemsPerPage &&
                <TablePages currentPage={page} totalPages={totalPages} onNextPageChange={() => setPage(prev => Math.min(totalPages, prev + 1))} onPreviousPageChange={() => setPage(prev => Math.max(1, prev - 1))} />
            }
        </Box>
    );
}

export default ImportsTable;
